import { ENGINE_OUTPUT } from "@captureflow/engine";
import {
  startStreamRecorder,
  startWebcamRecorder,
  type StreamRecorder,
  type WebcamRecorder,
} from "@captureflow/engine/web";
import { createRecordingTransport, RecordingApiHttpError } from "../api/client";
import { friendlyUploadError } from "../api/errors";
import {
  startRecordingUpload,
  type RecordingUpload,
} from "../api/upload-streamer";
import type { CaptureContext } from "../messaging";
import type {
  ActiveUpload,
  RecordingResultPayload,
  RecordingStatus,
} from "../storage";
import { MAX_DURATION_MS } from "./limits";

type Callbacks = {
  onStatus: (status: RecordingStatus) => void;
  onResult: (result: RecordingResultPayload) => void;
  // Relayed to the SW: chrome.storage is unavailable in offscreen documents.
  onActiveUpload: (upload: ActiveUpload | null) => void;
};

type SessionCommands = {
  stop(): void;
  pause(): void;
  resume(): void;
  restart(): void;
  discard(): void;
};

type SessionEnd = "done" | "restart";

let sessionActive = false;
let commands: SessionCommands | null = null;

export function stopActiveRecording(): void {
  commands?.stop();
}
export function pauseActiveRecording(): void {
  commands?.pause();
}
export function resumeActiveRecording(): void {
  commands?.resume();
}
export function restartActiveRecording(): void {
  commands?.restart();
}
export function deleteActiveRecording(): void {
  commands?.discard();
}

const deviceConstraint = (
  deviceId: string | undefined,
): MediaTrackConstraints | boolean =>
  deviceId ? { deviceId: { ideal: deviceId } } : true;

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
      cb.onResult(failure(err));
    }
    return;
  }

  // Webcam (camera + optional mic) is best-effort: if it can't be acquired (no
  // permission yet, no device), fall back to a screen-only recording.
  let webcamStream: MediaStream | null = null;
  if (ctx.camera) {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({
        video: deviceConstraint(ctx.cameraId),
        audio: ctx.mic ? deviceConstraint(ctx.micId) : false,
      });
    } catch {
      webcamStream = null;
    }
  }
  // Without a camera the mic can't ride the webcam track, so it is muxed into
  // the screen fMP4 as AAC instead.
  let micStream: MediaStream | null = null;
  if (!webcamStream && ctx.mic) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: deviceConstraint(ctx.micId),
      });
    } catch {
      micStream = null;
    }
  }

  const stopAllTracks = (): void => {
    stopTracks(screenStream);
    if (webcamStream) stopTracks(webcamStream);
    if (micStream) stopTracks(micStream);
  };

  // Restart discards the session's upload but keeps the acquired streams, so
  // no picker or permission prompt re-appears.
  try {
    for (;;) {
      const end = await runSession(
        ctx,
        cb,
        { screenStream, webcamStream, micStream },
        stopAllTracks,
      );
      if (end !== "restart") break;
    }
  } finally {
    stopAllTracks();
    commands = null;
    sessionActive = false;
  }
}

type SessionStreams = {
  screenStream: MediaStream;
  webcamStream: MediaStream | null;
  micStream: MediaStream | null;
};

