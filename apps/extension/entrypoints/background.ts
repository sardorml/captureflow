import {
  COUNTDOWN_SECONDS,
  onMessage,
  sendMessage,
  type CaptureContext,
  type CountdownResult,
  type StartResult,
} from "@/lib/messaging";
import {
  getActiveUpload,
  getBubblePosition,
  getCameraBlocked,
  getCapturePrefs,
  getRecordingStatus,
  getThemePreference,
  setActiveUpload,
  setBubblePosition,
  setCameraBlocked,
  setCapturePrefs,
  setRecordingStatus,
} from "@/lib/storage";
import { LIVE_KINDS } from "@/lib/capture/status";
import { createRecordingTransport } from "@/lib/api/client";
import {
  isTrustedAuthSender,
  isTrustedWebOrigin,
  openSignInTab,
  parseExternalMessage,
} from "@/lib/auth/handoff";
import { getAuthSession, setAuthSession } from "@/lib/auth/session";
import { reconcileAuthSession } from "@/lib/auth/sync";
import { getDeviceId } from "@/lib/auth/device-id";
import {
  BUBBLE_FRAME_ID,
  GRANT_FRAME_ID,
  mountCameraBubble,
  mountGrantFrame,
  unmountCameraBubble,
} from "@/lib/overlay/camera-bubble";
import {
  COUNTDOWN_OVERLAY_ID,
  mountCountdownOverlay,
  unmountCountdownOverlay,
} from "@/lib/overlay/countdown-overlay";
import {
  RECORDER_BACKDROP_ID,
  RECORDER_FRAME_ID,
  removeRecorderOverlay,
  setRecorderOverlayHeight,
  CONTROL_BAR_HOST_ID,
  setRecorderBackdropTheme,
  setRecorderOverlayVisible,
  toggleRecorderOverlay,
} from "@/lib/overlay/recorder-overlay";
import {
  AREA_SELECT_ID,
  isPageArea,
  selectPageArea,
} from "@/lib/overlay/area-select";

// Everything the extension puts on a page, hidden together for a capture.
const PAGE_CHROME_IDS = [
  RECORDER_FRAME_ID,
  RECORDER_BACKDROP_ID,
  BUBBLE_FRAME_ID,
  CONTROL_BAR_HOST_ID,
];

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

const OFFSCREEN_URL = "offscreen.html";

function isInjectable(url: string | undefined): boolean {
  return url !== undefined && /^https?:\/\//.test(url);
}

// Tab hosting the bubble, tracked so it can be torn down after a tab switch.
let bubbleTabId: number | undefined;

async function removeBubble(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: unmountCameraBubble,
      args: [BUBBLE_FRAME_ID],
    });
  } catch {
    /* tab closed or no longer injectable */
  }
}

// Mounts the bubble in the tab, or re-points the one already there, where it
// was last dragged to.
async function mountBubble(
  tabId: number,
  params: URLSearchParams,
): Promise<void> {
  if (bubbleTabId !== undefined && bubbleTabId !== tabId) {
    await removeBubble(bubbleTabId);
  }
  const frameUrl = chrome.runtime.getURL(`bubble.html?${params}`);
  await chrome.scripting.executeScript({
    target: { tabId },
    func: mountCameraBubble,
    args: [frameUrl, BUBBLE_FRAME_ID, await getBubblePosition()],
  });
  bubbleTabId = tabId;
}

/*
 * The bubble stays up while the panel is open: live when the camera is on, a
 * placeholder where it will be when it's off. Restricted pages (chrome://,
 * web store, new tab) can't host it, so a camera turned on there falls back
 * to a grant tab; either way it seeds the grant the recorder reuses.
 */
async function setCameraBubble(on: boolean, mic: boolean): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return;

  if (!on) await setCameraBlocked(false);
  const params = new URLSearchParams();
  if (on) params.set("camera", "1");
  if (on && mic) params.set("audio", "1");
  if (isInjectable(tab.url)) {
    await mountBubble(tab.id, params);
  } else if (on) {
    params.set("video", "1");
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`permissions.html?${params}`),
    });
  }
}

