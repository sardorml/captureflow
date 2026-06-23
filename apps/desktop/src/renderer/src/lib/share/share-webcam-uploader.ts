/**
 * ShareWebcamUploader
 * ───────────────────
 * Combines a webcam video track and a mic audio track into a single
 * MediaStream, instantiates one MediaRecorder over it, and pumps the
 * `dataavailable` chunks to main via `sharePartWebcam(bytes)`. By the
 * time the user clicks stop, most of the webcam companion is already
 * on R2 alongside the screen file.
 *
 * The web viewer plays this companion as a corner PiP overlay; its
 * mic audio plays independently of the screen track's system audio,
 * so each can be muted on its own without re-encoding.
 *
 * Lifecycle:
 *   start({ webcamTrack, micTrack? }) — begin recording + streaming
 *   stop()                            — flush final chunk, return
 *                                       total bytes shipped
 *   abort()                           — cancel without flushing
 */

import { logRendererInfo, logRendererWarn } from './share-log'

// WebM only — the worker reserves the multipart upload with a fixed
// `videos/{slug}-webcam.webm` storage key and `Content-Type: video/webm`.
// Letting MediaRecorder pick MP4 (which Chromium supports first) used
// to produce a .webm-named MP4 file: the share player would download it,
// the browser would try to decode WebM bytes that were actually MP4, and
// the <video> element would freeze on the first frame with no audio.
// Reordering so VP9 is preferred (smaller, sharper at same bitrate)
// with VP8 as the universally-supported fallback.
const WEBCAM_MIME_WEBM_VP9_OPUS = 'video/webm;codecs=vp9,opus'
const WEBCAM_MIME_WEBM_VP8_OPUS = 'video/webm;codecs=vp8,opus'

export type ShareWebcamUploaderInputs = {
  webcamStream: MediaStream
  micStream: MediaStream | null
}

export type ShareWebcamUploaderResult = {
  totalBytes: number
}

export class ShareWebcamUploader {
  private recorder: MediaRecorder | null = null
  private combinedStream: MediaStream | null = null
  private totalBytes = 0
  // Tracks the chain of in-flight ArrayBuffer conversions so we can
  // await them on stop — without this the recorder.onstop resolves
  // before the final dataavailable.toArrayBuffer settles, dropping
  // the last chunk.
  private pendingChunks: Promise<void>[] = []

  start(inputs: ShareWebcamUploaderInputs): void {
    const videoTracks = inputs.webcamStream.getVideoTracks()
    const audioTracks = inputs.micStream?.getAudioTracks() ?? []
    if (videoTracks.length === 0) {
      throw new Error('ShareWebcamUploader: no video tracks on webcam stream')
    }
    const combined = new MediaStream([...videoTracks, ...audioTracks])
    this.combinedStream = combined

    const mimeType = pickMimeType()
    if (!mimeType) {
      throw new Error('ShareWebcamUploader: no supported mimeType for webcam+mic recorder')
    }
    const recorder = new MediaRecorder(combined, {
      mimeType,
      videoBitsPerSecond: 4_000_000,
      audioBitsPerSecond: 128_000
    })

    recorder.ondataavailable = (e) => {
      if (e.data.size === 0) return
      const promise = (async () => {
        const buf = await e.data.arrayBuffer()
        this.totalBytes += buf.byteLength
        window.electronAPI.sharePartWebcam(buf)
      })().catch((err) => {
        logRendererWarn(`share-webcam: chunk forward failed (${String(err)})`)
      })
      this.pendingChunks.push(promise)
    }

    // 200ms chunk cadence balances upload latency (lower = bytes hit
    // R2 sooner) against per-chunk overhead (lower = more HTTP frames
    // queued in main).
    recorder.start(200)
    this.recorder = recorder
    logRendererInfo(`share-webcam: started (mime=${mimeType})`)
  }

  async stop(): Promise<ShareWebcamUploaderResult> {
    const rec = this.recorder
    if (!rec) return { totalBytes: this.totalBytes }
    await new Promise<void>((resolve) => {
      if (rec.state === 'inactive') {
        resolve()
        return
      }
      rec.onstop = () => resolve()
      rec.requestData()
      rec.stop()
    })
    // Wait for any in-flight ArrayBuffer conversions before reporting
    // bytes — dropping the tail chunk silently is the worst kind of
    // bug in a streaming pipeline.
    await Promise.allSettled(this.pendingChunks)
    this.pendingChunks = []
    this.cleanupStream()
    logRendererInfo(`share-webcam: stopped (${this.totalBytes}B total)`)
    return { totalBytes: this.totalBytes }
  }

  abort(): void {
    const rec = this.recorder
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
    }
    this.cleanupStream()
    this.recorder = null
    this.pendingChunks = []
  }

  private cleanupStream(): void {
    // Drop only the combined wrapper — the source tracks belong to the
    // caller (webcam + mic streams), so we must not stop them here.
    if (this.combinedStream) {
      this.combinedStream = null
    }
  }
}

function pickMimeType(): string | null {
  for (const candidate of [WEBCAM_MIME_WEBM_VP9_OPUS, WEBCAM_MIME_WEBM_VP8_OPUS]) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate
  }
  return null
}
