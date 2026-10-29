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

// What made the recording and how; reported by the client at /init for the
// admin's usage view. Older clients send none of it, so every field is nullable.
export const ALLOWED_CLIENTS = new Set([
  "extension",
  "desktop",
  "agent",
] as const);
export const ALLOWED_CAPTURE_SOURCES = new Set([
  "tab",
  "window",
  "screen",
] as const);
// Mirrors RecordingQualityId in packages/engine/src/quality.ts.
export const ALLOWED_QUALITIES = new Set([
  "saver",
  "low",
  "balanced",
  "high",
  "max",
] as const);

export type RecordingSource = "instant" | "edited";
export type RecordingPreset = "recording";
export type RecordingState = "pending" | "ready" | "failed";
export type RecordingClient = "extension" | "desktop" | "agent";
export type RecordingCaptureSource = "tab" | "window" | "screen";
export type RecordingQualityId = "saver" | "low" | "balanced" | "high" | "max";

export function hydrateRecordingClient(raw: unknown): RecordingClient | null {
  return typeof raw === "string" && (ALLOWED_CLIENTS as Set<string>).has(raw)
    ? (raw as RecordingClient)
    : null;
}

export function hydrateRecordingCaptureSource(
  raw: unknown,
): RecordingCaptureSource | null {
  return typeof raw === "string" &&
    (ALLOWED_CAPTURE_SOURCES as Set<string>).has(raw)
    ? (raw as RecordingCaptureSource)
    : null;
}

export function hydrateRecordingQualityId(
  raw: unknown,
): RecordingQualityId | null {
  return typeof raw === "string" && (ALLOWED_QUALITIES as Set<string>).has(raw)
    ? (raw as RecordingQualityId)
    : null;
}

const QUALITY_RANK: Record<RecordingQualityId, number> = {
  saver: 0,
  low: 1,
  balanced: 2,
  high: 3,
  max: 4,
};

// A client that names no quality is an older build recording at its default,
// which is the lowest preset, so only a declared higher one is refused.
export function exceedsQuality(
  quality: RecordingQualityId | null,
  max: RecordingQualityId | null,
): boolean {
  if (!quality || !max) return false;
  return QUALITY_RANK[quality] > QUALITY_RANK[max];
}
