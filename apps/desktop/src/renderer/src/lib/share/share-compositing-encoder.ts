/**
 * CompositingShareEncoder
 * ───────────────────────
 * Real-time pipeline:
 *
 *   native H.264 chunks ──▶ VideoDecoder ──▶ OffscreenCanvas composite
 *                                            (screen frame + cursor only)
 *   native AAC packets  ─────────────────────────────────────────▶ passthrough
 *
 *   composited frames + AAC chunks ──▶ mp4-muxer (StreamTarget) ──▶ onChunkBytes(bytes)
 *
 * `onChunkBytes` ships muxed bytes to the main process via
 * `window.electronAPI.sharePartScreen(bytes)` as soon as the muxer
 * emits them.
 *
 * Audio architecture:
 *   The renderer does not capture system audio via getDisplayMedia /
 *   WebCodecs AudioEncoder — that path returned an already-ended
 *   MediaStreamTrack on Electron 39 and produced silent 6-byte AAC
 *   frames. Instead, the native Swift recorder AAC-encodes SCK's audio
 *   tap and writes the packets directly to fd 3 alongside video chunks.
 *   The renderer receives them as `audio-chunk` events and hands the
 *   raw bytes to the muxer — no decode, no re-encode. This module's
 *   responsibility is purely the video composite plus muxing both
 *   streams.
 */

import { Muxer, StreamTarget } from 'mp4-muxer'
import type { ShareEncoderFormat, ShareEncoderResult, ShareChunk } from './share-encoder'
import { getCursorHotspot, loadCursorImages, type CursorImageMap } from '../cursor-assets'
import { interpolateCursor } from './cursor-interpolation'
import type { CursorPosition } from '../../../../shared/types'

const ENCODE_BITRATE = 8_000_000
const OUTPUT_FPS = 30
const ENCODE_CODEC_CANDIDATES = [
  'avc1.4D4029', // Main 4.1
  'avc1.42E029' // Baseline 4.1 (fallback)
] as const

const CURSOR_DRAW_PX = 36

// Audio config arrives as a separate fd-3 event (tag 0x03). The
// pipeline holds the encoder construction until both video format AND
// audio config (when expected) are known, so the muxer can reserve
// both tracks at construction time — mp4-muxer cannot add a track
// after the fact.
export type ShareAudioConfig = {
  sampleRate: number
  numberOfChannels: number
  // AudioSpecificConfig bytes — the same 2-byte descriptor that lives
  // inside an MP4 esds box. mp4-muxer accepts it verbatim as the
  // audio decoderConfig.description on the first chunk.
  description: Uint8Array
}

export type CompositingShareEncoderOptions = {
  format: ShareEncoderFormat
  cursorPositions: () => CursorPosition[]
  // Audio config from the native fd-3 audio-format event. Null when
  // the recording has no system audio (captureAudio=false). When
  // provided, the muxer reserves an AAC audio track and the
  // pushAudioChunk() method forwards raw AAC packets through.
  audioConfig: ShareAudioConfig | null
  // Sink for muxed bytes. Called for every chunk the muxer emits
  // through its StreamTarget. Position is the byte offset into the
  // final file (mp4-muxer is StreamTarget-compatible).
  onChunkBytes: (bytes: Uint8Array, position: number) => void
}

// One AAC packet's worth of input to pushAudioChunk.
export type ShareAudioChunk = {
  timestamp: number
  duration: number
  data: Uint8Array
}

async function pickSupportedCodec(probe: {
  width: number
  height: number
  framerate: number
  bitrate: number
}): Promise<string> {
  for (const codec of ENCODE_CODEC_CANDIDATES) {
    try {
      const res = await VideoEncoder.isConfigSupported({
        codec,
        width: probe.width,
        height: probe.height,
        framerate: probe.framerate,
        bitrate: probe.bitrate,
        hardwareAcceleration: 'prefer-hardware',
        avc: { format: 'avc' }
      })
      if (res.supported) return codec
    } catch {
      /* some browsers throw on unknown codec strings */
    }
  }
  return ENCODE_CODEC_CANDIDATES[ENCODE_CODEC_CANDIDATES.length - 1]
}

export class CompositingShareEncoder {
  private readonly format: ShareEncoderFormat
  private readonly cursorPositions: () => CursorPosition[]
  private readonly audioConfig: ShareAudioConfig | null
  private readonly onChunkBytes: (bytes: Uint8Array, position: number) => void

  private decoder: VideoDecoder | null = null
  private encoder: VideoEncoder | null = null
  private muxer: Muxer<StreamTarget> | null = null
  private canvas: OffscreenCanvas | null = null
  private ctx: OffscreenCanvasRenderingContext2D | null = null
  private cursorImages: CursorImageMap | null = null

