// Account-scoped quotas live in `@captureflow/quota`'s ACCOUNT_LIMITS.

// video/webm covers browser MediaRecorder output when no H.264 encoder is
// present (the extension records video/mp4 when it can, video/webm otherwise).
export const ALLOWED_CONTENT_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "image/jpeg",
]);

export const ALLOWED_SOURCES = new Set(["instant", "edited"] as const);
export const ALLOWED_PRESETS = new Set(["recording"] as const);

export type RecordingSource = "instant" | "edited";
export type RecordingPreset = "recording";
export type RecordingState = "pending" | "ready" | "failed";
