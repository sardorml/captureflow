import { describe, expect, it } from "vitest";
import {
  countSince,
  dayOf,
  formatRecordedTime,
  lastDays,
} from "./dashboard-metrics";

const NOW = Date.UTC(2026, 9, 26, 15, 30);

describe("lastDays", () => {
  it("lays the counts out oldest first, ending on today", () => {
    const today = dayOf(NOW);
    expect(
      lastDays(
        [
          { day: today, n: 2 },
          { day: today - 3, n: 5 },
          { day: today - 9, n: 1 },
        ],
        7,
        NOW,
      ),
    ).toEqual([0, 0, 0, 5, 0, 0, 2]);
  });
});

describe("countSince", () => {
  it("sums the last N UTC days, today included", () => {
    const today = dayOf(NOW);
    const buckets = [
      { day: today, n: 2 },
      { day: today - 6, n: 5 },
      { day: today - 7, n: 9 },
    ];
    expect(countSince(buckets, 7, NOW)).toBe(7);
    expect(countSince(buckets, 30, NOW)).toBe(16);
    expect(countSince([], 7, NOW)).toBe(0);
  });

  it("buckets on UTC days", () => {
    const justBeforeMidnight = Date.UTC(2026, 9, 25, 23, 59, 59);
    expect(dayOf(justBeforeMidnight)).toBe(dayOf(NOW) - 1);
  });
});

describe("formatRecordedTime", () => {
  it("says minutes under an hour and hours past it", () => {
    expect(formatRecordedTime(0)).toBe("0 min");
    expect(formatRecordedTime(45 * 60_000)).toBe("45 min");
    expect(formatRecordedTime(120 * 60_000)).toBe("2 h");
    expect(formatRecordedTime(135 * 60_000 + 20_000)).toBe("2 h 15 min");
  });
});
