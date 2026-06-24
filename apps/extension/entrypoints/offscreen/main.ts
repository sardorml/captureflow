import { onMessage, sendMessage } from "@/lib/messaging";
import { pickScreenMimeType } from "@/lib/capture/pick-mime-type";

// Phase-0 spike: capture a few seconds to prove the
// getDisplayMedia → MediaRecorder path works inside an offscreen document.
// Phase 1 replaces the fixed timer with real start/stop control.
const SPIKE_DURATION_MS = 5000;

function recordForDuration(
  stream: MediaStream,
  mimeType: string,
  ms: number,
): Promise<number> {
  return new Promise((resolve, reject) => {
    let totalBytes = 0;
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined,
    );
    recorder.ondataavailable = (event) => {
      totalBytes += event.data.size;
    };
    recorder.onerror = () => reject(new Error("MediaRecorder failed"));
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve(totalBytes);
    };
    recorder.start(1000);
    setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, ms);
  });
}

onMessage("beginCapture", async () => {
  console.log("[CaptureFlow] offscreen beginCapture");
  const startedAt = Date.now();
  try {
    // Shows Chrome's native Screen/Window/Tab picker. Works in an offscreen
    // document created with the DISPLAY_MEDIA reason; the spec's
    // user-activation requirement isn't enforced for offscreen docs.
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
    await sendMessage("spikeStatus", { kind: "recording" });
    const { mimeType } = pickScreenMimeType();
    console.log(
      "[CaptureFlow] recording",
      SPIKE_DURATION_MS,
      "ms as",
      mimeType,
    );
    const bytes = await recordForDuration(stream, mimeType, SPIKE_DURATION_MS);
    await sendMessage("spikeResult", {
      ok: bytes > 0,
      mimeType: mimeType || "(browser default)",
      bytes,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    await sendMessage("spikeResult", {
      ok: false,
      mimeType: "",
      bytes: 0,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