async function runSession(
  ctx: CaptureContext,
  cb: Callbacks,
  streams: SessionStreams,
  stopAllTracks: () => void,
): Promise<SessionEnd> {
  const { screenStream, webcamStream, micStream } = streams;

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
    cb.onResult(failure(err));
    return "done";
  }
  cb.onActiveUpload({ slug: upload.slug, deviceId: ctx.deviceId });

  let endSession!: (end: SessionEnd) => void;
  const sessionEnd = new Promise<SessionEnd>((resolve) => {
    endSession = resolve;
  });

  let ended = false;
  // `session` is created after the recorders; the ref keeps a track that ends
  // in that window from hitting the uninitialized binding.
  let sessionRef: SessionCommands | null = null;
  let screenRecorder: StreamRecorder;
  try {
    screenRecorder = await startStreamRecorder({
      stream: screenStream,
      micStream,
      // fMP4 fragments are strictly appended, so position is ignorable; copy
      // because the muxer reuses its output buffer.
      output: (bytes) => upload.pushScreen(bytes.slice()),
      // Covers the browser's native "Stop sharing" control and fatal encode
      // errors — both end the whole recording.
      onEnded: () => sessionRef?.stop(),
    });
  } catch (err) {
    upload.abort();
    cb.onActiveUpload(null);
    cb.onResult(failure(err));
    return "done";
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
      webcamRecorder = null;
    }
  }

  const startedAt = Date.now();
  let pausedMs = 0;
  let pausedAt: number | null = null;
  const activeElapsed = (): number =>
    (pausedAt ?? Date.now()) - startedAt - pausedMs;

  let capTimer = setTimeout(() => session.stop(), MAX_DURATION_MS);

  const stopRecorders = async (): Promise<void> => {
    await Promise.all([
      screenRecorder.stop().catch(() => null),
      webcamRecorder?.stop().catch(() => null) ?? Promise.resolve(null),
    ]);
  };

  const finalize = async (): Promise<void> => {
    cb.onStatus({ kind: "uploading" });
    try {
      await Promise.all([
        screenRecorder.stop(),
        webcamRecorder?.stop() ?? Promise.resolve(null),
      ]);
      // Release the capture (sharing indicator) before the tail upload.
      stopAllTracks();
      const { url } = await upload.finish();
      cb.onActiveUpload(null);
      cb.onResult({
        ok: true,
        url,
        bytes: upload.screenBytes + upload.webcamBytes,
        durationMs: activeElapsed(),
      });
    } catch (err) {
      stopAllTracks();
      upload.abort();
      cb.onActiveUpload(null);
      cb.onResult(failure(err));
    }
    endSession("done");
  };

  // Restart/delete path: the muxer still flushes into the (aborted) upload,
  // where pushes are no-ops.
  const discardSession = async (): Promise<void> => {
    upload.abort();
    await stopRecorders();
    cb.onActiveUpload(null);
  };

  const session: SessionCommands = {
    stop() {
      if (ended) return;
      ended = true;
      clearTimeout(capTimer);
      void finalize();
    },
    pause() {
      if (ended || pausedAt !== null) return;
      pausedAt = Date.now();
      clearTimeout(capTimer);
      void screenRecorder.pause();
      webcamRecorder?.pause();
      cb.onStatus({ kind: "paused", startedAt, pausedMs, pausedAt });
    },
    resume() {
      if (ended || pausedAt === null) return;
      pausedMs += Date.now() - pausedAt;
      pausedAt = null;
      screenRecorder.resume();
      webcamRecorder?.resume();
      capTimer = setTimeout(
        () => session.stop(),
        Math.max(1_000, MAX_DURATION_MS - activeElapsed()),
      );
      cb.onStatus({ kind: "recording", startedAt, pausedMs });
    },
    restart() {
      if (ended) return;
      ended = true;
      clearTimeout(capTimer);
      cb.onStatus({ kind: "preparing" });
      void discardSession().then(() => endSession("restart"));
    },
    discard() {
      if (ended) return;
      ended = true;
      clearTimeout(capTimer);
      void discardSession().then(() => {
        stopAllTracks();
        cb.onStatus({ kind: "cancelled" });
        endSession("done");
      });
    },
  };
  sessionRef = session;
  commands = session;

  cb.onStatus({ kind: "recording", startedAt, pausedMs: 0 });

  // Poster frame from the screen — best-effort, never gates the recording.
  void capturePoster(screenStream)
    .then((bytes) => (bytes ? upload.uploadPoster(bytes) : undefined))
    .catch(() => undefined);

  return sessionEnd;
}

function failure(err: unknown): RecordingResultPayload {
  return {
    ok: false,
    error: friendlyUploadError(err),
    ...(err instanceof RecordingApiHttpError && err.code
      ? { code: err.code }
      : {}),
  };
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