const CONTROL_BAR_SCRIPT = "content-scripts/control-bar.js";

// The control bar previews on the page while the panel is open. A tab loaded
// before the extension was installed or updated has no content script to hear
// this, so it gets the script and is told again; a restricted page gets no bar.
async function setPanelPreview(tabId: number, on: boolean): Promise<void> {
  try {
    await sendMessage("panelPreview", on, tabId);
    return;
  } catch {
    if (!on) return;
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [CONTROL_BAR_SCRIPT],
    });
    await sendMessage("panelPreview", on, tabId);
  } catch {
    /* restricted page */
  }
}

// One camera can't be opened twice: release the preview before the recorder
// opens the same device, else its getUserMedia throws and the webcam is dropped.
async function releaseCameraBubble(): Promise<void> {
  if (bubbleTabId === undefined) return;
  await removeBubble(bubbleTabId);
  bubbleTabId = undefined;
}

/*
 * The recording's camera bubble floats in a Picture-in-Picture window of the
 * recording tab, where the capture can't see it. The window only opens on
 * the Start press's gesture, so this runs first and fast; a tab without the
 * content script gets it injected, and a tab that can't open the window
 * records without a bubble.
 */
let recordingWindowTabId: number | undefined;

async function openRecordingWindow(tabId: number | undefined): Promise<void> {
  recordingWindowTabId = undefined;
  if (tabId === undefined) return;
  let opened = false;
  try {
    opened = await sendMessage("openRecordingWindow", undefined, tabId);
  } catch {
    /* no content script yet */
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: [CONTROL_BAR_SCRIPT],
      });
      opened = await sendMessage("openRecordingWindow", undefined, tabId);
    } catch {
      /* restricted page */
    }
  }
  if (opened) recordingWindowTabId = tabId;
}

// Out of a tab's capture, but on the screen: a whole-screen recording would
// film the window, so it goes and the camera stays a separate track.
async function closeRecordingWindowIfInShot(
  surface: string | null,
): Promise<void> {
  const tabId = recordingWindowTabId;
  if (surface !== "monitor" || tabId === undefined) return;
  recordingWindowTabId = undefined;
  try {
    await sendMessage("closeRecordingWindow", undefined, tabId);
  } catch {
    /* tab gone */
  }
}

// Tab hosting the invisible camera+mic grant frame (one combined prompt).
let grantTabId: number | undefined;

// Pending pre-roll resolver; the overlay's skip/cancel raw message settles it
// early, the worker's own clock settles it otherwise.
let countdownSettle: ((result: CountdownResult) => void) | undefined;

async function runPageCountdown(): Promise<CountdownResult> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // Restricted pages can't host the overlay — start without a countdown.
  if (tab?.id === undefined || !isInjectable(tab.url)) return "go";
  const tabId = tab.id;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: mountCountdownOverlay,
      args: [
        COUNTDOWN_SECONDS,
        COUNTDOWN_OVERLAY_ID,
        await getThemePreference(),
      ],
    });
  } catch {
    return "go";
  }
  void sendMessage("countdownStarted", undefined).catch(() => {});
  // The worker owns the clock; the overlay only displays it. First settle
  // wins — a late page message after the timeout resolves into a no-op.
  const result = await new Promise<CountdownResult>((resolve) => {
    countdownSettle = resolve;
    setTimeout(() => resolve("go"), COUNTDOWN_SECONDS * 1000);
  });
  countdownSettle = undefined;
  // Self-removed page-side in the normal flow; sweep the race remainder.
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: unmountCountdownOverlay,
      args: [COUNTDOWN_OVERLAY_ID],
    });
  } catch {
    /* tab closed or no longer injectable */
  }
  return result;
}

async function requestMediaGrant(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return;
  if (isInjectable(tab.url)) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: mountGrantFrame,
      args: [chrome.runtime.getURL("bubble.html?grant=1"), GRANT_FRAME_ID],
    });
    grantTabId = tab.id;
  } else {
    await chrome.tabs.create({
      url: chrome.runtime.getURL("permissions.html?video=1&audio=1"),
    });
  }
}

