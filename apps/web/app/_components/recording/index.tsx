export { RecordingPlayer } from "./RecordingPlayer";
export type {
  RecordingPlayerHandle,
  ProgressOverlayInfo,
} from "./RecordingPlayer";

export {
  DEFAULT_RECORDING_CONFIG,
  RECORDING_GRADIENT_KEYS,
  RECORDING_GRADIENT_PRESETS,
  hydrateRecordingConfig,
  isRecordingGradientKey,
  isRecordingHexColor,
  recordingConfigKeyFor,
  recordingGradientCss,
} from "@/lib/recording-config";
export type {
  RecordingCameraCorner,
  RecordingCameraSize,
  RecordingConfig,
  RecordingGradientKey,
} from "@/lib/recording-config";
