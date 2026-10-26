import { ENGINE_OUTPUT } from "../contract";
import { aacBitrateCandidates } from "./aac-bitrate";
import {
  ENCODER_ACCELERATION,
  type EncoderAcceleration,
} from "./encoder-preference";
import { createFmp4Muxer } from "./fmp4-mux";
import { createSettleDetector } from "./settle";
import { createSharedClock } from "./shared-clock";

// Chromium-only Insertable Streams API — not yet in TS's DOM lib.
declare class MediaStreamTrackProcessor<T> {
  constructor(init: { track: MediaStreamTrack });
  readonly readable: ReadableStream<T>;
}

// On a still page the keyframes are most of the file: at 1080p under a
// 1 Mbps ceiling a 2 s spacing left a quarter of the bits for the frames
// that sharpen the text. Resume still forces a keyframe at the splice.
const KEYFRAME_INTERVAL_US = 6_000_000;
// A settle refresh is a keyframe too; this keeps a page the viewer is nudging
// from costing one every few frames.
const SETTLE_REFRESH_MIN_GAP_US = 1_000_000;
const LUMA_SAMPLE = { width: 48, height: 27 };
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
  /** Encoder ceilings; the output contract's values when absent. */
  quality?: { fps: number; bitrate: number; audioBitrate: number };
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
  acceleration: EncoderAcceleration;
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
        hardwareAcceleration: probe.acceleration,
        avc: { format: "avc" },
      });
      if (res.supported) return codec;
    } catch {
      /* some browsers throw on unknown codec strings */
    }
  }
  return candidates[candidates.length - 1]!;
}

// A thumbnail's worth of luma per frame for the settle detector; null where
// the frame can't be drawn, which just leaves the fixed keyframe spacing.
function createLumaSampler(): (frame: VideoFrame) => Float32Array | null {
  const { width, height } = LUMA_SAMPLE;
  let ctx: OffscreenCanvasRenderingContext2D | null = null;
  try {
    ctx = new OffscreenCanvas(width, height).getContext("2d", {
      willReadFrequently: true,
    });
  } catch {
    ctx = null;
  }
  const luma = new Float32Array(width * height);
  return (frame) => {
    if (!ctx) return null;
    try {
      ctx.drawImage(frame, 0, 0, width, height);
      const px = ctx.getImageData(0, 0, width, height).data;
      for (let i = 0; i < luma.length; i++) {
        const o = i * 4;
        luma[i] = px[o]! * 0.299 + px[o + 1]! * 0.587 + px[o + 2]! * 0.114;
      }
      return luma;
    } catch {
      ctx = null;
      return null;
    }
  };
}

async function isAacSupported(config: AudioEncoderConfig): Promise<boolean> {
  try {
    const res = await AudioEncoder.isConfigSupported(config);
    return res.supported === true;
  } catch {
    return false;
  }
}

async function supportedAacConfig(
  requested: AudioEncoderConfig,
): Promise<AudioEncoderConfig | null> {
  for (const bitrate of aacBitrateCandidates(requested.bitrate ?? 0)) {
    const config = { ...requested, bitrate };
    if (await isAacSupported(config)) return config;
  }
  return null;
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
  const fpsCap = opts.quality?.fps ?? ENGINE_OUTPUT.screen.fps;
  const framerate = Math.min(settings.frameRate ?? fpsCap, fpsCap);
  const bitrate = opts.quality?.bitrate ?? ENGINE_OUTPUT.screen.bitrate;
  const acceleration = ENCODER_ACCELERATION;

  const codec = await pickSupportedH264({
    width,
    height,
    framerate,
    bitrate,
    acceleration,
  });

  const micTrack = opts.micStream?.getAudioTracks()[0] ?? null;
  const micSettings = micTrack?.getSettings();
  const requestedAudio: AudioEncoderConfig | null = micTrack
    ? {
        codec: AAC_CODEC,
        sampleRate: micSettings?.sampleRate ?? 48_000,
        numberOfChannels: micSettings?.channelCount ?? 1,
        bitrate: opts.quality?.audioBitrate ?? AUDIO_BITRATE,
      }
    : null;
  const audioConfig = requestedAudio
    ? await supportedAacConfig(requestedAudio)
    : null;
  const withAudio = audioConfig !== null;
  if (requestedAudio && !audioConfig) {
    log.warn(
      `stream-recorder: AAC encoding unavailable (${requestedAudio.sampleRate} Hz, ${requestedAudio.numberOfChannels} ch), recording without mic`,
    );
  } else if (audioConfig && audioConfig.bitrate !== requestedAudio?.bitrate) {
    log.info(
      `stream-recorder: AAC at ${audioConfig.bitrate} bps, the encoder refused ${requestedAudio?.bitrate}`,
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
    // Both tracks arrive on the shared clock below, so one common shift
    // brings the earliest to zero and keeps them aligned.
    firstTimestampBehavior: withAudio ? "cross-track-offset" : "offset",
  });

  const trackClock = createSharedClock(() =>
    Math.round(performance.now() * 1_000),
  );
  const videoClock = trackClock();
  const audioClock = trackClock();

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
      const tsUs = Math.max(
        videoClock.toShared(chunk.timestamp) - pauseOffsetUs,
        lastVideoTsUs + 1,
      );
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
      if (lastEndUs > 0 && tsUs - lastEndUs > 250_000) {
        log.warn(
          `stream-recorder: output gap ${Math.round((tsUs - lastEndUs) / 1000)}ms before ${(tsUs / 1e6).toFixed(2)}s (${droppedFrames} dropped by queue so far)`,
        );
      }
      lastEndUs = tsUs + (chunk.duration ?? 0);
    },
    error: (err) => {
      encoderError = err;
    },
  });
  /*
   * Default latency mode: the bitrate is a soft average the encoder follows
   * within tens of percent. "realtime" turns it into a hard cap, and on macOS
   * the hardware encoder repays an oversized keyframe by stalling, which
   * froze every capture device for seconds at the start of a recording.
   */
  encoder.configure({
    codec,
    width,
    height,
    framerate,
    bitrate,
    hardwareAcceleration: acceleration,
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
              audioClock.toShared(chunk.timestamp) - pauseOffsetUs,
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
    `stream-recorder: started (${width}x${height}@${Math.round(framerate)}fps, ${codec}, ${acceleration}${audioEncoder ? " + aac mic" : ""})`,
  );

  const reader = new MediaStreamTrackProcessor<VideoFrame>({
    track,
  }).readable.getReader();

  let stopping = false;
  let lastKeyUs = -Infinity;
  const sampleLuma = createLumaSampler();
  const settle = createSettleDetector();

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
      const luma = sampleLuma(frame);
      const settled = luma ? settle.note(luma) : false;
      const sinceKeyUs = frame.timestamp - lastKeyUs;
      const keyFrame =
        forceKeyframe ||
        sinceKeyUs >= KEYFRAME_INTERVAL_US ||
        (settled && sinceKeyUs >= SETTLE_REFRESH_MIN_GAP_US);
      if (keyFrame) {
        lastKeyUs = frame.timestamp;
        forceKeyframe = false;
      }
      videoClock.noteSample(frame.timestamp);
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
          audioClock.noteSample(data.timestamp);
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