async function removeGrantFrame(): Promise<void> {
  if (grantTabId === undefined) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: grantTabId },
      func: unmountCameraBubble,
      args: [GRANT_FRAME_ID],
    });
  } catch {
    /* tab closed or no longer injectable */
  }
  grantTabId = undefined;
}

// One long-lived offscreen document runs getDisplayMedia + MediaRecorder;
// creating a second silently kills the first, so always guard on hasDocument().
async function ensureOffscreenDocument(): Promise<void> {
  if (await chrome.offscreen.hasDocument()) return;
  // Reason string literals — NOT chrome.offscreen.Reason.*, which isn't a
  // runtime object. DISPLAY_MEDIA permits getDisplayMedia in the offscreen doc.
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ["DISPLAY_MEDIA", "USER_MEDIA"],
    justification: "Record the selected screen, window, or tab.",
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// chrome.runtime's wording when nothing is listening on the other end.
const NO_RECEIVER =
  /Receiving end does not exist|Could not establish connection/i;

/*
 * The tab source records straight from a stream id, so Chrome never shows the
 * "Choose what to share" step. Resolved against the tab the user is on, before
 * the overlay is torn down. Any failure falls back to the picker rather than
 * blocking the start.
 */
async function tabStreamIdFor(tabId: number | undefined): Promise<undefined>;
async function tabStreamIdFor(tabId: number): Promise<string | undefined>;
async function tabStreamIdFor(
  tabId: number | undefined,
): Promise<string | undefined> {
  if (tabId === undefined || !chrome.tabCapture?.getMediaStreamId) {
    return undefined;
  }
  try {
    return await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });
  } catch {
    return undefined;
  }
}

/*
 * createDocument() resolves once the document exists, not once its module has
 * run and registered onMessage — the first send lands in that gap and rejects
 * with "Receiving end does not exist", which surfaced as a failed start.
 */
async function beginCaptureWhenReady(ctx: CaptureContext): Promise<void> {
  const attempts = 20;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await sendMessage("beginCapture", ctx);
      return;
    } catch (error) {
      if (attempt === attempts || !NO_RECEIVER.test(errorMessage(error))) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

// Tab hosting the in-page recorder overlay.
let overlayTabId: number | undefined;

// Standalone panel window, the restricted-page fallback. It closes itself, so
// the only notice of it is chrome.windows.onRemoved.
let panelWindowId: number | undefined;

/*
 * The recorder opens as an extension iframe floating over a blurred page,
 * injected on toolbar click (there is no anchored action popup).
 * Restricted pages can't host it, so they get a standalone popup window.
 */
async function toggleOverlayOnActiveTab(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return;
  if (!isInjectable(tab.url)) {
    const win = await chrome.windows.create({
      url: chrome.runtime.getURL("popup.html?window=1"),
      type: "popup",
      width: 332,
      height: 640,
    });
    panelWindowId = win?.id;
    return;
  }
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleRecorderOverlay,
    args: [
      chrome.runtime.getURL("popup.html?overlay=1"),
      RECORDER_FRAME_ID,
      RECORDER_BACKDROP_ID,
      await getThemePreference(),
    ],
  });
  // A second click closes the panel, and the camera preview goes with it.
  if (injection?.result === false) {
    await releaseCameraBubble();
    await setPanelPreview(tab.id, false);
    overlayTabId = undefined;
    return;
  }
  overlayTabId = tab.id;
  await setPanelPreview(tab.id, true);
  // The placeholder bubble; the panel swaps in the live camera if it's on.
  await mountBubble(tab.id, new URLSearchParams());
}

/*
 * The camera preview belongs to the panel, not to the page: it's a live
 * getUserMedia stream in an injected frame, so leaving it behind keeps the
 * camera light on long after the panel is gone.
 */
async function closeRecorderOverlay(tabId?: number): Promise<void> {
  await releaseCameraBubble();
  const target = tabId ?? overlayTabId;
  if (target === undefined) return;
  await setPanelPreview(target, false);
  try {
    await chrome.scripting.executeScript({
      target: { tabId: target },
      func: removeRecorderOverlay,
      args: [RECORDER_FRAME_ID, RECORDER_BACKDROP_ID],
    });
  } catch {
    /* tab closed or no longer injectable */
  }
  if (target === overlayTabId) overlayTabId = undefined;
}

