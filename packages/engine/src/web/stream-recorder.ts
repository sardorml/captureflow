import { ENGINE_OUTPUT } from "../contract";
import { createFmp4Muxer } from "./fmp4-mux";

// Chromium-only Insertable Streams API — not yet in TS's DOM lib.
declare class MediaStreamTrackProcessor<T> {
  constructor(init: { track: MediaStreamTrack });
  readonly readable: ReadableStream<T>;
}

// Matches the native sidecar's 2s GOP so seeks and pause splices behave the same.
const KEYFRAME_INTERVAL_US = 2_000_000;
// Encoder back-pressure bound: drop frames rather than queue unboundedly.
const MAX_ENCODE_QUEUE = 2;

export type StreamRecorderLog = {
  info(message: string): void;
  warn(message: string): void;
};

export type StreamRecorderOptions = {
  /** Display capture; constrain it to the contract's max dims at getDisplayMedia time. */
  stream: MediaStream;
  /** Receives muxed fMP4 bytes as they are written (the upload feed). */
  output(bytes: Uint8Array, position: number): void;
  /** Fires when capture ends without stop() — track ended or fatal encode error. */
  onEnded?(): void;
  log?: StreamRecorderLog;
};

export type StreamRecorderResult = {
  sizeBytes: number;
  durationMs: number;
  encodedFrames: number;
  width: number;
  height: number;
};

export type StreamRecorder = {
  /** Idempotent; flushes the encoder and finalizes the muxer. */
  stop(): Promise<StreamRecorderResult>;
};

async function pickSupportedH264(probe: {
  width: number;
  height: number;
  framerate: number;
  bitrate: number;
}): Promise<string> {
  const candidates = ENGINE_OUTPUT.screen.h264EncodeCandidates;
  for (const codec of candidates) {
    try {
      const res = await VideoEncoder.isConfigSupported({
        codec,
        width: probe.width,
        height: probe.height,
        framerate: probe.framerate,
        bitrate: probe.bitrate,
        hardwareAcceleration: "prefer-hardware",
        avc: { format: "avc" },
      });
      if (res.supported) return codec;
    } catch {
      /* some browsers throw on unknown codec strings */
    }
  }
  return candidates[candidates.length - 1]!;
}

/*
 * The MediaStream frame source of the output contract: getDisplayMedia →
 * MediaStreamTrackProcessor → VideoEncoder → the shared fMP4 muxer. Stream-
 * driven (no rAF/canvas), so it keeps encoding at full rate in background
 * tabs/offscreen documents. This is also the capture path for platforms
 * without a native sidecar.
 */
export async function startStreamRecorder(
  opts: StreamRecorderOptions,
): Promise<StreamRecorder> {
  const log: StreamRecorderLog = opts.log ?? { info() {}, warn() {} };
  const track = opts.stream.getVideoTracks()[0];
  if (!track) throw new Error("stream-recorder: no video track on stream");

  const settings = track.getSettings();
  const width = settings.width ?? ENGINE_OUTPUT.screen.maxWidth;
  const height = settings.height ?? ENGINE_OUTPUT.screen.maxHeight;
  const framerate = settings.frameRate ?? ENGINE_OUTPUT.screen.fps;
  const bitrate = ENGINE_OUTPUT.screen.bitrate;

  const codec = await pickSupportedH264({ width, height, framerate, bitrate });

  const muxer = createFmp4Muxer({
    video: { width, height, frameRate: framerate },
    output: opts.output,
    // Capture-clock timestamps don't start at zero.
    firstTimestampBehavior: "offset",
  });

  let encoderError: Error | null = null;
  let encodedFrames = 0;
  let droppedFrames = 0;
  let firstTsUs: number | null = null;
  let lastEndUs = 0;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      try {
        muxer.addVideoChunk(chunk, meta);
      } catch (err) {
        encoderError = err instanceof Error ? err : new Error(String(err));
        return;
      }
      encodedFrames++;
      if (firstTsUs === null) firstTsUs = chunk.timestamp;
      lastEndUs = chunk.timestamp + (chunk.duration ?? 0);
    },
    error: (err) => {
      encoderError = err;
    },
  });
  encoder.configure({
    codec,
    width,
    height,
    framerate,
    bitrate,
    hardwareAcceleration: "prefer-hardware",
    avc: { format: "avc" },
  });
  log.info(
    `stream-recorder: started (${width}x${height}@${Math.round(framerate)}fps, ${codec})`,
  );

  const reader = new MediaStreamTrackProcessor<VideoFrame>({
    track,
  }).readable.getReader();

  let stopping = false;
  let lastKeyUs = -Infinity;

  const readLoop = (async () => {
    for (;;) {
      const { done, value: frame } = await reader.read();
      if (done || !frame) break;
      if (stopping || encoderError) {
        frame.close();
        break;
      }
      if (encoder.encodeQueueSize > MAX_ENCODE_QUEUE) {
        droppedFrames++;
        frame.close();
        continue;
      }
      const keyFrame = frame.timestamp - lastKeyUs >= KEYFRAME_INTERVAL_US;
      if (keyFrame) lastKeyUs = frame.timestamp;
      encoder.encode(frame, { keyFrame });
      frame.close();
    }
  })();

  async function finish(): Promise<StreamRecorderResult> {
    stopping = true;
    try {
      await reader.cancel();
    } catch {
      /* already done */
    }
    await readLoop.catch(() => {});
    if (encoder.state === "configured") {
      await encoder.flush().catch(() => {});
    }
    try {
      encoder.close();
    } catch {
      /* already closed */
    }
    if (encoderError) throw encoderError;
    muxer.finalize();
    const durationMs =
      firstTsUs === null ? 0 : Math.round((lastEndUs - firstTsUs) / 1_000);
    log.info(
      `stream-recorder: stopped (${encodedFrames} frames, ${droppedFrames} dropped, ${durationMs}ms)`,
    );
    return {
      sizeBytes: muxer.totalBytes(),
      durationMs,
      encodedFrames,
      width,
      height,
    };
  }

  // Natural end (browser "Stop sharing", fatal encode error): let the app run
  // its stop flow, which calls stop() and finalizes.
  void readLoop.then(() => {
    if (!stopping) opts.onEnded?.();
  });

  let finishPromise: Promise<StreamRecorderResult> | null = null;
  return {
    stop() {
      finishPromise ??= finish();
      return finishPromise;
    },
  };
}
