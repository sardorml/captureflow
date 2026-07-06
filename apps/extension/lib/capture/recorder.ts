import { ENGINE_OUTPUT } from "@captureflow/engine";
import {
  startStreamRecorder,
  startWebcamRecorder,
  type StreamRecorder,
  type WebcamRecorder,
} from "@captureflow/engine/web";
import { createRecordingTransport } from "../api/client";
import {
  startRecordingUpload,
  type RecordingUpload,
} from "../api/upload-streamer";
import type { CaptureContext } from "../messaging";
import type { RecordingResultPayload, RecordingStatus } from "../storage";

// The server can't cap a live stream's length (no duration known at init), so
// enforce a hard client-side ceiling.
const MAX_DURATION_MS = 30 * 60 * 1000;

type Callbacks = {
  onStatus: (status: RecordingStatus) => void;
  onResult: (result: RecordingResultPayload) => void;
};

let sessionActive = false;
let activeStop: (() => void) | null = null;

export function stopActiveRecording(): void {
  activeStop?.();
}

export async function recordAndUpload(
  ctx: CaptureContext,
  cb: Callbacks,
): Promise<void> {
  if (sessionActive) return; // one recording at a time
  sessionActive = true;

  cb.onStatus({ kind: "preparing" });

  let screenStream: MediaStream;
  try {
    // Max constraints make the browser scale to the contract dims (aspect-fit);
    // the native cursor is captured in-frame by default.
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { max: ENGINE_OUTPUT.screen.maxWidth },
        height: { max: ENGINE_OUTPUT.screen.maxHeight },
      },
      audio: false,
    });
  } catch (err) {
    sessionActive = false;
    // The picker's Cancel rejects with NotAllowedError — not a real failure.
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      cb.onStatus({ kind: "cancelled" });
    } else {
      cb.onResult({ ok: false, error: errorMessage(err) });
    }
    return;
  }

  // Webcam (camera + optional mic) is best-effort: if it can't be acquired (no
  // permission yet, no device), fall back to a screen-only recording.
  let webcamStream: MediaStream | null = null;
  if (ctx.camera) {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: ctx.mic,
      });
    } catch {
      webcamStream = null;
    }
  }

  let upload: RecordingUpload;
  try {
    const transport = createRecordingTransport(ctx.deviceId, ctx.token);
    upload = await startRecordingUpload(
      {
        contentType: "video/mp4",
        source: "instant",
        hasWebcam: webcamStream !== null,
      },
      { transport },
    );
  } catch (err) {
    sessionActive = false;
    stopTracks(screenStream);
    if (webcamStream) stopTracks(webcamStream);
    cb.onResult({ ok: false, error: errorMessage(err) });
    return;
  }

  const startedAt = Date.now();
  let capTimer: ReturnType<typeof setTimeout> | undefined;

  let screenRecorder: StreamRecorder;
  try {
    screenRecorder = await startStreamRecorder({
      stream: screenStream,
      // fMP4 fragments are strictly appended, so position is ignorable; copy
      // because the muxer reuses its output buffer.
      output: (bytes) => upload.pushScreen(bytes.slice()),
      // Covers the browser's native "Stop sharing" control and fatal encode
      // errors — both end the whole recording.
      onEnded: () => stopActiveRecording(),
    });
  } catch (err) {
    sessionActive = false;
    upload.abort();
    stopTracks(screenStream);
    if (webcamStream) stopTracks(webcamStream);
    cb.onResult({ ok: false, error: errorMessage(err) });
    return;
  }

  // A webcam recorder failure is contained to its own stream so the
  // load-bearing screen capture keeps going (webcam best-effort).
  let webcamRecorder: WebcamRecorder | null = null;
  if (webcamStream) {
    try {
      webcamRecorder = startWebcamRecorder({
        webcamStream,
        // Mic rides the same getUserMedia stream as the camera (Decision 4).
        micStream: webcamStream,
        onChunk: (buf) => upload.pushWebcam(new Uint8Array(buf)),
      });
    } catch {
      stopTracks(webcamStream);
      webcamStream = null;
    }
  }

  const finalize = async (): Promise<void> => {
    if (capTimer) clearTimeout(capTimer);
    activeStop = null;
    cb.onStatus({ kind: "uploading" });
    try {
      await Promise.all([
        screenRecorder.stop(),
        webcamRecorder?.stop() ?? Promise.resolve(null),
      ]);
      stopTracks(screenStream);
      if (webcamStream) stopTracks(webcamStream);
      const { url } = await upload.finish();
      cb.onResult({
        ok: true,
        url,
        bytes: upload.screenBytes + upload.webcamBytes,
        durationMs: Date.now() - startedAt,
      });
    } catch (err) {
      stopTracks(screenStream);
      if (webcamStream) stopTracks(webcamStream);
      upload.abort();
      cb.onResult({ ok: false, error: errorMessage(err) });
    } finally {
      sessionActive = false;
    }
  };

  let stopRequested = false;
  activeStop = () => {
    if (stopRequested) return;
    stopRequested = true;
    void finalize();
  };

  capTimer = setTimeout(stopActiveRecording, MAX_DURATION_MS);
  cb.onStatus({ kind: "recording" });

  // Poster frame from the screen — best-effort, never gates the recording.
  void capturePoster(screenStream)
    .then((bytes) => (bytes ? upload.uploadPoster(bytes) : undefined))
    .catch(() => undefined);
}

async function capturePoster(stream: MediaStream): Promise<Uint8Array | null> {
  if (!stream.getVideoTracks()[0]) return null;
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  try {
    await video.play();
    if (video.videoWidth === 0) {
      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
      });
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context || canvas.width === 0) return null;
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/jpeg", 0.8),
    );
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } finally {
    video.pause();
    video.srcObject = null;
  }
}

function stopTracks(stream: MediaStream): void {
  for (const track of stream.getTracks()) track.stop();
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
