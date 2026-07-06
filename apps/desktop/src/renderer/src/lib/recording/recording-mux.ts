import { Muxer, StreamTarget } from "mp4-muxer";
import type {
  RecordingEncoderFormat,
  RecordingEncoderResult,
  RecordingChunk,
} from "./recording-encoder";

// Matches the native VTCompressionSession output (Baseline 3.2).
const NATIVE_CODEC = "avc1.42E020";

const POSTER_JPEG_QUALITY = 0.85;

export type RecordingAudioConfig = {
  sampleRate: number;
  numberOfChannels: number;
  // AudioSpecificConfig bytes — the 2-byte descriptor from the MP4 esds box. mp4-muxer accepts it verbatim as decoderConfig.description.
  description: Uint8Array;
};

export type RecordingAudioChunk = {
  timestamp: number;
  duration: number;
  data: Uint8Array;
};

export type RecordingMuxerOptions = {
  format: RecordingEncoderFormat;
  // Null when the recording has no system audio (captureAudio=false).
  audioConfig: RecordingAudioConfig | null;
  onChunkBytes: (bytes: Uint8Array, position: number) => void;
};

/*
 * Muxes the native recorder's pre-encoded H.264/AAC records straight into a
 * fragmented MP4 — no decode, no re-encode. The native tap keeps emitting
 * chunks with wall-clock PTS while the recording is paused, so pause() drops
 * chunks and resume() splices at the next keyframe (2s GOP → up to ~2s of
 * post-resume content is trimmed), rebasing each track's PTS for continuity.
 */
export class RecordingMuxer {
  private readonly format: RecordingEncoderFormat;
  private readonly audioConfig: RecordingAudioConfig | null;

  private muxer: Muxer<StreamTarget> | null = null;

  private splice: "live" | "paused" | "awaiting-key" = "live";
  private videoOffsetUs = 0;
  private audioOffsetUs = 0;
  private lastVideoEndUs = 0;
  private lastAudioEndUs = 0;
  private audioResyncPending = false;

  private videoDescribed = false;
  private audioDescribed = false;
  private muxedFrames = 0;
  private totalBytes = 0;
  private finalized = false;

  private posterPromise: Promise<Blob> | null = null;

  constructor(opts: RecordingMuxerOptions) {
    this.format = opts.format;
    this.audioConfig = opts.audioConfig;
    const onChunkBytes = opts.onChunkBytes;

    const target = new StreamTarget({
      onData: (data, position) => {
        this.totalBytes = Math.max(this.totalBytes, position + data.byteLength);
        onChunkBytes(data, position);
      },
      chunked: false,
    });
    this.muxer = new Muxer({
      target,
      video: {
        codec: "avc",
        width: this.format.codedWidth,
        height: this.format.codedHeight,
        frameRate: this.format.fps,
      },
      audio: this.audioConfig
        ? {
            codec: "aac",
            numberOfChannels: this.audioConfig.numberOfChannels,
            sampleRate: this.audioConfig.sampleRate,
          }
        : undefined,
      // Fragmented MP4 lets the file start playing before finalize.
      fastStart: "fragmented",
    });
  }

  pushChunk(chunk: RecordingChunk): void {
    if (this.finalized)
      throw new Error("RecordingMuxer.pushChunk after stop()");
    if (!this.muxer) throw new Error("RecordingMuxer not initialized");
    if (this.splice === "paused") return;
    if (this.splice === "awaiting-key") {
      if (chunk.type !== "key") return;
      this.videoOffsetUs = chunk.timestamp - this.lastVideoEndUs;
      this.audioResyncPending = true;
      this.splice = "live";
    }
    const timestamp = chunk.timestamp - this.videoOffsetUs;
    if (!this.posterPromise && chunk.type === "key") {
      this.startPosterDecode(chunk);
    }
    this.muxer.addVideoChunkRaw(
      chunk.data,
      chunk.type,
      timestamp,
      chunk.duration,
      this.videoDescribed
        ? undefined
        : {
            decoderConfig: {
              codec: NATIVE_CODEC,
              description: this.format.description,
            },
          },
    );
    this.videoDescribed = true;
    this.lastVideoEndUs = timestamp + chunk.duration;
    this.muxedFrames++;
  }

