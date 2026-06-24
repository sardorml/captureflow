import { createShareTransport } from "../api/client";
import { startShareUpload, type ShareUpload } from "../api/upload-streamer";
import type { CaptureContext } from "../messaging";
import type { RecordingResultPayload, RecordingStatus } from "../storage";
import { pickScreenMimeType } from "./pick-mime-type";

// The server can't cap a live stream's length (no duration known at init), so
// enforce a hard client-side ceiling.
const MAX_DURATION_MS = 30 * 60 * 1000;
// MediaRecorder emits a Blob per slice; a few seconds keeps memory flat and
// starts the multipart upload while recording is still going.
const TIMESLICE_MS = 3000;

type Callbacks = {
  onStatus: (status: RecordingStatus) => void;
  onResult: (result: RecordingResultPayload) => void;
};

let active: MediaRecorder | null = null;

export function stopActiveRecording(): void {
  if (active && active.state !== "inactive") active.stop();
}

export async function recordAndUpload(
  ctx: CaptureContext,
  cb: Callbacks,
): Promise<void> {
  if (active) return; // one recording at a time

  cb.onStatus({ kind: "preparing" });

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
  } catch (err) {
    // The picker's Cancel rejects with NotAllowedError — not a real failure.
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      cb.onStatus({ kind: "cancelled" });
    } else {
      cb.onResult({ ok: false, error: errorMessage(err) });
    }
    return;
  }

  const { mimeType, contentType } = pickScreenMimeType();

  let upload: ShareUpload;
  try {
    const transport = createShareTransport(ctx.deviceId, ctx.token);
    upload = await startShareUpload(
      { contentType, source: "instant" },
      { transport },
    );
  } catch (err) {
    stopTracks(stream);
    cb.onResult({ ok: false, error: errorMessage(err) });
    return;
  }

  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType } : undefined,
  );
  active = recorder;
  const startedAt = Date.now();
  let capTimer: ReturnType<typeof setTimeout> | undefined;

  // blob.arrayBuffer() is async and parts must keep recording order, so chain
  // the pushes instead of racing them.
  let pushChain = Promise.resolve();
  recorder.ondataavailable = (event) => {
    const blob = event.data;
    if (!blob || blob.size === 0) return;
    pushChain = pushChain.then(async () => {
      upload.pushScreen(new Uint8Array(await blob.arrayBuffer()));
    });
  };

  recorder.onstart = () => cb.onStatus({ kind: "recording" });

  recorder.onstop = async () => {
    if (capTimer) clearTimeout(capTimer);
    stopTracks(stream);
    active = null;
    cb.onStatus({ kind: "uploading" });
    try {
      await pushChain;
      const { url } = await upload.finish();
      cb.onResult({
        ok: true,
        url,
        bytes: upload.screenBytes,
        durationMs: Date.now() - startedAt,
      });
    } catch (err) {
      upload.abort();
      cb.onResult({ ok: false, error: errorMessage(err) });
    }
  };

  recorder.onerror = () => stopActiveRecording();

  // The browser's native "Stop sharing" control ends the track; mirror it.
  stream.getVideoTracks()[0]?.addEventListener("ended", stopActiveRecording);
  capTimer = setTimeout(stopActiveRecording, MAX_DURATION_MS);

  recorder.start(TIMESLICE_MS);
}

function stopTracks(stream: MediaStream): void {
  for (const track of stream.getTracks()) track.stop();
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
