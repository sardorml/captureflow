import { onMessage, sendMessage } from "@/lib/messaging";
import { saveSpikeResult, setSpikeStatus } from "@/lib/storage";

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

async function reportFailure(message: string): Promise<void> {
  console.error("[CaptureFlow] startSpike failed:", message);
  await saveSpikeResult({
    ok: false,
    mimeType: "",
    bytes: 0,
    durationMs: 0,
    error: message,
  });
}

export default defineBackground(() => {
  console.log("[CaptureFlow] background service worker started");

  onMessage("startSpike", async () => {
    console.log("[CaptureFlow] startSpike received");
    try {
      await setSpikeStatus({ kind: "preparing" });
      await ensureOffscreenDocument();
      // The offscreen doc calls getDisplayMedia, which shows Chrome's native
      // Screen/Window/Tab picker. chrome.desktopCapture is avoided: from a
      // service worker it requires a targetTab whose stream the offscreen
      // document cannot consume.
      console.log("[CaptureFlow] offscreen ready; requesting display media");
      await sendMessage("beginCapture", undefined);
    } catch (error) {
      await reportFailure(
        error instanceof Error ? error.message : String(error),
      );
    }
  });

  onMessage("spikeStatus", ({ data }) => setSpikeStatus(data));

  onMessage("spikeResult", async ({ data }) => {
    await saveSpikeResult(data);
    await setSpikeStatus({
      kind: data.ok ? "done" : "error",
      detail: data.error,
    });
  });
});
