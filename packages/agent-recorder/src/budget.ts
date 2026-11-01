export const AUDIO_BITRATE = 128_000;
const HEADROOM = 0.8;
const MIN_BITRATE = 300_000;
const STOP_AT = 0.95;

/*
 * The video bitrate that lets a recording run its full allowed length inside
 * the bytes its plan leaves it; null bytes means unmetered. The headroom covers
 * x264 running over its target and the container's own overhead.
 */
export function fitBitrate(
  ceiling: number,
  remainingBytes: number | null,
  maxDurationMs: number,
): number {
  if (remainingBytes === null) return ceiling;
  const fit =
    (remainingBytes * 8 * HEADROOM) / (maxDurationMs / 1000) - AUDIO_BITRATE;
  return Math.round(Math.max(MIN_BITRATE, Math.min(ceiling, fit)));
}

// Stops a little short, so what ffmpeg flushes on close still fits.
export function nearBudget(bytes: number, remainingBytes: number | null) {
  return remainingBytes !== null && bytes >= remainingBytes * STOP_AT;
}
