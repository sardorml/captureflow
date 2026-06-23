/**
 * SharePipeline
 * ─────────────
 * Renderer-side consumer of the native share-export stream. Owns one
 * `CompositingShareEncoder` per recording session and ships muxed
 * bytes to the main process via `window.electronAPI.sharePartScreen`
 * as they emerge.
 *
 * Lifecycle:
 *   attach()                 — wire the IPC bridge once at app boot
 *   arm({ audioExpected })   — call when a recording starts
 *   finish()                 — call after stopNativeRecording; awaits
 *                              encoder flush and returns metadata
 *   abort()                  — cancel mid-recording (delete/restart/crash)
 *
 * Both video and audio enter via the same fd 3: native AAC-encodes the
 * system audio tap and emits packets alongside the H.264 video chunks.
 * mp4-muxer locks its track set at construction, so the pipeline waits
 * for the FIRST `audio-format` event (and the first `format` video
 * event) before constructing the encoder — queueing any chunks that
 * arrive in the meantime. When `audioExpected` is false, the pipeline
 * starts the encoder as soon as the video format arrives and the
 * resulting MP4 has no audio track.
 *
 * Mic audio is NOT here — it rides along with the webcam companion
 * (see share-webcam-uploader.ts), so mic and system audio are
 * independently muteable on the web edit page.
 *
 * 5min cap: when accumulated duration exceeds SHARE_CAP_MS, the encoder
 * is cancelled and state transitions to 'over-cap'. The recording
 * itself continues — instant share is purely additive.
 */

import { CompositingShareEncoder } from './share-compositing-encoder'
import type { ShareEncoderResult } from './share-encoder'
import type { CursorPosition, ShareFrameEvent } from '../../../../shared/types'
import { logRendererInfo, logRendererWarn } from './share-log'

export type ShareArmOptions = {
  // Whether system audio will arrive on the share fd. When true, init
  // waits for the first audio-format event so the muxer can reserve an
  // audio track up front (mp4-muxer can't add tracks after the fact).
  audioExpected: boolean
}

// How long to wait for the first audio-format event after the first
// video format arrives, before giving up and proceeding video-only.
// Native emits the audio format on its first AAC packet (~21ms after
// audio capture starts), so 1 second is generous.
const AUDIO_FORMAT_WAIT_MS = 1000

export const SHARE_CAP_MS = 300_000
// Slack on top of the visible cap: when the toolbar auto-stops at 0:00,
// the chain countdown → IPC → native finalize takes ~300–600ms during
// which a few more chunks land. Up to this much overshoot is
// acceptable; anything beyond is treated as a real over-cap.
const SHARE_CAP_SLACK_MS = 2_000

// Live cursor positions streamed from main (CURSOR_POSITION_EVENT).
const CURSOR_BUFFER_MAX = 8_000 // ~60s of 120fps samples
const cursorBuffer: CursorPosition[] = []

export type SharePipelineState =
  | { status: 'idle' }
  | { status: 'armed' }
  | { status: 'encoding'; durationMs: number }
  | { status: 'over-cap' }
  | { status: 'ready'; result: ShareEncoderResult }
  | { status: 'aborted'; reason: string }

class SharePipeline {
  private encoder: CompositingShareEncoder | null = null
  private state: SharePipelineState = { status: 'idle' }
  private listeners = new Set<(s: SharePipelineState) => void>()
  private attached = false
  private armed = false
  // Captured at arm() time. Threaded into the compositing encoder when
  // the first 'format' event lands and we instantiate it.
  private armOptions: ShareArmOptions | null = null
  // Queue of events (video + audio chunks) that arrived before the
  // encoder finished initialising. Drained in order once ready.
  private pendingChunks: ShareFrameEvent[] = []
  private encoderInitializing = false
  private cursorUnsub: (() => void) | null = null
  // Cached formats. Both must be present (when audioExpected) before
  // the encoder is constructed — mp4-muxer locks the track set at
  // creation, so the audio config has to be known up front.
  private pendingVideoFormat: Extract<ShareFrameEvent, { kind: 'format' }> | null = null
  private pendingAudioFormat: Extract<ShareFrameEvent, { kind: 'audio-format' }> | null = null
  // Timer that triggers a video-only fallback when audioExpected was
  // true but no audio-format arrived within AUDIO_FORMAT_WAIT_MS of
  // the video format. Cleared if the audio format eventually arrives.
  private audioWaitTimer: number | null = null

