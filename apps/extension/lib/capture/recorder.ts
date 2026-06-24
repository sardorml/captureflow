import { createShareTransport } from "../api/client";
import { startShareUpload, type ShareUpload } from "../api/upload-streamer";
import type { CaptureContext } from "../messaging";
import type { RecordingResultPayload, RecordingStatus } from "../storage";
import { pickScreenMimeType, pickWebcamMimeType } from "./pick-mime-type";

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

let activeRecorders: MediaRecorder[] = [];

export function stopActiveRecording(): void {
  for (const recorder of activeRecorders) {
    if (recorder.state !== "inactive") recorder.stop();
  }
}

export async function recordAndUpload(
  ctx: CaptureContext,
  cb: Callbacks,
): Promise<void> {
  if (activeRecorders.length > 0) return; // one recording at a time

  cb.onStatus({ kind: "preparing" });

  let screenStream: MediaStream;
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
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

  // Webcam (camera + optional mic) is best-effort: if it can't be acquired (no
  // permission yet, no device), fall back to a screen-only share.
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

  const screen = pickScreenMimeType();

  let upload: ShareUpload;
  try {
    const transport = createShareTransport(ctx.deviceId, ctx.token);
    upload = await startShareUpload(
      {
        contentType: screen.contentType,
        source: "instant",
        hasWebcam: webcamStream !== null,
      },
      { transport },
    );
  } catch (err) {
    stopTracks(screenStream);
    if (webcamStream) stopTracks(webcamStream);
    cb.onResult({ ok: false, error: errorMessage(err) });
    return;
  }

  const startedAt = Date.now();
  let capTimer: ReturnType<typeof setTimeout> | undefined;

  const screenPipe = pipeRecorder(screenStream, screen.mimeType, (bytes) =>
    upload.pushScreen(bytes),
  );
  const webcamPipe = webcamStream
    ? pipeRecorder(webcamStream, pickWebcamMimeType(), (bytes) =>
        upload.pushWebcam(bytes),
      )
    : null;
  const pipes = webcamPipe ? [screenPipe, webcamPipe] : [screenPipe];

  // Finalize once every recorder has stopped and its chunks are flushed.
  let stopped = 0;
  const onRecorderStop = async () => {
    stopped += 1;
    if (stopped < pipes.length) return;
    if (capTimer) clearTimeout(capTimer);
    stopTracks(screenStream);
    if (webcamStream) stopTracks(webcamStream);
    activeRecorders = [];
    cb.onStatus({ kind: "uploading" });
    try {
      await Promise.all(pipes.map((pipe) => pipe.settled()));
      const { url } = await upload.finish();
      cb.onResult({
        ok: true,
        url,
        bytes: upload.screenBytes + upload.webcamBytes,
        durationMs: Date.now() - startedAt,
      });
    } catch (err) {
      upload.abort();
      cb.onResult({ ok: false, error: errorMessage(err) });
    }
  };

  for (const pipe of pipes) pipe.recorder.onstop = onRecorderStop;
  // A screen-recorder error ends the whole recording; a webcam error is contained
  // to its own stream (it just stops itself and flushes) so the load-bearing
  // screen capture keeps going — the webcam is best-effort.
  screenPipe.recorder.onerror = () => stopActiveRecording();
  if (webcamPipe) {
    webcamPipe.recorder.onerror = () => {
      if (webcamPipe.recorder.state !== "inactive") webcamPipe.recorder.stop();
    };
  }
  screenPipe.recorder.onstart = () => cb.onStatus({ kind: "recording" });
  activeRecorders = pipes.map((pipe) => pipe.recorder);

  // The browser's native "Stop sharing" control ends the screen track; mirror
  // it to a full stop of both recorders.
  screenStream
    .getVideoTracks()[0]
    ?.addEventListener("ended", stopActiveRecording);
  capTimer = setTimeout(stopActiveRecording, MAX_DURATION_MS);

  for (const pipe of pipes) pipe.recorder.start(TIMESLICE_MS);

  // Poster frame from the screen — best-effort, never gates the recording.
  void capturePoster(screenStream)
    .then((bytes) => (bytes ? upload.uploadPoster(bytes) : undefined))
    .catch(() => undefined);
}

type RecorderPipe = { recorder: MediaRecorder; settled: () => Promise<void> };

// Wire a MediaRecorder's chunks into `push`, chaining the async blob reads so
// parts keep recording order. `settled()` resolves once all queued pushes have
// run (call it after the recorder has stopped).
function pipeRecorder(
  stream: MediaStream,
  mimeType: string,
  push: (bytes: Uint8Array) => void,
): RecorderPipe {
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType } : undefined,
  );
  let chain = Promise.resolve();
  recorder.ondataavailable = (event) => {
    const blob = event.data;
    if (!blob || blob.size === 0) return;
    chain = chain.then(async () =>
      push(new Uint8Array(await blob.arrayBuffer())),
    );
  };
  return { recorder, settled: () => chain };
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
