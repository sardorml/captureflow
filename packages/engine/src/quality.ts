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
    fps: number;
    bitrate: number;
    audioBitrate: number;
  };
};

// Lowest to highest. "max" is the output contract as it has always been, so
// an account that never picks keeps recording exactly as before. The screen
// keeps its pixels at every level: downscaled text reads blurry on any
// display, while a tighter bitrate only costs sharpness during motion.
export const RECORDING_QUALITIES: Record<RecordingQualityId, RecordingQuality> =
  {
    saver: {
      label: "Data saver",
      screen: {
        maxWidth: 1920,
        maxHeight: 1080,
        fps: 30,
        bitrate: 750_000,
        audioBitrate: 48_000,
      },
      webcam: {
        width: 480,
        height: 360,
        fps: 15,
        bitrate: 200_000,
        audioBitrate: 48_000,
      },
    },
    low: {
      label: "Low",
      screen: {
        maxWidth: 1920,
        maxHeight: 1080,
        fps: 30,
        bitrate: 1_500_000,
        audioBitrate: 64_000,
      },
      webcam: {
        width: 640,
        height: 480,
        fps: 30,
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
        fps: 30,
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
        fps: 30,
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
        fps: 30,
        bitrate: 4_000_000,
        audioBitrate: 128_000,
      },
    },
  };

export const RECORDING_QUALITY_IDS = Object.keys(
  RECORDING_QUALITIES,
) as RecordingQualityId[];

// Low keeps a typical recording under 10 MB a minute; the picker offers more.
export const DEFAULT_RECORDING_QUALITY: RecordingQualityId = "low";

export function isRecordingQualityId(v: unknown): v is RecordingQualityId {
  return typeof v === "string" && v in RECORDING_QUALITIES;
}

export function hydrateRecordingQuality(raw: unknown): RecordingQualityId {
  return isRecordingQualityId(raw) ? raw : DEFAULT_RECORDING_QUALITY;
}

/*
 * What a minute costs, from measured points: a 1080p30 recording of ordinary
 * dashboard use runs about 1 Mbps under a generous ceiling, and a 720p
 * talking head about 0.9 Mbps. Both scale with pixel count (sub-linearly, as
 * encoders do) and the screen with the square root of the frame rate. The
 * ceiling binds only while the picture moves, so it shaves the typical rate
 * rather than capping it. Audio is taken at its full rate.
 */
const SCREEN_REFERENCE_BPS = 1_000_000;
const SCREEN_REFERENCE_PIXELS = 1920 * 1080;
const SCREEN_REFERENCE_FPS = 30;
const WEBCAM_REFERENCE_BPS = 900_000;
const WEBCAM_REFERENCE_PIXELS = 1280 * 720;
const PIXEL_EXPONENT = 0.75;

const underCeiling = (typical: number, ceiling: number): number =>
  typical * (1 - Math.exp(-ceiling / typical));

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
  let bps = underCeiling(screenRate, screen.bitrate) + screen.audioBitrate;
  if (withCamera) {
    const webcamRate =
      WEBCAM_REFERENCE_BPS *
      ((webcam.width * webcam.height) / WEBCAM_REFERENCE_PIXELS) **
        PIXEL_EXPONENT *
      Math.sqrt(webcam.fps / SCREEN_REFERENCE_FPS);
    bps += underCeiling(webcamRate, webcam.bitrate);
  }
  return (bps / 8) * 60;
}
