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
  injectPermissionFrame,
  PERMISSION_FRAME_ID,
  PERMISSION_MESSAGE_SOURCE,
} from "@/lib/permissions/handshake";

const OFFSCREEN_URL = "offscreen.html";

function isInjectable(url: string | undefined): boolean {
  return url !== undefined && /^https?:\/\//.test(url);
}

// Camera/mic only prompt from a visible page (never the popup or offscreen doc).
// Prompt inside the current tab via an injected extension iframe so the grant
// belongs to the extension; restricted pages (chrome://, the web store, the new
// tab) can't host content, so fall back to opening the page as a tab.
async function requestMediaPermission(
  camera: boolean,
  mic: boolean,
): Promise<void> {
  const params = new URLSearchParams();
  if (camera) params.set("video", "1");
  if (mic) params.set("audio", "1");
  const frameUrl = chrome.runtime.getURL(`permissions.html?${params}`);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id !== undefined && isInjectable(tab.url)) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectPermissionFrame,
      args: [frameUrl, PERMISSION_FRAME_ID, PERMISSION_MESSAGE_SOURCE],
    });
  } else {
    await chrome.tabs.create({ url: frameUrl });
  }
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

  onMessage("requestMediaPermission", ({ data }) =>
    requestMediaPermission(data.camera, data.mic),
  );

  onMessage("startRecording", async (): Promise<StartResult> => {
    try {
      const session = await getAuthSession();
      if (!session) return { ok: false, error: "Sign in to record." };
      const deviceId = await getDeviceId();
      const prefs = await getCapturePrefs();
      await setRecordingStatus({ kind: "preparing" });
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