  private inFrameIdx = 0
  private outFrameIdx = 0
  private sampleStride = 1
  private encodedCount = 0
  private lastTimestampUs = 0
  private lastDurationUs = 0
  private outputCodec = 'avc1.42E029'
  private outputFps = OUTPUT_FPS
  private totalBytes = 0

  // First audio chunk carries the decoderConfig.description
  // (AudioSpecificConfig). Subsequent chunks skip it.
  private audioDescriptionEmitted = false
  private audioChunksMuxed = 0

  private processingChain: Promise<void> = Promise.resolve()
  private decoderError: Error | null = null
  private encoderError: Error | null = null
  private finalized = false
  private ready = false

  // First composited frame, captured as a JPEG. Used as the share's
  // OG/Twitter poster — without it the viewer link in chat / X / etc.
  // shows no thumbnail. Captured BEFORE re-encoding (same canvas
  // contents, no extra cost) and held as a Promise so we don't block
  // frame emission. Resolved once on `outFrameIdx === 0`.
  private posterPromise: Promise<Blob> | null = null

  constructor(opts: CompositingShareEncoderOptions) {
    this.format = opts.format
    this.cursorPositions = opts.cursorPositions
    this.audioConfig = opts.audioConfig
    this.onChunkBytes = opts.onChunkBytes
  }

  async init(): Promise<void> {
    const { codedWidth: width, codedHeight: height, fps } = this.format

    this.canvas = new OffscreenCanvas(width, height)
    const ctx = this.canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('CompositingShareEncoder: 2d ctx unavailable')
    this.ctx = ctx

    this.cursorImages = await loadCursorImages()

    this.outputFps = fps >= OUTPUT_FPS * 2 ? OUTPUT_FPS : fps
    this.sampleStride = Math.max(1, Math.round(fps / this.outputFps))

    // Audio track is optional. When audioConfig is non-null, the
    // pipeline received an `audio-format` event before init — that
    // tells us native's AAC encoder produced its first packet and the
    // sample/channel layout is known. mp4-muxer locks its track set at
    // construction; the pipeline guarantees both formats have arrived
    // before calling init() so this single allocation covers both
    // tracks. If audioConfig is null, the recording is video-only
    // (e.g. user disabled system audio capture).
    const muxerAudio = this.audioConfig
      ? {
          codec: 'aac' as const,
          numberOfChannels: this.audioConfig.numberOfChannels,
          sampleRate: this.audioConfig.sampleRate
        }
      : undefined

    const target = new StreamTarget({
      onData: (data, position) => {
        this.totalBytes = Math.max(this.totalBytes, position + data.byteLength)
        this.onChunkBytes(data, position)
      },
      chunked: false
    })
    this.muxer = new Muxer({
      target,
      video: { codec: 'avc', width, height, frameRate: this.outputFps },
      audio: muxerAudio,
      // Fragmented MP4 lets the file start playing before finalize —
      // required for the share page's "Preparing your share…" loader
      // to swap to the real player once the slug resolves to ready.
      fastStart: 'fragmented'
    })

    this.outputCodec = await pickSupportedCodec({
      width,
      height,
      framerate: this.outputFps,
      bitrate: ENCODE_BITRATE
    })

    this.encoder = new VideoEncoder({
      output: (chunk, meta) => {
        this.muxer?.addVideoChunk(chunk, meta)
        this.encodedCount++
      },
      error: (err) => {
        this.encoderError = err
      }
    })
    this.encoder.configure({
      codec: this.outputCodec,
      width,
      height,
      framerate: this.outputFps,
      bitrate: ENCODE_BITRATE,
      hardwareAcceleration: 'prefer-hardware',
      avc: { format: 'avc' }
    })

    this.decoder = new VideoDecoder({
      output: (frame) => {
        const localIdx = this.inFrameIdx++
        if (localIdx % this.sampleStride !== 0) {
          frame.close()
          return
        }
        this.processingChain = this.processingChain.then(() => this.composeAndEncode(frame))
      },
      error: (err) => {
        this.decoderError = err
      }
    })
    this.decoder.configure({
      codec: 'avc1.42E020', // matches native VTCompressionSession (Baseline 3.2)
      codedWidth: width,
      codedHeight: height,
      hardwareAcceleration: 'prefer-hardware',
      description: this.format.description
    })

    this.ready = true
  }

  pushChunk(chunk: ShareChunk): void {
    if (this.finalized) throw new Error('CompositingShareEncoder.pushChunk after stop()')
    if (!this.ready || !this.decoder) throw new Error('CompositingShareEncoder not initialized')
    if (this.decoderError) throw this.decoderError
    this.lastTimestampUs = chunk.timestamp
    this.lastDurationUs = chunk.duration
    this.decoder.decode(
      new EncodedVideoChunk({
        type: chunk.type,
        timestamp: chunk.timestamp,
        duration: chunk.duration,
        data: chunk.data
      })
    )
  }

