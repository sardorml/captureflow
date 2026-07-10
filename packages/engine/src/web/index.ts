export {
  createFmp4Muxer,
  type Fmp4Muxer,
  type Fmp4MuxerOptions,
} from "./fmp4-mux";
export {
  createRecordPipeline,
  type RecordPipeline,
  type RecordPipelineArmOptions,
  type RecordPipelineIO,
  type RecordPipelineLog,
  type RecordPipelineResult,
  type RecordPipelineState,
} from "./record-pipeline";
export { decodePosterJpeg, type PosterSource } from "./poster";
export {
  startStreamRecorder,
  type StreamRecorder,
  type StreamRecorderOptions,
  type StreamRecorderResult,
} from "./stream-recorder";
export {
  acquireMicCapture,
  acquireWebcamCapture,
  pickWebcamMimeType,
  startWebcamRecorder,
  type MicCaptureResult,
  type WebcamCaptureResult,
  type WebcamRecorder,
  type WebcamRecorderOptions,
} from "./webcam";
