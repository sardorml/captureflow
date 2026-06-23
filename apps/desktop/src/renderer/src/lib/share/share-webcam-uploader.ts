import { logRendererInfo, logRendererWarn } from './share-log'

// WebM only — the worker reserves the upload with a fixed video/webm key;
// an MP4-in-.webm file freezes the share player on the first frame.
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
  // Awaited on stop so the final dataavailable conversion isn't dropped.
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
    // Drop only the combined wrapper; source tracks belong to the caller.
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
