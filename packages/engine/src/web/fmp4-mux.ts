import { Muxer, StreamTarget } from "mp4-muxer";

/*
 * The canonical output muxer (requirement: identical recordings from every
 * app). H.264 + AAC in fragmented MP4 — fragments stream out through
 * `output` as they are written, so uploads can start before finalize.
 */
export type Fmp4MuxerOptions = {
  video: { width: number; height: number; frameRate: number };
  audio?: { numberOfChannels: number; sampleRate: number } | null;
  output(bytes: Uint8Array, position: number): void;
  // 'offset' rebases the first chunk to t=0 — needed when encoder timestamps
  // don't start at zero (MediaStream capture clocks).
  firstTimestampBehavior?: "strict" | "offset" | "cross-track-offset";
};

export type Fmp4Muxer = {
  addVideoChunkRaw(
    data: Uint8Array,
    type: "key" | "delta",
    timestampUs: number,
    durationUs: number,
    meta?: EncodedVideoChunkMetadata,
  ): void;
  addVideoChunk(
    chunk: EncodedVideoChunk,
    meta?: EncodedVideoChunkMetadata,
  ): void;
  addAudioChunkRaw(
    data: Uint8Array,
    timestampUs: number,
    durationUs: number,
    meta?: EncodedAudioChunkMetadata,
  ): void;
  addAudioChunk(
    chunk: EncodedAudioChunk,
    meta?: EncodedAudioChunkMetadata,
  ): void;
  /** High-water mark of bytes shipped through `output`. */
  totalBytes(): number;
  finalize(): void;
};

export function createFmp4Muxer(opts: Fmp4MuxerOptions): Fmp4Muxer {
  let totalBytes = 0;
  const muxer = new Muxer({
    target: new StreamTarget({
      onData: (data, position) => {
        totalBytes = Math.max(totalBytes, position + data.byteLength);
        opts.output(data, position);
      },
      chunked: false,
    }),
    video: {
      codec: "avc",
      width: opts.video.width,
      height: opts.video.height,
      frameRate: opts.video.frameRate,
    },
    audio: opts.audio
      ? {
          codec: "aac",
          numberOfChannels: opts.audio.numberOfChannels,
          sampleRate: opts.audio.sampleRate,
        }
      : undefined,
    fastStart: "fragmented",
    firstTimestampBehavior: opts.firstTimestampBehavior,
  });

  return {
    addVideoChunkRaw(data, type, timestampUs, durationUs, meta) {
      muxer.addVideoChunkRaw(data, type, timestampUs, durationUs, meta);
    },
    addVideoChunk(chunk, meta) {
      muxer.addVideoChunk(chunk, meta);
    },
    addAudioChunkRaw(data, timestampUs, durationUs, meta) {
      muxer.addAudioChunkRaw(data, "key", timestampUs, durationUs, meta);
    },
    addAudioChunk(chunk, meta) {
      muxer.addAudioChunk(chunk, meta);
    },
    totalBytes() {
      return totalBytes;
    },
    finalize() {
      muxer.finalize();
    },
  };
}
