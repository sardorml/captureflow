/** Codec config emitted by the native encoder once at startup. */
export type RecordingEncoderFormat = {
  codedWidth: number;
  codedHeight: number;
  /** H.264 framerate the native encoder is configured for. */
  fps: number;
  /** Raw avcC box bytes from VTCompressionSession's outputCallback. */
  description: Uint8Array;
};

/** One encoded H.264 picture ready to mux. */
export type RecordingChunk = {
  type: "key" | "delta";
  /** Presentation timestamp in microseconds. */
  timestamp: number;
  /** Frame duration in microseconds. */
  duration: number;
  /** Raw NAL unit data in `avc` (length-prefixed) format. */
  data: Uint8Array;
};

/** Returned by the muxer's `stop()` after the finalize callback has
 *  drained the last bytes through onData. The bytes themselves are not
 *  held — they were streamed out as they emerged. */
export type RecordingEncoderResult = {
  /** Total muxed bytes shipped through the StreamTarget callback. */
  sizeBytes: number;
  /** Muxed video duration in milliseconds (pause-adjusted). */
  durationMs: number;
  encodedFrames: number;
  /** Video dims — match the source aspect ratio. */
  width: number;
  height: number;
  // First keyframe as a JPEG (~ 50–200 KiB). Uploaded as the recording's OG/Twitter poster — viewer links in chat / X / etc. need this to show a thumbnail. Null when the muxer never saw a keyframe.
  posterBlob: Blob | null;
};
