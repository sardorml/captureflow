import { recordingConfigKeyFor } from "../recording-config";

export function summaryChaptersKeyFor(videoStorageKey: string): string {
  return `${videoStorageKey}.summary-chapters.json`;
}

// Mic audio chunks for transcription sit next to the video; their count is
// only known from the transcript parts table, so deletes sweep the prefix.
export function audioPartPrefixFor(videoStorageKey: string): string {
  return `${videoStorageKey.replace(/\.[^.]+$/, "")}-audio-`;
}

export function audioPartKeyFor(
  videoStorageKey: string,
  partNumber: number,
): string {
  return `${audioPartPrefixFor(videoStorageKey)}${partNumber}.webm`;
}

// Upload pieces of a recording still being recorded (see segments.ts).
export function segmentPrefixFor(storageKey: string): string {
  return `${storageKey}.seg/`;
}

// The digest of the poster bytes is part of the key, so a replaced poster
// gets a new URL and the old one can be cached forever.
// Bumped when thumbnails change size or quality, so the backfill can tell an
// old thumbnail from a current one by its key alone.
export const THUMB_SUFFIX = ".thumb2.jpg";

export function posterThumbKeyFor(posterKey: string, digest: string): string {
  return `${posterKey.replace(/\.[^.]+$/, "")}.${digest}${THUMB_SUFFIX}`;
}

type RecordingObjects = {
  storageKey: string;
  posterKey: string | null;
  posterThumbKey: string | null;
  webcamStorageKey: string | null;
};

/*
 * Every R2 object a recording owns. The three delete paths (dashboard action,
 * DELETE /api/r/[id], retention sweep) each drifted to their own list and
 * stranded a different subset; they all read this now. Keep it free of
 * binding/runtime imports — lib/recording/cron.ts is bundled into worker.ts by
 * wrangler, which can't resolve @opennextjs/cloudflare.
 *
 * The config/summary sidecar keys outlive migration 0007 (which moved those
 * payloads into the row) so deleting a pre-migration recording still clears
 * its legacy R2 objects; for newer recordings they delete as no-ops.
 */
export function objectKeysFor(row: RecordingObjects): string[] {
  const keys = [
    row.storageKey,
    row.posterKey,
    row.posterThumbKey,
    row.webcamStorageKey,
    recordingConfigKeyFor(row.storageKey),
    summaryChaptersKeyFor(row.storageKey),
  ];
  return keys.filter((k): k is string => k !== null);
}
