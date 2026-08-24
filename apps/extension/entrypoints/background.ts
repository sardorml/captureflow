import {
  onMessage,
  sendMessage,
  type CaptureContext,
  type StartResult,
} from "@/lib/messaging";
import {
  getActiveUpload,
  getCapturePrefs,
  getRecordingStatus,
  saveRecordingResult,
  setActiveUpload,
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
  RECORDER_BACKDROP_ID,
  RECORDER_FRAME_ID,
  removeRecorderOverlay,
  setRecorderOverlayHeight,
  setRecorderOverlayVisible,
  toggleRecorderOverlay,
} from "@/lib/overlay/recorder-overlay";

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

// Restricted pages (chrome://, web store, new tab) can't host the in-page bubble,
// so fall back to a grant tab; either way it seeds the grant the recorder reuses.
async function setCameraBubble(on: boolean, mic: boolean): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return;

  if (!on) {
    await setCameraBlocked(false);
    await removeBubble(tab.id);
    if (bubbleTabId !== undefined && bubbleTabId !== tab.id) {
      await removeBubble(bubbleTabId);
    }
    bubbleTabId = undefined;
    return;
  }

  const params = new URLSearchParams();
  if (mic) params.set("audio", "1");
  if (isInjectable(tab.url)) {
    const frameUrl = chrome.runtime.getURL(`bubble.html?${params}`);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: mountCameraBubble,
      args: [frameUrl, BUBBLE_FRAME_ID],
    });
    bubbleTabId = tab.id;
  } else {
    params.set("video", "1");
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`permissions.html?${params}`),
    });
  }
}

// One camera can't be opened twice: release the preview before the recorder
// opens the same device, else its getUserMedia throws and the webcam is dropped.
async function releaseCameraBubble(): Promise<void> {
  if (bubbleTabId === undefined) return;
  await removeBubble(bubbleTabId);
  bubbleTabId = undefined;
}

// Tab hosting the invisible camera+mic grant frame (one combined prompt).
let grantTabId: number | undefined;

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
    ],
  });
  // A second click closes the panel, and the camera preview goes with it.
  if (injection?.result === false) {
    await releaseCameraBubble();
    overlayTabId = undefined;
    return;
  }
  overlayTabId = tab.id;
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
   * messaging layer, and it ignores this one.
   */
  chrome.runtime.onMessage.addListener((message) => {
    if (
      (message as { recorderOverlayClosed?: unknown }).recorderOverlayClosed
    ) {
      overlayTabId = undefined;
      void releaseCameraBubble();
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
   * sender per kind: auth needs the exact callback page, logout just the origin.
   */
  chrome.runtime.onMessageExternal.addListener((message, sender, respond) => {
    const parsed = parseExternalMessage(message);
    const trusted =
      parsed?.kind === "auth"
        ? isTrustedAuthSender(sender.url)
        : parsed?.kind === "logout"
          ? isTrustedWebOrigin(sender.url)
          : false;
    if (!parsed || !trusted) {
      respond({ ok: false });
      return false;
    }
    void (async () => {
      try {
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

  onMessage("setOverlayVisible", async ({ data, sender }) => {
    const target = sender?.tab?.id ?? overlayTabId;
    if (target === undefined) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: target },
        func: setRecorderOverlayVisible,
        args: [data.visible, RECORDER_FRAME_ID, RECORDER_BACKDROP_ID],
      });
    } catch {
      /* tab closed or no longer injectable */
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
      await setRecordingStatus({ kind: "preparing" });
      // The panel gets out of the way before the native picker appears, taking
      // the preview with it — one camera can't be opened twice, and the
      // recorder is about to open this one.
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
        tabStreamId,
      }).catch((error) => void reportFailure(errorMessage(error)));
      return { ok: true };
    } catch (error) {
      const message = errorMessage(error);
      await reportFailure(message);
      return { ok: false, error: message };
    }
  });

  onMessage("stopRecording", () => sendMessage("stopCapture", undefined));
  onMessage("pauseRecording", () => sendMessage("pauseCapture", undefined));
  onMessage("resumeRecording", () => sendMessage("resumeCapture", undefined));
  onMessage("restartRecording", () => sendMessage("restartCapture", undefined));
  onMessage("deleteRecording", () => sendMessage("deleteCapture", undefined));

  onMessage("recordingStatus", ({ data }) => setRecordingStatus(data));

  onMessage("activeUploadChanged", ({ data }) => setActiveUpload(data));

  onMessage("recordingResult", async ({ data }) => {
    await saveRecordingResult(data);
    await setRecordingStatus(
      data.ok ? { kind: "done" } : { kind: "error", detail: data.error },
    );
    if (data.ok) {
      // Land the user on the fresh recording page.
      await chrome.tabs.create({ url: data.url });
    } else if (data.code === "invalid_token" || data.code === "missing_token") {
      await setAuthSession(null);
    }
  });
});

async function reportFailure(message: string): Promise<void> {
  await saveRecordingResult({ ok: false, error: message });
  await setRecordingStatus({ kind: "error", detail: message });
}
