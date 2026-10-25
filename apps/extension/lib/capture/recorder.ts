import {
  RECORDING_QUALITIES,
  hydrateRecordingQuality,
  type RecordingQuality,
} from "@captureflow/engine";
import {
  MIC_CONSTRAINTS,
  isAudioChunkRecordingSupported,
  openMicChain,
  startAudioChunkRecorder,
  startStreamRecorder,
  startWebcamRecorder,
  type AudioChunkRecorder,
  type StreamRecorder,
  type WebcamRecorder,
} from "@captureflow/engine/web";
import {
  createRecordingTransport,
  RecordingApiHttpError,
  recordingViewUrl,
} from "../api/client";
import { friendlyUploadError } from "../api/errors";
import {
  startRecordingUpload,
  type RecordingUpload,
} from "../api/upload-streamer";
import type { CaptureContext } from "../messaging";
import { createCameraEffectStream } from "./camera-effect-stream";
import { isPlainCameraEffect } from "./camera-effects";
import type { TranscribeRequest, UploadTransport } from "../api/types";
import type {
  ActiveUpload,
  RecordingResultPayload,
  RecordingStatus,
} from "../storage";

type Callbacks = {
  // Pre-roll countdown, shown by the SW on the page. Runs after all grants
  // and pickers settle, so a cancel tears down before any upload exists.
  onCountdown: () => Promise<"go" | "cancel">;
  // What the capture ended up on: "monitor", "window" or "browser"; null when
  // Chrome doesn't say.
  onSurface: (surface: string | null) => void;
  onStatus: (status: RecordingStatus) => void;
  // Fires as finalize begins, with the share URL — the page renders its own
  // pending state while the tail uploads.
  onFinalizing: (url: string) => void;
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

const cameraConstraint = (
  deviceId: string | undefined,
  quality: RecordingQuality,
): MediaTrackConstraints => ({
  ...(deviceId ? { deviceId: { ideal: deviceId } } : {}),
  width: { ideal: quality.webcam.width },
  height: { ideal: quality.webcam.height },
  frameRate: { ideal: 30 },
});

const micConstraint = (deviceId: string | undefined): MediaTrackConstraints =>
  deviceId
    ? { deviceId: { ideal: deviceId }, ...MIC_CONSTRAINTS }
    : { ...MIC_CONSTRAINTS };

/*
 * A chrome.tabCapture stream id is redeemed through getUserMedia's legacy
 * chromeMediaSource constraints — there is no modern equivalent, and they are
 * not in the standard MediaTrackConstraints, hence the cast.
 *
 * Tab capture defaults to a fixed output resolution: with max constraints
 * alone Chrome letterboxes the tab into exactly maxWidth×maxHeight, so a
 * 16:10 window gets black bars baked into the MP4. Minimums above 1px (and
 * of another aspect than the maximums) switch Chrome to "any within limit",
 * which scales the tab to fit without padding. See Chromium's
 * SelectResolutionPolicyFromCandidates in
 * media_stream_constraints_util_video_content.cc.
 */
const TAB_CAPTURE_MIN_DIMENSION = 2;

async function captureTabStream(
  streamId: string,
  quality: RecordingQuality,
): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
        minWidth: TAB_CAPTURE_MIN_DIMENSION,
        minHeight: TAB_CAPTURE_MIN_DIMENSION,
        maxWidth: quality.screen.maxWidth,
        maxHeight: quality.screen.maxHeight,
        maxFrameRate: quality.screen.fps,
      },
    },
  } as unknown as MediaStreamConstraints);
}

// Preselects a pane in the native picker; the viewer can still pick another.
const DISPLAY_SURFACE = {
  screen: "monitor",
  window: "window",
  tab: "browser",
} as const;

