/*
 * Every object key a recording or screenshot owns, derived from the keys the
 * row stores. The web app (dashboard delete, DELETE /api/r/[id], retention
 * sweep) and the self-hosted admin app all read these, so nothing strands a
 * sidecar by keeping its own list.
 */

const MP4 = ".mp4";
const PNG = ".png";

export function recordingConfigKeyFor(storageKey: string): string {
  if (storageKey.endsWith(MP4)) {
    return `${storageKey.slice(0, -MP4.length)}.config.json`;
  }
  return `${storageKey}.config.json`;
}

export function summaryChaptersKeyFor(videoStorageKey: string): string {
  return `${videoStorageKey}.summary-chapters.json`;
}

// One per media file, so a camera file finishing later can't leave it stale.
// Named after the file's storage id, never the slug: the CDN can serve it too.
export function waveformKeyFor(mediaStorageKey: string): string {
  return `${mediaStorageKey}.peaks`;
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

// Link-preview pictures of the framed poster, one per look (see share-image.ts).
export function shareImagePrefixFor(storageKey: string): string {
  return `${storageKey}.og/`;
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
  configJson?: string | null;
};

const BACKGROUND_IMAGE = /^image:([0-9a-f]{32}\.(?:png|jpg|webp))$/;

// The uploaded picture a recording's background names, or null when it isn't an image.
export function backgroundImageFileOf(background: unknown): string | null {
  return typeof background === "string"
    ? (BACKGROUND_IMAGE.exec(background)?.[1] ?? null)
    : null;
}

export function backgroundImageKeyFor(file: string): string {
  return `recording-backgrounds/${file}`;
}

function backgroundImageKeyIn(configJson: string | null | undefined) {
  if (!configJson) return null;
  try {
    const file = backgroundImageFileOf(JSON.parse(configJson)?.background);
    return file ? backgroundImageKeyFor(file) : null;
  } catch {
    return null;
  }
}

/*
 * The config/summary sidecar keys outlive migration 0007 (which moved those
 * payloads into the row) so deleting a pre-migration recording still clears
 * its legacy objects; for newer recordings they delete as no-ops. Keep this
 * file free of binding/runtime imports: it is bundled into the web worker.
 */
export function objectKeysFor(row: RecordingObjects): string[] {
  const keys = [
    row.storageKey,
    row.posterKey,
    row.posterThumbKey,
    row.webcamStorageKey,
    recordingConfigKeyFor(row.storageKey),
    summaryChaptersKeyFor(row.storageKey),
    waveformKeyFor(row.storageKey),
    row.webcamStorageKey && waveformKeyFor(row.webcamStorageKey),
    backgroundImageKeyIn(row.configJson),
  ];
  return keys.filter((k): k is string => k !== null);
}

export function sourceKeyFor(storageKey: string): string {
  if (storageKey.endsWith(PNG)) {
    return `${storageKey.slice(0, -PNG.length)}.source.png`;
  }
  return `${storageKey}.source.png`;
}

export function stateKeyFor(storageKey: string): string {
  if (storageKey.endsWith(PNG)) {
    return `${storageKey.slice(0, -PNG.length)}.state.json`;
  }
  return `${storageKey}.state.json`;
}

export function screenshotObjectKeysFor(storageKey: string): string[] {
  return [storageKey, sourceKeyFor(storageKey), stateKeyFor(storageKey)];
}