  getState(): SharePipelineState {
    return this.state
  }

  subscribe(listener: (s: SharePipelineState) => void): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** Connect the IPC bridge. Idempotent — safe in React StrictMode. */
  attach(): void {
    if (this.attached) return
    this.attached = true
    window.electronAPI.onShareFrameEvent((event) => this.handleEvent(event))
  }

  /** Mark a new recording session as expecting share frames. The
   *  encoder is instantiated lazily on the first 'format' event. */
  arm(options: ShareArmOptions): void {
    this.encoder?.cancel()
    this.encoder = null
    this.pendingChunks = []
    this.encoderInitializing = false
    this.pendingVideoFormat = null
    this.pendingAudioFormat = null
    if (this.audioWaitTimer !== null) {
      window.clearTimeout(this.audioWaitTimer)
      this.audioWaitTimer = null
    }
    cursorBuffer.length = 0
    this.cursorUnsub?.()
    this.cursorUnsub = null
    this.armOptions = options
    logRendererInfo(`share-pipeline: arm (audioExpected=${options.audioExpected})`)

    // Live cursor positions for the compositing encoder's cursor draw.
    this.cursorUnsub = window.electronAPI.onCursorPosition((pos) => {
      cursorBuffer.push(pos)
      if (cursorBuffer.length > CURSOR_BUFFER_MAX) {
        cursorBuffer.splice(0, cursorBuffer.length - CURSOR_BUFFER_MAX)
      }
    })
    this.armed = true
    this.setState({ status: 'armed' })
  }