export async function recordAndUpload(
  ctx: CaptureContext,
  cb: Callbacks,
): Promise<void> {
  if (sessionActive) return; // one recording at a time
  sessionActive = true;

  cb.onStatus({ kind: "preparing" });
  const quality = RECORDING_QUALITIES[hydrateRecordingQuality(ctx.quality)];

  let screenStream: MediaStream;
  try {
    screenStream = ctx.tabStreamId
      ? await captureTabStream(ctx.tabStreamId, quality)
      : // Max constraints make the browser scale to the chosen dims
        // (aspect-fit); the native cursor is captured in-frame by default.
        await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { max: quality.screen.maxWidth },
            height: { max: quality.screen.maxHeight },
            frameRate: { max: quality.screen.fps },
            ...(ctx.source
              ? { displaySurface: DISPLAY_SURFACE[ctx.source] }
              : {}),
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
  cb.onSurface(
    screenStream.getVideoTracks()[0]?.getSettings().displaySurface ?? null,
  );

  // Webcam (camera + optional mic) is best-effort: if it can't be acquired (no
  // permission yet, no device), fall back to a screen-only recording.
  let webcamStream: MediaStream | null = null;
  if (ctx.camera) {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({
        video: cameraConstraint(ctx.cameraId, quality),
        audio: ctx.mic ? micConstraint(ctx.micId) : false,
      });
    } catch {
      webcamStream = null;
    }
  }
  // Background and filter effects are baked into the camera track here, so
  // the file carries what the bubble showed. A pipeline that fails to start
  // falls back to the raw camera rather than losing it.
  let effectStop: (() => void) | null = null;
  const rawWebcam = webcamStream;
  if (webcamStream && ctx.effect && !isPlainCameraEffect(ctx.effect)) {
    try {
      const processed = await createCameraEffectStream(
        webcamStream,
        ctx.effect,
        chrome.runtime.getURL("mediapipe"),
      );
      effectStop = processed.stop;
      webcamStream = processed.stream;
    } catch {
      effectStop = null;
    }
  }
  // Without a camera the mic can't ride the webcam track, so it is muxed into
  // the screen fMP4 as AAC instead.
  let micStream: MediaStream | null = null;
  if (!webcamStream && ctx.mic) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: micConstraint(ctx.micId),
      });
    } catch {
      micStream = null;
    }
  }

  // The mic goes through the voice chain wherever it is recorded; the raw
  // track only feeds the chain.
  const micTrack =
    webcamStream?.getAudioTracks()[0] ?? micStream?.getAudioTracks()[0] ?? null;
  const voice = micTrack ? openMicChain(micTrack) : null;

  const stopAllTracks = (): void => {
    stopTracks(screenStream);
    effectStop?.();
    if (rawWebcam) stopTracks(rawWebcam);
    if (webcamStream) stopTracks(webcamStream);
    if (micStream) stopTracks(micStream);
    void voice?.close().catch(() => {});
  };

  // A failed countdown round-trip must not strand live tracks — record anyway.
  const countdown = await cb.onCountdown().catch(() => "go" as const);
  if (countdown === "cancel") {
    stopAllTracks();
    sessionActive = false;
    cb.onStatus({ kind: "cancelled" });
    return;
  }

  // Restart discards the session's upload but keeps the acquired streams, so
  // no picker or permission prompt re-appears.
  try {
    for (;;) {
      const end = await runSession(
        ctx,
        cb,
        { screenStream, webcamStream, micStream, voice: voice?.stream ?? null },
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
  // The mic after the voice chain; null without a mic.
  voice: MediaStream | null;
};

async function runSession(
  ctx: CaptureContext,
  cb: Callbacks,
  streams: SessionStreams,
  stopAllTracks: () => void,
): Promise<SessionEnd> {
  const { screenStream, webcamStream, micStream, voice } = streams;
  const quality = RECORDING_QUALITIES[hydrateRecordingQuality(ctx.quality)];

  const transport = createRecordingTransport(ctx.deviceId, ctx.token);
  let upload: RecordingUpload;
  try {
    upload = await startRecordingUpload(
      {
        contentType: "video/mp4",
        source: "instant",
        visibility: ctx.visibility,
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

  /*
   * Storage is the only ceiling, so the recording runs until the account has no
   * room left rather than against a clock. Checked as bytes are produced, which
   * is what keeps the stop honest: the upload streams while recording, so by the
   * time the budget is gone those bytes are already committed.
   */
  const storageSpent = (): boolean =>
    upload.remainingBytes !== null &&
    upload.screenBytes + upload.webcamBytes >= upload.remainingBytes;

  let screenRecorder: StreamRecorder;
  try {
    screenRecorder = await startStreamRecorder({
      stream: screenStream,
      micStream: micStream ? voice : null,
      quality: quality.screen,
      // fMP4 fragments are strictly appended, so position is ignorable; copy
      // because the muxer reuses its output buffer.
      output: (bytes) => {
        upload.pushScreen(bytes.slice());
        if (storageSpent()) sessionRef?.stop();
      },
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
        // The mic rides the camera's getUserMedia stream; the chain's output
        // stands in for it here.
        micStream: voice,
        videoBitrate: quality.webcam.bitrate,
        audioBitrate: quality.webcam.audioBitrate,
        onChunk: (buf) => {
          upload.pushWebcam(new Uint8Array(buf));
          if (storageSpent()) sessionRef?.stop();
        },
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

  // The transcript is made server-side from the mic alone (the webcam stream
  // carries the track when there is a camera), uploaded as small audio
  // chunks beside the video. Best-effort: it never gates the recording.
  const micTrack = voice?.getAudioTracks()[0] ?? null;
  const audio =
    ctx.mic && micTrack
      ? startAudioUpload(micTrack, upload.slug, transport, activeElapsed)
      : null;

  const stopRecorders = async (): Promise<void> => {
    await Promise.all([
      screenRecorder.stop().catch(() => null),
      webcamRecorder?.stop().catch(() => null) ?? Promise.resolve(null),
      audio?.recorder.stop().catch(() => null) ?? Promise.resolve(null),
    ]);
  };

  const finalize = async (): Promise<void> => {
    cb.onFinalizing(recordingViewUrl(upload.slug));
    const progress = (): void =>
      cb.onStatus({
        kind: "uploading",
        uploadedBytes: upload.uploadedBytes,
        totalBytes: upload.screenBytes + upload.webcamBytes,
      });
    progress();
    const progressTimer = setInterval(progress, 500);
    try {
      await Promise.all([
        screenRecorder.stop(),
        webcamRecorder?.stop() ?? Promise.resolve(null),
        audio?.recorder.stop().catch(() => null) ?? Promise.resolve(null),
      ]);
      // Release the capture (sharing indicator) before the tail upload.
      stopAllTracks();
      const durationMs = activeElapsed();
      // Same stance as the webcam companion: a lost transcript is not a
      // failed recording. Requested before finalize, while the device id
      // still authorizes it, so the share page can show it transcribing.
      if (audio) await audio.requestTranscript().catch(() => undefined);
      const { url } = await upload.finish(durationMs);
      cb.onActiveUpload(null);
      cb.onResult({
        ok: true,
        url,
        bytes: upload.screenBytes + upload.webcamBytes,
        durationMs,
      });
    } catch (err) {
      stopAllTracks();
      upload.abort();
      cb.onActiveUpload(null);
      cb.onResult(failure(err));
    } finally {
      clearInterval(progressTimer);
    }
    endSession("done");
  };

  // Restart/delete path: the muxer still flushes into the (aborted) upload,
  // where pushes are no-ops.
  const discardSession = async (): Promise<void> => {
    upload.abort();
    audio?.recorder.abort();
    await stopRecorders();
    cb.onActiveUpload(null);
  };

  const session: SessionCommands = {
    stop() {
      if (ended) return;
      ended = true;
      void finalize();
    },
    pause() {
      if (ended || pausedAt !== null) return;
      pausedAt = Date.now();
      void screenRecorder.pause();
      webcamRecorder?.pause();
      audio?.recorder.pause();
      cb.onStatus({ kind: "paused", startedAt, pausedMs, pausedAt });
    },
    resume() {
      if (ended || pausedAt === null) return;
      pausedMs += Date.now() - pausedAt;
      pausedAt = null;
      screenRecorder.resume();
      webcamRecorder?.resume();
      audio?.recorder.resume();
      cb.onStatus({ kind: "recording", startedAt, pausedMs });
    },
    restart() {
      if (ended) return;
      ended = true;
      cb.onStatus({ kind: "preparing" });
      void discardSession().then(() => endSession("restart"));
    },
    discard() {
      if (ended) return;
      ended = true;
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

const AUDIO_PART_ATTEMPTS = 3;

type AudioUpload = {
  recorder: AudioChunkRecorder;
  // Waits for every chunk, then asks for the transcript; a chunk that never
  // made it means no request, so a partial transcript is never produced.
  requestTranscript(): Promise<void>;
};

/*
 * Each chunk goes up as it closes, numbered in order, so by the time the
 * recording stops only the last one is still in flight. The layout posted
 * with /transcribe places each chunk on the recording clock.
 */
function startAudioUpload(
  track: MediaStreamTrack,
  slug: string,
  transport: UploadTransport,
  elapsedMs: () => number,
): AudioUpload | null {
  if (!isAudioChunkRecordingSupported()) return null;
  const parts: TranscribeRequest["parts"] = [];
  const uploads: Promise<void>[] = [];
  let lost = false;
  let recorder: AudioChunkRecorder;
  try {
    recorder = startAudioChunkRecorder({
      track,
      elapsedMs,
      onChunk: ({ bytes, startMs, endMs }) => {
        const partNumber = parts.length + 1;
        parts.push({ partNumber, startMs, endMs });
        uploads.push(
          retry(AUDIO_PART_ATTEMPTS, () =>
            transport.uploadAudioPart(slug, partNumber, new Uint8Array(bytes)),
          ).catch(() => {
            lost = true;
          }),
        );
      },
    });
  } catch {
    return null;
  }
  return {
    recorder,
    async requestTranscript() {
      await Promise.all(uploads);
      if (lost || parts.length === 0) return;
      await transport.transcribe({
        slug,
        language: navigator.language,
        parts,
      });
    },
  };
}

async function retry<T>(attempts: number, run: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (err) {
      if (attempt >= attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
    }
  }
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
