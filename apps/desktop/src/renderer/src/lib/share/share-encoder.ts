/**
 * Wire-format types shared by `share-pipeline.ts` and
 * `share-compositing-encoder.ts`. The compositing encoder owns its own
 * `mp4-muxer` instance and streams muxed bytes via the StreamTarget's
 * onData callback — see share-compositing-encoder.ts for the pipeline.
 */

/** Codec config emitted by the native encoder once at startup. */
export type ShareEncoderFormat = {
  codedWidth: number
  codedHeight: number
  /** H.264 framerate the native encoder is configured for. */
  fps: number
  /** Raw avcC box bytes from VTCompressionSession's outputCallback. */
  description: Uint8Array
}

/** One encoded H.264 picture ready to mux. */
export type ShareChunk = {
  type: 'key' | 'delta'
  /** Presentation timestamp in microseconds. */
  timestamp: number
  /** Frame duration in microseconds. */
  duration: number
  /** Raw NAL unit data in `avc` (length-prefixed) format. */
  data: Uint8Array
}

/** Returned by the compositing encoder's `stop()` after the muxer
 *  finalize callback has drained the last bytes through onData. The
 *  bytes themselves are not held — they were streamed out as they
 *  emerged. */
export type ShareEncoderResult = {
  /** Total muxed bytes shipped through the StreamTarget callback. */
  sizeBytes: number
  /** Encoded video duration in milliseconds. */
  durationMs: number
  encodedFrames: number
  /** Encoded video dims — match the source aspect ratio. */
  width: number
  height: number
  /** First composited frame as a JPEG (~ 50–200 KiB). Uploaded as the
   *  share's OG/Twitter poster — viewer links in chat / X / etc. need
   *  this to show a thumbnail. Null when no frames were composited
   *  (encoder aborted before frame 0). */
  posterBlob: Blob | null
}
