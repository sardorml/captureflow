export { decodeAudio } from "./audio";
export { pageFeed, type FrameFeed } from "./capture";
export { isAllowedUrl, isPrivateAddress } from "./guard";
export { CHANNELS, SAMPLE_RATE } from "./pacing";
export {
  openRecording,
  SessionError,
  type CaptureSource,
  type Chapter,
  type Recording,
  type RecordingOutput,
} from "./recording";
export {
  startSession,
  type Action,
  type Session,
  type SessionOptions,
  type StartRequest,
  type Target,
} from "./session";
export {
  renderSlide,
  type Slide,
  type SlideLayout,
  type SlideTheme,
} from "./slide";
export type { UploadCredentials } from "./upload";
