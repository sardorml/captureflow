export type WebcamCaptureResult = { stream: MediaStream };
export type MicCaptureResult = { stream: MediaStream };

/*
 * The camera session is driven by its highest-resolution consumer
 * (a 1080p preview surface, when present), so this 720p stream is downscaled
 * from that session — concurrent acquires never downgrade it.
 */
const WEBCAM_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 },
} as const;

// WebM only — the upload side reserves a fixed video/webm key; an MP4-in-.webm
// file freezes the recording player on the first frame.
const WEBCAM_MIME_WEBM_VP9_OPUS = "video/webm;codecs=vp9,opus";
const WEBCAM_MIME_WEBM_VP8_OPUS = "video/webm;codecs=vp8,opus";

const WEBCAM_VIDEO_BITRATE = 4_000_000;
const WEBCAM_AUDIO_BITRATE = 128_000;
const WEBCAM_TIMESLICE_MS = 200;

export async function acquireWebcamCapture(
  deviceId: string,
): Promise<WebcamCaptureResult | null> {
  try {
    const stream = await acquireWebcamStream(deviceId);
    return { stream };
  } catch (err) {
    console.warn("Could not access webcam for recording:", err);
    return null;
  }
}

async function acquireWebcamStream(deviceId: string): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        ...WEBCAM_CONSTRAINTS,
      },
      audio: false,
    });
  } catch {
    // Camera rejected the constraints; retry with bare ideals and let it negotiate.
    return navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: WEBCAM_CONSTRAINTS.width.ideal },
        height: { ideal: WEBCAM_CONSTRAINTS.height.ideal },
        frameRate: WEBCAM_CONSTRAINTS.frameRate,
      },
      audio: false,
    });
  }
}

export async function acquireMicCapture(
  audioDeviceId: string,
): Promise<MicCaptureResult | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        deviceId: { exact: audioDeviceId },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    return { stream };
  } catch (err) {
    console.warn("Could not access mic for recording:", err);
    return null;
  }
}

export function pickWebcamMimeType(): string | null {
  for (const candidate of [
    WEBCAM_MIME_WEBM_VP9_OPUS,
    WEBCAM_MIME_WEBM_VP8_OPUS,
  ]) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return null;
}

export type WebcamRecorderLog = {
  info(message: string): void;
  warn(message: string): void;
};

export type WebcamRecorderOptions = {
  webcamStream: MediaStream;
  micStream: MediaStream | null;
  /** Receives each WebM chunk as it lands (the upload feed). */
  onChunk(bytes: ArrayBuffer): void;
  log?: WebcamRecorderLog;
};

export type WebcamRecorder = {
  pause(): void;
  resume(): void;
  stop(): Promise<{ totalBytes: number }>;
  abort(): void;
};

/** WebM (VP9/VP8 + Opus) webcam+mic recorder — the contract's webcam output. */
export function startWebcamRecorder(
  opts: WebcamRecorderOptions,
): WebcamRecorder {
  const log: WebcamRecorderLog = opts.log ?? { info() {}, warn() {} };
  const videoTracks = opts.webcamStream.getVideoTracks();
  const audioTracks = opts.micStream?.getAudioTracks() ?? [];
  if (videoTracks.length === 0) {
    throw new Error("webcam-recorder: no video tracks on webcam stream");
  }
  const combined = new MediaStream([...videoTracks, ...audioTracks]);

  const mimeType = pickWebcamMimeType();
  if (!mimeType) {
    throw new Error(
      "webcam-recorder: no supported mimeType for webcam+mic recorder",
    );
  }
  const recorder = new MediaRecorder(combined, {
    mimeType,
    videoBitsPerSecond: WEBCAM_VIDEO_BITRATE,
    audioBitsPerSecond: WEBCAM_AUDIO_BITRATE,
  });

  let totalBytes = 0;
  // Awaited on stop so the final dataavailable conversion isn't dropped.
  let pendingChunks: Promise<void>[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size === 0) return;
    const promise = (async () => {
      const buf = await e.data.arrayBuffer();
      totalBytes += buf.byteLength;
      opts.onChunk(buf);
    })().catch((err) => {
      log.warn(`webcam-recorder: chunk forward failed (${String(err)})`);
    });
    pendingChunks.push(promise);
  };

  recorder.start(WEBCAM_TIMESLICE_MS);
  log.info(`webcam-recorder: started (mime=${mimeType})`);

  return {
    // MediaRecorder keeps the WebM timeline continuous across pause/resume.
    pause() {
      if (recorder.state === "recording") recorder.pause();
    },
    resume() {
      if (recorder.state === "paused") recorder.resume();
    },
    async stop() {
      await new Promise<void>((resolve) => {
        if (recorder.state === "inactive") {
          resolve();
          return;
        }
        recorder.onstop = () => resolve();
        recorder.requestData();
        recorder.stop();
      });
      await Promise.allSettled(pendingChunks);
      pendingChunks = [];
      log.info(`webcam-recorder: stopped (${totalBytes}B total)`);
      return { totalBytes };
    },
    abort() {
      if (recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          /* ignore */
        }
      }
      pendingChunks = [];
    },
  };
}
