import { onMessage, sendMessage, type StartResult } from "@/lib/messaging";
import {
  getCapturePrefs,
  saveRecordingResult,
  setRecordingStatus,
} from "@/lib/storage";
import {
  isTrustedAuthSender,
  openSignInTab,
  parseExternalAuth,
} from "@/lib/auth/handoff";
import {
  getAuthSession,
  setAuthSession,
  watchAuthSession,
} from "@/lib/auth/session";
import { getDeviceId } from "@/lib/auth/device-id";
import {
  BUBBLE_FRAME_ID,
  mountCameraBubble,
  unmountCameraBubble,
} from "@/lib/overlay/camera-bubble";

const OFFSCREEN_URL = "offscreen.html";

function isInjectable(url: string | undefined): boolean {
  return url !== undefined && /^https?:\/\//.test(url);
}

// Tab currently hosting the preview bubble, so it can be torn down even after the
// user switches tabs (and released before recording — see releaseCameraBubble).
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

// The camera preview bubble lives in the page, so the active tab must be able to
// host content. Reflect the camera on/off state there: mount the bubble (which
// also grabs the camera/mic grant the offscreen recorder reuses) or remove it.
// Restricted pages (chrome://, the web store, the new tab) can't host content,
// so fall back to a standalone grant tab — the permission is still set, just
// without a preview.
async function setCameraBubble(on: boolean, mic: boolean): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return;

  if (!on) {
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

// One physical camera can't be opened twice at once: the bubble holds it open
// for the preview, so release it before the offscreen recorder calls
// getUserMedia for the same device — otherwise the recorder's open throws and
// the webcam is silently dropped from the recording.
async function releaseCameraBubble(): Promise<void> {
  if (bubbleTabId === undefined) return;
  await removeBubble(bubbleTabId);
  bubbleTabId = undefined;
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

// Signed in → the icon opens the recorder popup; signed out → it has no popup so
// the click fires onClicked, which opens the web sign-in tab (Loom-style).
async function syncActionPopup(): Promise<void> {
  const session = await getAuthSession();
  await chrome.action.setPopup({ popup: session ? "popup.html" : "" });
}

export default defineBackground(() => {
  void syncActionPopup();
  watchAuthSession(() => void syncActionPopup());

  chrome.action.onClicked.addListener(() => void openSignInTab());

  // The web sign-in page posts the device token here after login. Only accept
  // it from the callback page itself (externally_connectable can't gate by
  // path/port), and only ever store a shape-valid token.
  chrome.runtime.onMessageExternal.addListener((message, sender, respond) => {
    const session = isTrustedAuthSender(sender.url)
      ? parseExternalAuth(message)
      : null;
    if (!session) {
      respond({ ok: false });
      return false;
    }
    void (async () => {
      try {
        await setAuthSession(session);
        const tabId = sender.tab?.id;
        if (tabId !== undefined) {
          try {
            await chrome.tabs.remove(tabId);
          } catch {
            /* tab already closed */
          }
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

  onMessage("setCameraBubble", ({ data }) =>
    setCameraBubble(data.on, data.mic),
  );

  onMessage("startRecording", async (): Promise<StartResult> => {
    try {
      const session = await getAuthSession();
      if (!session) return { ok: false, error: "Sign in to record." };
      const deviceId = await getDeviceId();
      const prefs = await getCapturePrefs();
      await setRecordingStatus({ kind: "preparing" });
      if (prefs.camera) await releaseCameraBubble();
      await ensureOffscreenDocument();
      // Fire-and-forget: the offscreen doc shows the picker and reports back via
      // recordingStatus/recordingResult; the popup closes when the picker takes
      // focus, so its return value is moot in practice.
      void sendMessage("beginCapture", {
        deviceId,
        token: session.token,
        camera: prefs.camera,
        mic: prefs.mic,
      }).catch((error) => void reportFailure(errorMessage(error)));
      return { ok: true };
    } catch (error) {
      const message = errorMessage(error);
      await reportFailure(message);
      return { ok: false, error: message };
    }
  });

  onMessage("stopRecording", () => sendMessage("stopCapture", undefined));

  onMessage("recordingStatus", ({ data }) => setRecordingStatus(data));

  onMessage("recordingResult", async ({ data }) => {
    await saveRecordingResult(data);
    await setRecordingStatus(
      data.ok ? { kind: "done" } : { kind: "error", detail: data.error },
    );
  });
});

async function reportFailure(message: string): Promise<void> {
  await saveRecordingResult({ ok: false, error: message });
  await setRecordingStatus({ kind: "error", detail: message });
}