  pushAudioChunk(chunk: RecordingAudioChunk): void {
    if (this.finalized) return;
    if (!this.muxer || !this.audioConfig) return;
    // Audio resumes with the video splice so both tracks cut the same stretch.
    if (this.splice !== "live") return;
    if (this.audioResyncPending) {
      this.audioOffsetUs = chunk.timestamp - this.lastAudioEndUs;
      this.audioResyncPending = false;
    }
    const timestamp = chunk.timestamp - this.audioOffsetUs;
    this.muxer.addAudioChunkRaw(
      chunk.data,
      "key",
      timestamp,
      chunk.duration,
      this.audioDescribed
        ? undefined
        : {
            decoderConfig: {
              codec: "mp4a.40.2",
              numberOfChannels: this.audioConfig.numberOfChannels,
              sampleRate: this.audioConfig.sampleRate,
              description: this.audioConfig.description,
            },
          },
    );
    this.audioDescribed = true;
    this.lastAudioEndUs = timestamp + chunk.duration;
  }

  pause(): void {
    if (this.finalized) return;
    this.splice = "paused";
  }

  resume(): void {
    if (this.splice === "paused") this.splice = "awaiting-key";
  }

  /** Pause-adjusted duration of the muxed video track so far. */
  get durationMs(): number {
    return Math.round(this.lastVideoEndUs / 1_000);
  }

  async stop(): Promise<RecordingEncoderResult> {
    if (this.finalized) throw new Error("RecordingMuxer.stop called twice");
    this.finalized = true;
    if (!this.muxer) throw new Error("RecordingMuxer.stop before init");

    this.muxer.finalize();
    // A missing poster is degraded but recoverable (no OG image, recording still works).
    const posterBlob = this.posterPromise
      ? await this.posterPromise.catch(() => null)
      : null;
    return {
      sizeBytes: this.totalBytes,
      durationMs: this.durationMs,
      encodedFrames: this.muxedFrames,
      width: this.format.codedWidth,
      height: this.format.codedHeight,
      posterBlob,
    };
  }

  cancel(): void {
    if (this.finalized) return;
    this.finalized = true;
    this.muxer = null;
  }

  get isReady(): boolean {
    return !this.finalized;
  }

  // One-shot decode of the first keyframe for the viewer-link OG poster.
  private startPosterDecode(chunk: RecordingChunk): void {
    const { codedWidth, codedHeight, description } = this.format;
    this.posterPromise = new Promise<Blob>((resolve, reject) => {
      const decoder = new VideoDecoder({
        output: (frame) => {
          try {
            const canvas = new OffscreenCanvas(codedWidth, codedHeight);
            const ctx = canvas.getContext("2d", { alpha: false });
            if (!ctx) throw new Error("poster: 2d ctx unavailable");
            ctx.drawImage(frame, 0, 0, codedWidth, codedHeight);
            resolve(
              canvas.convertToBlob({
                type: "image/jpeg",
                quality: POSTER_JPEG_QUALITY,
              }),
            );
          } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
          } finally {
            frame.close();
            try {
              decoder.close();
            } catch {
              /* already closed */
            }
          }
        },
        error: (err) => reject(err),
      });
      decoder.configure({
        codec: NATIVE_CODEC,
        codedWidth,
        codedHeight,
        hardwareAcceleration: "prefer-hardware",
        description,
      });
      decoder.decode(
        new EncodedVideoChunk({
          type: "key",
          timestamp: chunk.timestamp,
          duration: chunk.duration,
          data: chunk.data,
        }),
      );
      // Forces the single buffered frame out; rejects once close() lands, which is fine.
      decoder.flush().catch(() => {});
    });
  }
}
