import { onMessage, sendMessage, type StartResult } from "@/lib/messaging";
import { saveRecordingResult, setRecordingStatus } from "@/lib/storage";
import { signIn, signOut } from "@/lib/auth/pairing";
import { getAuthSession } from "@/lib/auth/session";
import { getDeviceId } from "@/lib/auth/device-id";

const OFFSCREEN_URL = "offscreen.html";

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

export default defineBackground(() => {
  onMessage("startSignIn", async () => {
    try {
      await signIn();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  });

  onMessage("signOut", () => signOut());

  onMessage("startRecording", async (): Promise<StartResult> => {
    try {
      const session = await getAuthSession();
      if (!session) return { ok: false, error: "Sign in to record." };
      const deviceId = await getDeviceId();
      await setRecordingStatus({ kind: "preparing" });
      await ensureOffscreenDocument();
      // Fire-and-forget: the offscreen doc shows the picker and reports back via
      // recordingStatus/recordingResult; the popup closes when the picker takes
      // focus, so its return value is moot in practice.
      void sendMessage("beginCapture", {
        deviceId,
        token: session.token,
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
