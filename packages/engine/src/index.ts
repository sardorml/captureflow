export type { RecordingFrameEvent, WindowAtPoint, WindowBounds } from "./types";
export { ENGINE_OUTPUT } from "./contract";
export {
  DEFAULT_RECORDING_QUALITY,
  RECORDING_QUALITIES,
  RECORDING_QUALITY_IDS,
  estimateBytesPerMinute,
  hydrateRecordingQuality,
  isRecordingQualityId,
  type RecordingQuality,
  type RecordingQualityId,
} from "./quality";