async function onActionClicked(): Promise<void> {
  const session = await getAuthSession();
  if (!session) {
    await openSignInTab();
    return;
  }
  // Mid-recording the panel stays shut: the bar on the page is where the
  // recording is stopped, and the click points at it.
  const status = await getRecordingStatus();
  if (status.kind === "recording" || status.kind === "paused") {
    const tabId = await activeTabId();
    if (tabId !== undefined) {
      await sendMessage("nudgeControlBar", undefined, tabId).catch(() => {});
    }
    return;
  }
  await toggleOverlayOnActiveTab();
}

/*
 * Live state with no offscreen document means the browser (or the offscreen
 * doc) died mid-recording. The status outlives that crash now that it is kept
 * in local:, so without this the control bar would stay pinned to every page.
 * An upload marker also has a server-side multipart to release so it doesn't
 * sit against the user's quota; /api/r/abort authorizes by device id.
 */
async function sweepStaleRecording(): Promise<void> {
  const [stale, status] = await Promise.all([
    getActiveUpload(),
    getRecordingStatus(),
  ]);
  if (!stale && !LIVE_KINDS.has(status.kind)) return;
  if (await chrome.offscreen.hasDocument()) return;
  if (stale) {
    await setActiveUpload(null);
    const transport = createRecordingTransport(stale.deviceId, null);
    await transport.abort({ slug: stale.slug }).catch(() => {});
  }
  await setRecordingStatus({ kind: "idle" });
}

