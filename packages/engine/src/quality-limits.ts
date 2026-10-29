import {
  RECORDING_QUALITY_IDS,
  isRecordingQualityId,
  type RecordingQualityId,
} from "./quality";

// What the workspace lets a recording be; null means uncapped.
export type RecordingLimits = {
  tier: "free" | "team";
  maxQuality: RecordingQualityId | null;
  maxDurationMs: number | null;
};

// Held to when the workspace's caps can't be read: the free tier's quality,
// which the server enforces at init anyway, so the panel never offers a
// preset the recording would then be refused at.
export const UNREAD_LIMITS: RecordingLimits = {
  tier: "free",
  maxQuality: "saver",
  maxDurationMs: null,
};

export function resolveRecordingLimits(
  fetched: RecordingLimits | null,
  remembered: RecordingLimits | null,
): RecordingLimits {
  return fetched ?? remembered ?? UNREAD_LIMITS;
}

const rank = (id: RecordingQualityId): number =>
  RECORDING_QUALITY_IDS.indexOf(id);

export function exceedsQuality(
  quality: RecordingQualityId,
  max: RecordingQualityId | null,
): boolean {
  return max !== null && rank(quality) > rank(max);
}

// The preset a recording actually starts at: the chosen one, lowered to the
// cap when it sits above it.
export function clampQuality(
  quality: RecordingQualityId,
  max: RecordingQualityId | null,
): RecordingQualityId {
  return exceedsQuality(quality, max) ? max! : quality;
}

export function hydrateRecordingLimits(body: {
  tier?: unknown;
  maxQuality?: unknown;
  maxDurationMs?: unknown;
}): RecordingLimits {
  return {
    tier: body.tier === "team" ? "team" : "free",
    maxQuality: isRecordingQualityId(body.maxQuality) ? body.maxQuality : null,
    maxDurationMs:
      typeof body.maxDurationMs === "number" && body.maxDurationMs > 0
        ? body.maxDurationMs
        : null,
  };
}
