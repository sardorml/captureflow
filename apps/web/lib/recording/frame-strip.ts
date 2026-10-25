const MAX_FRAMES = 40;
const MIN_INTERVAL_SECONDS = 2;

// Start of each span one hover-preview frame stands for.
export function planFrameTimes(durationSeconds: number): number[] {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return [];
  const interval = Math.max(MIN_INTERVAL_SECONDS, durationSeconds / MAX_FRAMES);
  const count = Math.max(1, Math.floor(durationSeconds / interval));
  return Array.from({ length: count }, (_, i) => i * interval);
}

export function frameIndexAt(
  times: readonly number[],
  seconds: number,
): number {
  let idx = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i]! <= seconds) idx = i;
    else break;
  }
  return idx;
}
