export const DAY_MS = 86_400_000;

export type DayCount = { day: number; n: number };

// Days are UTC day numbers, so the count is the same wherever it is read.
export function dayOf(ms: number): number {
  return Math.floor(ms / DAY_MS);
}

export function countSince(
  buckets: DayCount[],
  days: number,
  nowMs: number,
): number {
  const first = dayOf(nowMs) - (days - 1);
  return buckets.reduce((sum, b) => (b.day >= first ? sum + b.n : sum), 0);
}

// Total recorded time as people say it: minutes under an hour, then h and m.
export function formatRecordedTime(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
