// Webcam + mic capture for share recordings. Returns the raw MediaStreams
// only — the ShareWebcamUploader owns the combined MediaRecorder that
// streams the webcam (with mic as its audio track) to the share backend.
// No local recording-to-disk happens here.

export type WebcamCaptureResult = { stream: MediaStream }
export type MicCaptureResult = { stream: MediaStream }

// Share companion track: 720p / 30fps. The underlying camera capture
// session is driven by the highest-resolution consumer (the WebcamBubble
// preview is always 1080p, see WebcamBubble.tsx), so a 720p consuming
// stream is downscaled from a 1080p session — concurrent acquires don't
// downgrade the session.
const WEBCAM_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 }
} as const

// Video-only: audio is captured separately by acquireMicCapture so the two
// stems stay independent (the uploader recombines webcam video + mic audio).
export async function acquireWebcamCapture(deviceId: string): Promise<WebcamCaptureResult | null> {
  try {
    const stream = await acquireWebcamStream(deviceId)
    return { stream }
  } catch (err) {
    console.warn('Could not access webcam for recording:', err)
    return null
  }
}

async function acquireWebcamStream(deviceId: string): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        ...WEBCAM_CONSTRAINTS
      },
      audio: false
    })
  } catch {
    // Camera doesn't accept the ideal: it caps below the request. Drop to a
    // bare ideal and let it negotiate — better than failing the recording.
    return navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: WEBCAM_CONSTRAINTS.width.ideal },
        height: { ideal: WEBCAM_CONSTRAINTS.height.ideal },
        frameRate: WEBCAM_CONSTRAINTS.frameRate
      },
      audio: false
    })
  }
}

export async function acquireMicCapture(audioDeviceId: string): Promise<MicCaptureResult | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        deviceId: { exact: audioDeviceId },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })
    return { stream }
  } catch (err) {
    console.warn('Could not access mic for recording:', err)
    return null
  }
}
