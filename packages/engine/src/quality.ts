import { ENGINE_OUTPUT } from "./contract";

export type RecordingQualityId = "saver" | "low" | "balanced" | "high" | "max";

export type RecordingQuality = {
  label: string;
  screen: {
    maxWidth: number;
    maxHeight: number;
    fps: number;
    bitrate: number;
    audioBitrate: number;
  };
  webcam: {
    width: number;
    height: number;
    bitrate: number;
    audioBitrate: number;
  };
};

// Lowest to highest. "max" is the output contract as it has always been, so
// an account that never picks keeps recording exactly as before.
export const RECORDING_QUALITIES: Record<RecordingQualityId, RecordingQuality> =
  {
    saver: {
      label: "Data saver",
      screen: {
        maxWidth: 960,
        maxHeight: 540,
        fps: 30,
        bitrate: 800_000,
        audioBitrate: 48_000,
      },
      webcam: {
        width: 480,
        height: 360,
        bitrate: 300_000,
        audioBitrate: 48_000,
      },
    },
    low: {
      label: "Low",
      screen: {
        maxWidth: 1280,
        maxHeight: 720,
        fps: 30,
        bitrate: 1_500_000,
        audioBitrate: 64_000,
      },
      webcam: {
        width: 640,
        height: 480,
        bitrate: 500_000,
        audioBitrate: 64_000,
      },
    },
    balanced: {
      label: "Balanced",
      screen: {
        maxWidth: 1920,
        maxHeight: 1080,
        fps: 30,
        bitrate: 2_500_000,
        audioBitrate: 64_000,
      },
      webcam: {
        width: 640,
        height: 480,
        bitrate: 600_000,
        audioBitrate: 64_000,
      },
    },
    high: {
      label: "High",
      screen: {
        maxWidth: 1920,
        maxHeight: 1080,
        fps: 30,
        bitrate: 4_000_000,
        audioBitrate: 96_000,
      },
      webcam: {
        width: 1280,
        height: 720,
        bitrate: 1_500_000,
        audioBitrate: 96_000,
      },
    },
    max: {
      label: "Maximum",
      screen: {
        maxWidth: ENGINE_OUTPUT.screen.maxWidth,
        maxHeight: ENGINE_OUTPUT.screen.maxHeight,
        fps: ENGINE_OUTPUT.screen.fps,
        bitrate: ENGINE_OUTPUT.screen.bitrate,
        audioBitrate: 128_000,
      },
      webcam: {
        width: 1280,
        height: 720,
        bitrate: 4_000_000,
        audioBitrate: 128_000,
      },
    },
  };

export const RECORDING_QUALITY_IDS = Object.keys(
  RECORDING_QUALITIES,
) as RecordingQualityId[];

export const DEFAULT_RECORDING_QUALITY: RecordingQualityId = "max";

export function isRecordingQualityId(v: unknown): v is RecordingQualityId {
  return typeof v === "string" && v in RECORDING_QUALITIES;
}

export function hydrateRecordingQuality(raw: unknown): RecordingQualityId {
  return isRecordingQualityId(raw) ? raw : DEFAULT_RECORDING_QUALITY;
}

/*
 * What a minute costs, from one measured point: a 1080p30 tab recording of
 * ordinary scrolling runs about 1.5 Mbps under a generous ceiling, and a 720p
 * talking head about 0.9 Mbps. Both scale with pixel count (sub-linearly, as
 * encoders do) and the screen with the square root of the frame rate; a
 * tight ceiling caps the result. Audio is taken at its full rate.
 */
const SCREEN_REFERENCE_BPS = 1_500_000;
const SCREEN_REFERENCE_PIXELS = 1920 * 1080;
const SCREEN_REFERENCE_FPS = 30;
const WEBCAM_REFERENCE_BPS = 900_000;
const WEBCAM_REFERENCE_PIXELS = 1280 * 720;
const PIXEL_EXPONENT = 0.75;

export function estimateBytesPerMinute(
  quality: RecordingQuality,
  withCamera: boolean,
): number {
  const { screen, webcam } = quality;
  const screenRate =
    SCREEN_REFERENCE_BPS *
    ((screen.maxWidth * screen.maxHeight) / SCREEN_REFERENCE_PIXELS) **
      PIXEL_EXPONENT *
    Math.sqrt(screen.fps / SCREEN_REFERENCE_FPS);
  let bps = Math.min(screen.bitrate, screenRate) + screen.audioBitrate;
  if (withCamera) {
    const webcamRate =
      WEBCAM_REFERENCE_BPS *
      ((webcam.width * webcam.height) / WEBCAM_REFERENCE_PIXELS) **
        PIXEL_EXPONENT;
    bps += Math.min(webcam.bitrate, webcamRate);
  }
  return (bps / 8) * 60;
}
