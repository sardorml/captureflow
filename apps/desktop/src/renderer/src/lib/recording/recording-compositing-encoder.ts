import { Muxer, StreamTarget } from "mp4-muxer";
import type {
  RecordingEncoderFormat,
  RecordingEncoderResult,
  RecordingChunk,
} from "./recording-encoder";
import {
  getCursorHotspot,
  loadCursorImages,
  type CursorImageMap,
} from "../cursor-assets";
import { interpolateCursor } from "./cursor-interpolation";
import type { CursorPosition } from "../../../../shared/types";

const ENCODE_BITRATE = 8_000_000;
const OUTPUT_FPS = 30;
const ENCODE_CODEC_CANDIDATES = [
  "avc1.4D4029", // Main 4.1
  "avc1.42E029", // Baseline 4.1 (fallback)
] as const;

const CURSOR_DRAW_PX = 36;

export type RecordingAudioConfig = {
  sampleRate: number;
  numberOfChannels: number;
  // AudioSpecificConfig bytes — the 2-byte descriptor from the MP4 esds box. mp4-muxer accepts it verbatim as decoderConfig.description.
  description: Uint8Array;
};

export type CompositingRecordingEncoderOptions = {
  format: RecordingEncoderFormat;
  cursorPositions: () => CursorPosition[];
  // Null when the recording has no system audio (captureAudio=false).
  audioConfig: RecordingAudioConfig | null;
  onChunkBytes: (bytes: Uint8Array, position: number) => void;
};

export type RecordingAudioChunk = {
  timestamp: number;
  duration: number;
  data: Uint8Array;
};

