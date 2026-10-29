export type { RecordingFrameEvent, WindowAtPoint, WindowBounds } from "./types";
export { ENGINE_OUTPUT } from "./contract";
export {
  DEFAULT_RECORDING_QUALITY,
  RECORDING_QUALITIES,
  RECORDING_QUALITY_IDS,
  estimateBytesPerMinute,
  hydrateRecordingQuality,
  isRecordingQualityId,
  peakBitsPerSecond,
  type RecordingQuality,
  type RecordingQualityId,
} from "./quality";
export {
  UNREAD_LIMITS,
  clampQuality,
  exceedsQuality,
  hydrateRecordingLimits,
  resolveRecordingLimits,
  type RecordingLimits,
} from "./quality-limits";
export {
  blendUploadSpeed,
  outpacesUpload,
  type UploadSpeed,
} from "./upload-speed";