  /** Finalize the encoder. Main gets the last muxed bytes via
   *  onChunkBytes during the muxer.finalize() pass. */
  async finish(): Promise<ShareEncoderResult | null> {
    this.armed = false
    const current = this.encoder
    this.encoder = null
    this.cursorUnsub?.()
    this.cursorUnsub = null
    if (!current || !current.isReady) return null
    try {
      const result = await current.stop()
      this.setState({ status: 'ready', result })
      return result
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err)
      this.setState({ status: 'aborted', reason })
      return null
    }
  }

  /** Discard the in-flight encoder. */
  abort(reason: string): void {
    this.armed = false
    this.encoder?.cancel()
    this.encoder = null
    this.cursorUnsub?.()
    this.cursorUnsub = null
    this.setState({ status: 'aborted', reason })
  }

  private handleEvent(event: ShareFrameEvent): void {
    if (!this.armed) return
    if (event.kind === 'format') {
      this.pendingVideoFormat = event
      logRendererInfo(
        `share-pipeline: video format (${event.codedWidth}x${event.codedHeight}@${event.fps}fps)`
      )
      this.tryStartEncoder()
      return
    }
    if (event.kind === 'audio-format') {
      this.pendingAudioFormat = event
      logRendererInfo(
        `share-pipeline: audio format (${event.sampleRate}Hz, ${event.numberOfChannels}ch)`
      )
      if (this.audioWaitTimer !== null) {
        window.clearTimeout(this.audioWaitTimer)
        this.audioWaitTimer = null
      }
      this.tryStartEncoder()
      return
    }
    if (event.kind === 'chunk') {
      const endUs = event.timestamp + event.duration
      const durationMs = Math.round(endUs / 1000)
      if (durationMs > SHARE_CAP_MS + SHARE_CAP_SLACK_MS) {
        this.encoder?.cancel()
        this.encoder = null
        this.pendingChunks = []
        this.setState({ status: 'over-cap' })
        return
      }
      if (this.encoderInitializing || !this.encoder) {
        this.pendingChunks.push(event)
        this.setState({ status: 'encoding', durationMs })
        return
      }
      try {
        this.encoder.pushChunk({
          type: event.type,
          timestamp: event.timestamp,
          duration: event.duration,
          data: event.data
        })
        this.setState({ status: 'encoding', durationMs })
      } catch (err) {
        this.abort(err instanceof Error ? err.message : String(err))
      }
      return
    }
    if (event.kind === 'audio-chunk') {
      if (this.encoderInitializing || !this.encoder) {
        this.pendingChunks.push(event)
        return
      }
      try {
        this.encoder.pushAudioChunk({
          timestamp: event.timestamp,
          duration: event.duration,
          data: event.data
        })
      } catch (err) {
        // Audio failures shouldn't tear down the whole share — just
        // log and continue with whatever video we've already shipped.
        logRendererWarn(
          `share-pipeline: audio chunk push failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        )
      }
      return
    }
    // 'end' — native-side end-of-stream. The recorder hook calls
    // finish() explicitly on stopNativeRecording; nothing to do here.
    logRendererInfo('share-pipeline: native end-of-stream')
  }

  // Construct the compositing encoder once we have everything we need.
  // Called from both the format and audio-format event handlers — the
  // first one that completes the "have all required formats" condition
  // wins; the other becomes a no-op via the `encoder != null` guard.
  private tryStartEncoder(): void {
    if (this.encoder || this.encoderInitializing) return
    if (!this.armOptions) {
      logRendererWarn('share-pipeline: format event arrived without armOptions')
      return
    }
    const videoFormat = this.pendingVideoFormat
    if (!videoFormat) return
    const audioFormat = this.pendingAudioFormat
    if (this.armOptions.audioExpected && !audioFormat) {
      // Hold off — wait briefly for audio-format. If it doesn't arrive
      // (e.g. SCK didn't deliver any audio frames despite capture
      // enabled), fall back to video-only after AUDIO_FORMAT_WAIT_MS.
      if (this.audioWaitTimer === null) {
        this.audioWaitTimer = window.setTimeout(() => {
          this.audioWaitTimer = null
          if (this.encoder || this.encoderInitializing) return
          logRendererWarn(
            `share-pipeline: audio-format did not arrive within ${AUDIO_FORMAT_WAIT_MS}ms — proceeding video-only`
          )
          this.startEncoder(videoFormat, null)
        }, AUDIO_FORMAT_WAIT_MS)
      }
      return
    }
    this.startEncoder(videoFormat, audioFormat)
  }

  private startEncoder(
    videoFormat: Extract<ShareFrameEvent, { kind: 'format' }>,
    audioFormat: Extract<ShareFrameEvent, { kind: 'audio-format' }> | null
  ): void {
    if (this.encoder || this.encoderInitializing) return
    const format = {
      codedWidth: videoFormat.codedWidth,
      codedHeight: videoFormat.codedHeight,
      fps: videoFormat.fps,
      description: videoFormat.description
    }
    const compositing = new CompositingShareEncoder({
      format,
      cursorPositions: () => cursorBuffer,
      audioConfig: audioFormat
        ? {
            sampleRate: audioFormat.sampleRate,
            numberOfChannels: audioFormat.numberOfChannels,
            description: audioFormat.description
          }
        : null,
      onChunkBytes: (bytes) => {
        // Streaming sink: ship each muxer chunk straight to main.
        // Detach into a fresh ArrayBuffer so IPC's structured clone
        // doesn't try to transfer a Uint8Array view backed by a
        // larger buffer than the slice we want to send.
        const out = new ArrayBuffer(bytes.byteLength)
        new Uint8Array(out).set(bytes)
        window.electronAPI.sharePartScreen(out)
      }
    })
    this.encoder = compositing
    this.encoderInitializing = true
    void compositing
      .init()
      .then(() => {
        this.encoderInitializing = false
        const queued = this.pendingChunks
        this.pendingChunks = []
        for (const evt of queued) {
          if (!this.encoder) break
          try {
            if (evt.kind === 'chunk') {
              this.encoder.pushChunk({
                type: evt.type,
                timestamp: evt.timestamp,
                duration: evt.duration,
                data: evt.data
              })
            } else if (evt.kind === 'audio-chunk') {
              this.encoder.pushAudioChunk({
                timestamp: evt.timestamp,
                duration: evt.duration,
                data: evt.data
              })
            }
          } catch (err) {
            this.abort(err instanceof Error ? err.message : String(err))
            break
          }
        }
      })
      .catch((err: unknown) => {
        this.encoderInitializing = false
        this.encoder = null
        this.pendingChunks = []
        const reason = err instanceof Error ? err.message : String(err)
        logRendererWarn(`share-pipeline: compositing init failed: ${reason}`)
        this.setState({ status: 'aborted', reason })
      })
    this.setState({ status: 'encoding', durationMs: 0 })
  }

  private setState(next: SharePipelineState): void {
    this.state = next
    for (const listener of this.listeners) {
      listener(next)
    }
  }
}

export const sharePipeline = new SharePipeline()
