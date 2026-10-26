export const DAY_MS = 86_400_000;

export type DayCount = { day: number; n: number };

// Days are UTC day numbers, so the count is the same wherever it is read.
export function dayOf(ms: number): number {
  return Math.floor(ms / DAY_MS);
}

// Oldest first, ending on today.
export function lastDays(
  buckets: DayCount[],
  days: number,
  nowMs: number,
): number[] {
  const byDay = new Map(buckets.map((b) => [b.day, b.n]));
  const today = dayOf(nowMs);
  return Array.from(
    { length: days },
    (_, i) => byDay.get(today - (days - 1 - i)) ?? 0,
  );
}

export function countSince(
  buckets: DayCount[],
  days: number,
  nowMs: number,
): number {
  return lastDays(buckets, days, nowMs).reduce((sum, n) => sum + n, 0);
}

// Total recorded time as people say it: minutes under an hour, then h and m.
export function formatRecordedTime(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
