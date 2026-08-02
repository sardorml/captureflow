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

const AAC_CODEC = "mp4a.40.2";
const AUDIO_BITRATE = 128_000;

export type StreamRecorderLog = {
  info(message: string): void;
  warn(message: string): void;
};

export type StreamRecorderOptions = {
  /** Display capture; constrain it to the contract's max dims at getDisplayMedia time. */
  stream: MediaStream;
  /** Mic capture muxed into the fMP4 as AAC-LC; dropped (warn) where AAC encoding is unavailable. */
  micStream?: MediaStream | null;
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
  /** Stops encoding new media; the output timeline stays continuous across the gap. */
  pause(): Promise<void>;
  resume(): void;
  /** Idempotent; flushes the encoders and finalizes the muxer. */
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

async function isAacSupported(config: AudioEncoderConfig): Promise<boolean> {
  try {
    const res = await AudioEncoder.isConfigSupported(config);
    return res.supported === true;
  } catch {
    return false;
  }
}

/*
 * The MediaStream frame source of the output contract: getDisplayMedia →
 * MediaStreamTrackProcessor → VideoEncoder → the shared fMP4 muxer (+ an
 * optional mic → AudioEncoder AAC track). Stream-driven (no rAF/canvas), so it
 * keeps encoding at full rate in background tabs/offscreen documents. This is
 * also the capture path for platforms without a native sidecar.
 *
 * Pause drops frames instead of stopping capture, then shifts every later
 * chunk's timestamp back by the wall-clock pause total — the muxed timeline is
 * gapless. Timestamps are clamped per track so the muxer always sees them
 * monotonic even if capture and wall clocks disagree by a few ms.
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

  const micTrack = opts.micStream?.getAudioTracks()[0] ?? null;
  const micSettings = micTrack?.getSettings();
  const audioConfig: AudioEncoderConfig | null = micTrack
    ? {
        codec: AAC_CODEC,
        sampleRate: micSettings?.sampleRate ?? 48_000,
        numberOfChannels: micSettings?.channelCount ?? 1,
        bitrate: AUDIO_BITRATE,
      }
    : null;
  const withAudio = audioConfig !== null && (await isAacSupported(audioConfig));
  if (audioConfig && !withAudio) {
    log.warn(
      "stream-recorder: AAC encoding unavailable, recording without mic",
    );
  }

  const muxer = createFmp4Muxer({
    video: { width, height, frameRate: framerate },
    audio:
      withAudio && audioConfig
        ? {
            numberOfChannels: audioConfig.numberOfChannels,
            sampleRate: audioConfig.sampleRate,
          }
        : null,
    output: opts.output,
    // Capture-clock timestamps don't start at zero; with a second track both
    // must shift by the same amount to keep A/V alignment.
    firstTimestampBehavior: withAudio ? "cross-track-offset" : "offset",
  });

  let encoderError: Error | null = null;
  let encodedFrames = 0;
  let droppedFrames = 0;
  let firstTsUs: number | null = null;
  let lastEndUs = 0;

  let paused = false;
  let pauseStartedAtMs: number | null = null;
  let pauseOffsetUs = 0;
  let forceKeyframe = false;
  let lastVideoTsUs = -Infinity;
  let lastAudioTsUs = -Infinity;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      const tsUs = Math.max(chunk.timestamp - pauseOffsetUs, lastVideoTsUs + 1);
      lastVideoTsUs = tsUs;
      try {
        muxer.addVideoChunkRaw(
          data,
          chunk.type,
          tsUs,
          chunk.duration ?? 0,
          meta,
        );
      } catch (err) {
        encoderError = err instanceof Error ? err : new Error(String(err));
        return;
      }
      encodedFrames++;
      if (firstTsUs === null) firstTsUs = tsUs;
      lastEndUs = tsUs + (chunk.duration ?? 0);
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

  // Mic encode errors are contained: the screen capture is load-bearing, the
  // mic track is best-effort.
  let audioFailed = false;
  const audioEncoder =
    withAudio && audioConfig
      ? new AudioEncoder({
          output: (chunk, meta) => {
            const data = new Uint8Array(chunk.byteLength);
            chunk.copyTo(data);
            const tsUs = Math.max(
              chunk.timestamp - pauseOffsetUs,
              lastAudioTsUs + 1,
            );
            lastAudioTsUs = tsUs;
            try {
              muxer.addAudioChunkRaw(data, tsUs, chunk.duration ?? 0, meta);
            } catch (err) {
              audioFailed = true;
              log.warn(`stream-recorder: audio mux failed (${String(err)})`);
            }
          },
          error: (err) => {
            audioFailed = true;
            log.warn(`stream-recorder: audio encode failed (${String(err)})`);
          },
        })
      : null;
  if (audioEncoder && audioConfig) audioEncoder.configure(audioConfig);

  log.info(
    `stream-recorder: started (${width}x${height}@${Math.round(framerate)}fps, ${codec}${audioEncoder ? " + aac mic" : ""})`,
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
      if (paused || encoder.encodeQueueSize > MAX_ENCODE_QUEUE) {
        if (!paused) droppedFrames++;
        frame.close();
        continue;
      }
      const keyFrame =
        forceKeyframe || frame.timestamp - lastKeyUs >= KEYFRAME_INTERVAL_US;
      if (keyFrame) {
        lastKeyUs = frame.timestamp;
        forceKeyframe = false;
      }
      encoder.encode(frame, { keyFrame });
      frame.close();
    }
  })();

  const audioReader = audioEncoder
    ? new MediaStreamTrackProcessor<AudioData>({
        track: micTrack!,
      }).readable.getReader()
    : null;

  const audioReadLoop = audioReader
    ? (async () => {
        for (;;) {
          const { done, value: data } = await audioReader.read();
          if (done || !data) break;
          if (stopping || audioFailed || paused) {
            data.close();
            if (stopping || audioFailed) break;
            continue;
          }
          audioEncoder!.encode(data);
          data.close();
        }
      })()
    : null;

  async function finish(): Promise<StreamRecorderResult> {
    stopping = true;
    try {
      await reader.cancel();
    } catch {
      /* already done */
    }
    try {
      await audioReader?.cancel();
    } catch {
      /* already done */
    }
    await readLoop.catch(() => {});
    await audioReadLoop?.catch(() => {});
    if (encoder.state === "configured") {
      await encoder.flush().catch(() => {});
    }
    try {
      encoder.close();
    } catch {
      /* already closed */
    }
    if (audioEncoder) {
      if (audioEncoder.state === "configured") {
        await audioEncoder.flush().catch(() => {});
      }
      try {
        audioEncoder.close();
      } catch {
        /* already closed */
      }
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
    async pause() {
      if (paused || stopping) return;
      paused = true;
      pauseStartedAtMs = performance.now();
      // Drain in-flight chunks now so none are emitted after the offset grows.
      if (encoder.state === "configured") {
        await encoder.flush().catch(() => {});
      }
      if (audioEncoder?.state === "configured") {
        await audioEncoder.flush().catch(() => {});
      }
    },
    resume() {
      if (!paused || stopping) return;
      if (pauseStartedAtMs !== null) {
        pauseOffsetUs += Math.round(
          (performance.now() - pauseStartedAtMs) * 1_000,
        );
        pauseStartedAtMs = null;
      }
      forceKeyframe = true;
      paused = false;
    },
    stop() {
      finishPromise ??= finish();
      return finishPromise;
    },
  };
}
