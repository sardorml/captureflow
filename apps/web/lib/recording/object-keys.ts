import { recordingConfigKeyFor } from "../recording-config";

export function summaryChaptersKeyFor(videoStorageKey: string): string {
  return `${videoStorageKey}.summary-chapters.json`;
}

type RecordingObjects = {
  storageKey: string;
  posterKey: string | null;
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
    row.webcamStorageKey,
    recordingConfigKeyFor(row.storageKey),
    summaryChaptersKeyFor(row.storageKey),
  ];
  return keys.filter((k): k is string => k !== null);
}