export default defineBackground(() => {
  void sweepStaleRecording();

  chrome.action.onClicked.addListener(() => void onActionClicked());

  /*
   * The overlay's backdrop closes the panel page-side, so this raw message is
   * the only notice the worker gets. Foreign shapes are ignored by the typed
   * messaging layer, and it ignores this one. The tab comes from the sender:
   * the worker may have been put to sleep since the panel opened, taking the
   * tab it remembered with it.
   */
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (
      (message as { recorderOverlayClosed?: unknown }).recorderOverlayClosed
    ) {
      const tabId = sender.tab?.id ?? overlayTabId;
      overlayTabId = undefined;
      if (tabId !== undefined) {
        void setPanelPreview(tabId, false);
        void removeBubble(tabId);
        if (bubbleTabId === tabId) bubbleTabId = undefined;
      } else {
        void releaseCameraBubble();
      }
    }
    const moved = (message as { bubbleMoved?: unknown }).bubbleMoved;
    if (
      typeof moved === "object" &&
      moved !== null &&
      typeof (moved as { left?: unknown }).left === "number" &&
      typeof (moved as { top?: unknown }).top === "number"
    ) {
      void setBubblePosition(moved as { left: number; top: number });
    }
    if ("captureflowArea" in (message as object)) {
      const area = (message as { captureflowArea: unknown }).captureflowArea;
      void sendMessage("areaSelected", isPageArea(area) ? area : null).catch(
        () => {},
      );
    }
    const verdict = (message as { captureflowCountdown?: unknown })
      .captureflowCountdown;
    if (verdict === "skip" || verdict === "cancel") {
      countdownSettle?.(verdict === "skip" ? "go" : "cancel");
    }
  });

  chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId !== panelWindowId) return;
    panelWindowId = undefined;
    void releaseCameraBubble();
  });

  /*
   * The web app posts auth (from the callback page) and logout (from any of its
   * pages) here. externally_connectable can't gate by path/port, so re-check the
   * sender per kind: auth needs the exact callback page; logout and record just
   * the origin.
   */
  chrome.runtime.onMessageExternal.addListener((message, sender, respond) => {
    const parsed = parseExternalMessage(message);
    const trusted =
      parsed?.kind === "auth"
        ? isTrustedAuthSender(sender.url)
        : parsed?.kind === "logout" || parsed?.kind === "record"
          ? isTrustedWebOrigin(sender.url)
          : false;
    if (!parsed || !trusted) {
      respond({ ok: false });
      return false;
    }
    void (async () => {
      try {
        if (parsed.kind === "record") {
          /*
           * The dashboard's own "New recording" button. Answer first: the panel
           * takes over the tab that is waiting on this, and the page needs the
           * yes in order not to fall through to the store listing.
           */
          respond({ ok: true });
          await toggleOverlayOnActiveTab();
          return;
        }
        if (parsed.kind === "logout") {
          await setAuthSession(null);
        } else {
          await setAuthSession(parsed.session);
          // Answer before closing the callback tab — removing it first destroys
          // the page that's waiting on the response.
          respond({ ok: true });
          const tabId = sender.tab?.id;
          if (tabId !== undefined) {
            try {
              await chrome.tabs.remove(tabId);
            } catch {
              /* tab already closed */
            }
          }
          return;
        }
        respond({ ok: true });
      } catch {
        respond({ ok: false });
      }
    })();
    return true; // respond() is called asynchronously
  });

  onMessage("openSignIn", () => openSignInTab());

  onMessage("signOut", () => setAuthSession(null));

  // The web-origin content script's reading of who this browser is signed in
  // as. Its matches already bound the sender; re-check anyway, since acting on
  // it can sign the user out.
  onMessage("hasAuthSession", async () => (await getAuthSession()) !== null);

  onMessage("webSession", async ({ data, sender }) => {
    if (!isTrustedWebOrigin(sender?.url)) return;
    await reconcileAuthSession(data);
  });

  onMessage("setCameraBubble", ({ data }) =>
    setCameraBubble(data.on, data.mic),
  );

  onMessage("ensureMediaGrant", () => requestMediaGrant());

  onMessage("closeRecorderOverlay", ({ sender }) =>
    closeRecorderOverlay(sender?.tab?.id),
  );

  onMessage("setOverlayTheme", async ({ data, sender }) => {
    const target = sender?.tab?.id ?? overlayTabId;
    if (target === undefined) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: target },
        func: setRecorderBackdropTheme,
        args: [data, RECORDER_BACKDROP_ID],
      });
    } catch {
      /* tab closed or no longer injectable */
    }
  });

  onMessage("setOverlayVisible", async ({ data, sender }) => {
    const target = sender?.tab?.id ?? overlayTabId;
    if (target === undefined) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: target },
        func: setRecorderOverlayVisible,
        args: [data.visible, PAGE_CHROME_IDS],
      });
    } catch {
      /* tab closed or no longer injectable */
    }
  });

  onMessage("panelMode", async ({ data, sender }) => {
    const tabId = sender?.tab?.id ?? overlayTabId;
    if (tabId === undefined) return;
    if (data === "screenshot") {
      await setPanelPreview(tabId, false);
      await releaseCameraBubble();
      return;
    }
    await setPanelPreview(tabId, true);
    const prefs = await getCapturePrefs();
    // A blocked camera gets the placeholder: setCameraBubble(false) would
    // clear the flag the blocked notice reads.
    if (await getCameraBlocked()) {
      await mountBubble(tabId, new URLSearchParams());
      return;
    }
    await setCameraBubble(prefs.camera, prefs.mic);
  });

  onMessage("selectArea", async ({ sender }) => {
    const target = sender?.tab?.id ?? overlayTabId ?? (await activeTabId());
    if (target === undefined) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: target },
        func: selectPageArea,
        args: [AREA_SELECT_ID],
      });
    } catch {
      /* restricted page */
    }
  });

  onMessage("setOverlayHeight", async ({ data, sender }) => {
    const target = sender?.tab?.id ?? overlayTabId;
    if (target === undefined) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: target },
        func: setRecorderOverlayHeight,
        args: [data.height, RECORDER_FRAME_ID],
      });
    } catch {
      /* tab closed or no longer injectable */
    }
  });

  // One combined prompt granted → both devices flip on and the live bubble
  // appears. A dismissed prompt changes nothing.
  onMessage("mediaGrantResult", async ({ data }) => {
    await removeGrantFrame();
    if (data.granted) {
      await setCameraBlocked(false);
      const prefs = await getCapturePrefs();
      await setCapturePrefs({ ...prefs, camera: true, mic: true });
      await setCameraBubble(true, true);
    } else if (data.denied) {
      await setCameraBlocked(true);
    }
  });

  // The bubble's getUserMedia result is the source of truth for camera access.
  onMessage("cameraStatus", async ({ data }) => {
    await setCameraBlocked(data.blocked);
    if (data.blocked) {
      const prefs = await getCapturePrefs();
      // A blocked camera doesn't take the mic down — it records standalone now.
      if (prefs.camera) await setCapturePrefs({ ...prefs, camera: false });
      await releaseCameraBubble();
    }
  });

  onMessage("startRecording", async (): Promise<StartResult> => {
    try {
      const session = await getAuthSession();
      if (!session) return { ok: false, error: "Sign in to record." };
      const deviceId = await getDeviceId();
      const prefs = await getCapturePrefs();
      // Resolved before the overlay closes, while the target tab is still the
      // active one.
      const [activeTab] =
        prefs.source === "tab"
          ? await chrome.tabs.query({ active: true, currentWindow: true })
          : [undefined];
      const tabStreamId =
        activeTab?.id === undefined
          ? undefined
          : await tabStreamIdFor(activeTab.id);
      // A whole-screen recording would film the window, so it never opens
      // for that source; the picker's result still closes it in case a
      // screen was picked from another pane.
      if (
        prefs.camera &&
        prefs.source !== "screen" &&
        !(await getCameraBlocked())
      ) {
        await openRecordingWindow(overlayTabId ?? (await activeTabId()));
      }
      await setRecordingStatus({ kind: "preparing" });
      // The panel gets out of the way before the native picker appears, taking
      // the preview with it; the recording's window shows the camera once
      // capture is live.
      await closeRecorderOverlay();
      await ensureOffscreenDocument();
      // Fire-and-forget: the offscreen doc reports back via
      // recordingStatus/recordingResult.
      void beginCaptureWhenReady({
        deviceId,
        token: session.token,
        camera: prefs.camera,
        mic: prefs.mic,
        cameraId: prefs.cameraId,
        micId: prefs.micId,
        source: prefs.source,
        visibility: prefs.visibility,
        effect: prefs.effect,
        workspaceId: prefs.workspaceId,
        tabStreamId,
      }).catch((error) => void reportFailure(errorMessage(error)));
      return { ok: true };
    } catch (error) {
      const message = errorMessage(error);
      await reportFailure(message);
      return { ok: false, error: message };
    }
  });

  onMessage("runCountdown", () => runPageCountdown());
  onMessage("stopRecording", () => sendMessage("stopCapture", undefined));
  onMessage("pauseRecording", () => sendMessage("pauseCapture", undefined));
  onMessage("resumeRecording", () => sendMessage("resumeCapture", undefined));
  onMessage("restartRecording", () => sendMessage("restartCapture", undefined));
  onMessage("deleteRecording", () => sendMessage("deleteCapture", undefined));

  onMessage("capturedSurface", ({ data }) =>
    closeRecordingWindowIfInShot(data),
  );

  onMessage("recordingStatus", ({ data }) => setRecordingStatus(data));

  onMessage("activeUploadChanged", ({ data }) => setActiveUpload(data));

  // Land the user on the share page the moment stop lands; it renders a
  // pending state and swaps in the player when the tail upload finalizes.
  onMessage("finalizeStarted", async ({ data }) => {
    await chrome.tabs.create({ url: data });
  });

  onMessage("recordingResult", async ({ data }) => {
    await setRecordingStatus(
      data.ok ? { kind: "done" } : { kind: "error", detail: data.error },
    );
    if (
      !data.ok &&
      (data.code === "invalid_token" || data.code === "missing_token")
    ) {
      await setAuthSession(null);
    }
  });
});

async function reportFailure(message: string): Promise<void> {
  await setRecordingStatus({ kind: "error", detail: message });
}
