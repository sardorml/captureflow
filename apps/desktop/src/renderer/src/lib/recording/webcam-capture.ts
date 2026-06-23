export type WebcamCaptureResult = { stream: MediaStream };
export type MicCaptureResult = { stream: MediaStream };

/*
 * The camera session is driven by its highest-resolution consumer
 * (WebcamBubble preview is always 1080p), so this 720p stream is downscaled
 * from the 1080p session — concurrent acquires never downgrade it.
 */
const WEBCAM_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 },
} as const;

export async function acquireWebcamCapture(
  deviceId: string,
): Promise<WebcamCaptureResult | null> {
  try {
    const stream = await acquireWebcamStream(deviceId);
    return { stream };
  } catch (err) {
    console.warn("Could not access webcam for recording:", err);
    return null;
  }
}

async function acquireWebcamStream(deviceId: string): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        ...WEBCAM_CONSTRAINTS,
      },
      audio: false,
    });
  } catch {
    // Camera rejected the constraints; retry with bare ideals and let it negotiate.
    return navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: WEBCAM_CONSTRAINTS.width.ideal },
        height: { ideal: WEBCAM_CONSTRAINTS.height.ideal },
        frameRate: WEBCAM_CONSTRAINTS.frameRate,
      },
      audio: false,
    });
  }
}

export async function acquireMicCapture(
  audioDeviceId: string,
): Promise<MicCaptureResult | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        deviceId: { exact: audioDeviceId },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    return { stream };
  } catch (err) {
    console.warn("Could not access mic for recording:", err);
    return null;
  }
}
