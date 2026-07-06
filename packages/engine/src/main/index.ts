export { noopLogger, type EngineLogger } from "./logger";
export {
  createScreenRecorder,
  type RecorderHealth,
  type ScreenRecorder,
  type ScreenRecorderConfig,
  type StartResult,
  type StopResult,
  type StreamingConfig,
} from "./screen-recorder";
export {
  createRecordingWireParser,
  type RecordingWireParser,
} from "./recording-wire";
export { createWindowDetector, type WindowDetector } from "./window-detector";
export {
  captureSnapshotPng,
  parseSnapshotOutput,
  type SnapshotConfig,
  type SnapshotResult,
} from "./snapshot";
