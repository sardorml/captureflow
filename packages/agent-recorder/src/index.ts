export { decodeAudio } from "./audio";
export { pageFeed, type FrameFeed } from "./capture";
export { isAllowedUrl, isPrivateAddress } from "./guard";
export { CHANNELS, SAMPLE_RATE } from "./pacing";
export {
  openRecording,
  SessionError,
  slideWindow,
  type CaptureSource,
  type Chapter,
  type Recording,
  type RecordingOutput,
} from "./recording";
export {
  startSession,
  type Action,
  type RebuildRequest,
  DEFAULT_ZOOM,
  deviceScaleArg,
  type Session,
  type SessionOptions,
  type StartRequest,
  type Target,
} from "./session";
export {
  planSwarm,
  SWARM_LIMITS,
  type SwarmPlan,
  type SwarmUnit,
} from "./swarm";
export {
  renderSlide,
  type Slide,
  type SlideLayout,
  type SlideTheme,
} from "./slide";
export { createTransport, type UploadCredentials } from "./upload";