  // Pass a native-encoded AAC packet straight to the muxer. The first
  // call carries the AudioSpecificConfig via decoderConfig; subsequent
  // calls reuse the configured track. AAC packets are always keyframes
  // (each is independently decodable).
  pushAudioChunk(chunk: ShareAudioChunk): void {
    if (this.finalized) return
    if (!this.ready || !this.muxer) return
    if (!this.audioConfig) return
    const encoded = new EncodedAudioChunk({
      type: 'key',
      timestamp: chunk.timestamp,
      duration: chunk.duration,
      data: chunk.data
    })
    if (!this.audioDescriptionEmitted) {
      this.muxer.addAudioChunk(encoded, {
        decoderConfig: {
          codec: 'mp4a.40.2',
          numberOfChannels: this.audioConfig.numberOfChannels,
          sampleRate: this.audioConfig.sampleRate,
          description: this.audioConfig.description
        }
      })
      this.audioDescriptionEmitted = true
    } else {
      this.muxer.addAudioChunk(encoded, {})
    }
    this.audioChunksMuxed++
  }

  async stop(): Promise<ShareEncoderResult> {
    if (this.finalized) throw new Error('CompositingShareEncoder.stop called twice')
    this.finalized = true
    if (!this.decoder || !this.encoder || !this.muxer) {
      throw new Error('CompositingShareEncoder.stop before init')
    }

    await this.decoder.flush()
    this.decoder.close()
    if (this.decoderError) throw this.decoderError
    await this.processingChain
    await this.encoder.flush()
    this.encoder.close()
    if (this.encoderError) throw this.encoderError

    this.muxer.finalize()
    const durationMs = Math.round((this.lastTimestampUs + this.lastDurationUs) / 1_000)
    // Resolve the poster snapshot — it was scheduled when frame 0 hit
    // the canvas, so by stop() it's almost always already resolved.
    // Swallow failures: a missing poster is a degraded but recoverable
    // state (no OG image, but the share still works).
    const posterBlob = this.posterPromise ? await this.posterPromise.catch(() => null) : null
    return {
      sizeBytes: this.totalBytes,
      durationMs,
      encodedFrames: this.encodedCount,
      width: this.format.codedWidth,
      height: this.format.codedHeight,
      posterBlob
    }
  }

  cancel(): void {
    if (this.finalized) return
    this.finalized = true
    try {
      this.decoder?.close()
    } catch {
      /* ignore */
    }
    try {
      this.encoder?.close()
    } catch {
      /* ignore */
    }
    this.decoder = null
    this.encoder = null
    this.muxer = null
  }

  get isReady(): boolean {
    return this.ready && !this.finalized
  }

  private async composeAndEncode(frame: VideoFrame): Promise<void> {
    try {
      if (!this.ctx || !this.encoder || this.encoderError) {
        frame.close()
        return
      }
      const ctx = this.ctx
      const w = this.format.codedWidth
      const h = this.format.codedHeight

      // Screen frame fills the canvas — no bg framing, no padding.
      ctx.drawImage(frame, 0, 0, w, h)

      // Cursor — interpolated by frame timestamp. The cursor stream is
      // timestamped in ms relative to recording start; chunk timestamps
      // are microseconds since the first emitted chunk, which lines up
      // closely enough for cursor display.
      if (this.cursorImages) {
        const cursors = this.cursorPositions()
        const tsMs = Math.round(frame.timestamp / 1000)
        const pos = interpolateCursor(cursors, tsMs)
        if (pos) {
          const img = this.cursorImages.get(pos.cursorType)
          if (img) {
            const cx = pos.x * w
            const cy = pos.y * h
            const hot = getCursorHotspot(pos.cursorType)
            const size = CURSOR_DRAW_PX
            ctx.drawImage(img, cx - hot.x * size, cy - hot.y * size, size, size)
          }
        }
      }

      // Encode the composited canvas — keyframe every ~2 seconds.
      const keyFrame =
        this.outFrameIdx === 0 ||
        this.outFrameIdx % Math.max(1, Math.round(this.outputFps * 2)) === 0
      if (!this.canvas) {
        frame.close()
        return
      }
      // Snapshot the very first composited frame as the share's poster.
      // Same pixel content the muxer will key-frame in a moment; capture
      // here so we don't have to decode the produced MP4 to recover a
      // thumbnail. JPEG q=0.85 stays well under the worker's 2 MiB cap.
      if (this.outFrameIdx === 0 && !this.posterPromise) {
        this.posterPromise = this.canvas.convertToBlob({
          type: 'image/jpeg',
          quality: 0.85
        })
      }
      const outFrame = new VideoFrame(this.canvas, {
        timestamp: frame.timestamp,
        duration: frame.duration === null ? undefined : frame.duration
      })
      this.outFrameIdx++
      this.encoder.encode(outFrame, { keyFrame })
      outFrame.close()
    } finally {
      frame.close()
    }
  }
}