async function pickSupportedCodec(probe: {
  width: number;
  height: number;
  framerate: number;
  bitrate: number;
}): Promise<string> {
  for (const codec of ENCODE_CODEC_CANDIDATES) {
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
  return ENCODE_CODEC_CANDIDATES[ENCODE_CODEC_CANDIDATES.length - 1];
}

export class CompositingRecordingEncoder {
  private readonly format: RecordingEncoderFormat;
  private readonly cursorPositions: () => CursorPosition[];
  private readonly audioConfig: RecordingAudioConfig | null;
  private readonly onChunkBytes: (bytes: Uint8Array, position: number) => void;

  private decoder: VideoDecoder | null = null;
  private encoder: VideoEncoder | null = null;
  private muxer: Muxer<StreamTarget> | null = null;
  private canvas: OffscreenCanvas | null = null;
  private ctx: OffscreenCanvasRenderingContext2D | null = null;
  private cursorImages: CursorImageMap | null = null;

  private inFrameIdx = 0;
  private outFrameIdx = 0;
  private sampleStride = 1;
  private encodedCount = 0;
  private lastTimestampUs = 0;
  private lastDurationUs = 0;
  private outputCodec = "avc1.42E029";
  private outputFps = OUTPUT_FPS;
  private totalBytes = 0;

  private audioDescriptionEmitted = false;
  private audioChunksMuxed = 0;

  private processingChain: Promise<void> = Promise.resolve();
  private decoderError: Error | null = null;
  private encoderError: Error | null = null;
  private finalized = false;
  private ready = false;

  private posterPromise: Promise<Blob> | null = null;

  constructor(opts: CompositingRecordingEncoderOptions) {
    this.format = opts.format;
    this.cursorPositions = opts.cursorPositions;
    this.audioConfig = opts.audioConfig;
    this.onChunkBytes = opts.onChunkBytes;
  }

  async init(): Promise<void> {
    const { codedWidth: width, codedHeight: height, fps } = this.format;

    this.canvas = new OffscreenCanvas(width, height);
    const ctx = this.canvas.getContext("2d", { alpha: false });
    if (!ctx)
      throw new Error("CompositingRecordingEncoder: 2d ctx unavailable");
    this.ctx = ctx;

    this.cursorImages = await loadCursorImages();

    this.outputFps = fps >= OUTPUT_FPS * 2 ? OUTPUT_FPS : fps;
    this.sampleStride = Math.max(1, Math.round(fps / this.outputFps));

    const muxerAudio = this.audioConfig
      ? {
          codec: "aac" as const,
          numberOfChannels: this.audioConfig.numberOfChannels,
          sampleRate: this.audioConfig.sampleRate,
        }
      : undefined;

    const target = new StreamTarget({
      onData: (data, position) => {
        this.totalBytes = Math.max(this.totalBytes, position + data.byteLength);
        this.onChunkBytes(data, position);
      },
      chunked: false,
    });
    this.muxer = new Muxer({
      target,
      video: { codec: "avc", width, height, frameRate: this.outputFps },
      audio: muxerAudio,
      // Fragmented MP4 lets the file start playing before finalize.
      fastStart: "fragmented",
    });

    this.outputCodec = await pickSupportedCodec({
      width,
      height,
      framerate: this.outputFps,
      bitrate: ENCODE_BITRATE,
    });

    this.encoder = new VideoEncoder({
      output: (chunk, meta) => {
        this.muxer?.addVideoChunk(chunk, meta);
        this.encodedCount++;
      },
      error: (err) => {
        this.encoderError = err;
      },
    });
    this.encoder.configure({
      codec: this.outputCodec,
      width,
      height,
      framerate: this.outputFps,
      bitrate: ENCODE_BITRATE,
      hardwareAcceleration: "prefer-hardware",
      avc: { format: "avc" },
    });

    this.decoder = new VideoDecoder({
      output: (frame) => {
        const localIdx = this.inFrameIdx++;
        if (localIdx % this.sampleStride !== 0) {
          frame.close();
          return;
        }
        this.processingChain = this.processingChain.then(() =>
          this.composeAndEncode(frame),
        );
      },
      error: (err) => {
        this.decoderError = err;
      },
    });
    this.decoder.configure({
      codec: "avc1.42E020", // matches native VTCompressionSession (Baseline 3.2)
      codedWidth: width,
      codedHeight: height,
      hardwareAcceleration: "prefer-hardware",
      description: this.format.description,
    });

    this.ready = true;
  }

  pushChunk(chunk: RecordingChunk): void {
    if (this.finalized)
      throw new Error("CompositingRecordingEncoder.pushChunk after stop()");
    if (!this.ready || !this.decoder)
      throw new Error("CompositingRecordingEncoder not initialized");
    if (this.decoderError) throw this.decoderError;
    this.lastTimestampUs = chunk.timestamp;
    this.lastDurationUs = chunk.duration;
    this.decoder.decode(
      new EncodedVideoChunk({
        type: chunk.type,
        timestamp: chunk.timestamp,
        duration: chunk.duration,
        data: chunk.data,
      }),
    );
  }

  pushAudioChunk(chunk: RecordingAudioChunk): void {
    if (this.finalized) return;
    if (!this.ready || !this.muxer) return;
    if (!this.audioConfig) return;
    const encoded = new EncodedAudioChunk({
      type: "key",
      timestamp: chunk.timestamp,
      duration: chunk.duration,
      data: chunk.data,
    });
    if (!this.audioDescriptionEmitted) {
      this.muxer.addAudioChunk(encoded, {
        decoderConfig: {
          codec: "mp4a.40.2",
          numberOfChannels: this.audioConfig.numberOfChannels,
          sampleRate: this.audioConfig.sampleRate,
          description: this.audioConfig.description,
        },
      });
      this.audioDescriptionEmitted = true;
    } else {
      this.muxer.addAudioChunk(encoded, {});
    }
    this.audioChunksMuxed++;
  }

  async stop(): Promise<RecordingEncoderResult> {
    if (this.finalized)
      throw new Error("CompositingRecordingEncoder.stop called twice");
    this.finalized = true;
    if (!this.decoder || !this.encoder || !this.muxer) {
      throw new Error("CompositingRecordingEncoder.stop before init");
    }

    await this.decoder.flush();
    this.decoder.close();
    if (this.decoderError) throw this.decoderError;
    await this.processingChain;
    await this.encoder.flush();
    this.encoder.close();
    if (this.encoderError) throw this.encoderError;

    this.muxer.finalize();
    const durationMs = Math.round(
      (this.lastTimestampUs + this.lastDurationUs) / 1_000,
    );
    // A missing poster is degraded but recoverable (no OG image, recording still works).
    const posterBlob = this.posterPromise
      ? await this.posterPromise.catch(() => null)
      : null;
    return {
      sizeBytes: this.totalBytes,
      durationMs,
      encodedFrames: this.encodedCount,
      width: this.format.codedWidth,
      height: this.format.codedHeight,
      posterBlob,
    };
  }

  cancel(): void {
    if (this.finalized) return;
    this.finalized = true;
    try {
      this.decoder?.close();
    } catch {
      /* ignore */
    }
    try {
      this.encoder?.close();
    } catch {
      /* ignore */
    }
    this.decoder = null;
    this.encoder = null;
    this.muxer = null;
  }

  get isReady(): boolean {
    return this.ready && !this.finalized;
  }

  private async composeAndEncode(frame: VideoFrame): Promise<void> {
    try {
      if (!this.ctx || !this.encoder || this.encoderError) {
        frame.close();
        return;
      }
      const ctx = this.ctx;
      const w = this.format.codedWidth;
      const h = this.format.codedHeight;

      ctx.drawImage(frame, 0, 0, w, h);

      if (this.cursorImages) {
        const cursors = this.cursorPositions();
        const tsMs = Math.round(frame.timestamp / 1000);
        const pos = interpolateCursor(cursors, tsMs);
        if (pos) {
          const img = this.cursorImages.get(pos.cursorType);
          if (img) {
            const cx = pos.x * w;
            const cy = pos.y * h;
            const hot = getCursorHotspot(pos.cursorType);
            const size = CURSOR_DRAW_PX;
            ctx.drawImage(
              img,
              cx - hot.x * size,
              cy - hot.y * size,
              size,
              size,
            );
          }
        }
      }

      const keyFrame =
        this.outFrameIdx === 0 ||
        this.outFrameIdx % Math.max(1, Math.round(this.outputFps * 2)) === 0;
      if (!this.canvas) {
        frame.close();
        return;
      }
      if (this.outFrameIdx === 0 && !this.posterPromise) {
        this.posterPromise = this.canvas.convertToBlob({
          type: "image/jpeg",
          quality: 0.85,
        });
      }
      const outFrame = new VideoFrame(this.canvas, {
        timestamp: frame.timestamp,
        duration: frame.duration === null ? undefined : frame.duration,
      });
      this.outFrameIdx++;
      this.encoder.encode(outFrame, { keyFrame });
      outFrame.close();
    } finally {
      frame.close();
    }
  }
}
