export const DAY_MS = 86_400_000;

export const METRIC_RANGES = [7, 30, 90] as const;
export type MetricRange = (typeof METRIC_RANGES)[number];
export const MAX_METRIC_RANGE: MetricRange = 90;

export type DayCount = { day: number; n: number };
export type DaySeries = { labels: string[]; counts: number[]; total: number };

// Days are UTC day numbers so the server and the browser bucket identically.
export function dayOf(ms: number): number {
  return Math.floor(ms / DAY_MS);
}

export function dayLabel(day: number): string {
  return new Date(day * DAY_MS).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function daySeries(
  buckets: DayCount[],
  days: number,
  nowMs: number,
): DaySeries {
  const byDay = new Map(buckets.map((b) => [b.day, b.n]));
  const today = dayOf(nowMs);
  const labels: string[] = [];
  const counts: number[] = [];
  let total = 0;
  for (let i = days - 1; i >= 0; i--) {
    const day = today - i;
    const n = byDay.get(day) ?? 0;
    labels.push(dayLabel(day));
    counts.push(n);
    total += n;
  }
  return { labels, counts, total };
}

// Every day of a week gets a label; a longer range shows about six.
export function labelStep(days: number): number {
  return days <= 7 ? 1 : Math.round(days / 6);
}
