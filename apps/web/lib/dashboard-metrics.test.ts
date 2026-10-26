import { describe, expect, it } from "vitest";
import {
  DAY_MS,
  dayLabel,
  dayOf,
  daySeries,
  labelStep,
} from "./dashboard-metrics";

const NOW = Date.UTC(2026, 9, 26, 15, 30);

describe("daySeries", () => {
  it("ends on today and runs back the requested number of days", () => {
    const series = daySeries([], 7, NOW);
    expect(series.labels).toEqual([
      "Oct 20",
      "Oct 21",
      "Oct 22",
      "Oct 23",
      "Oct 24",
      "Oct 25",
      "Oct 26",
    ]);
    expect(series.counts).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(series.total).toBe(0);
  });

  it("places counts on their day and sums them", () => {
    const today = dayOf(NOW);
    const series = daySeries(
      [
        { day: today, n: 2 },
        { day: today - 3, n: 5 },
        { day: today - 40, n: 9 },
      ],
      7,
      NOW,
    );
    expect(series.counts).toEqual([0, 0, 0, 5, 0, 0, 2]);
    expect(series.total).toBe(7);
  });

  it("buckets on UTC days", () => {
    const justBeforeMidnight = Date.UTC(2026, 9, 25, 23, 59, 59);
    expect(dayOf(justBeforeMidnight)).toBe(dayOf(NOW) - 1);
    expect(dayLabel(dayOf(justBeforeMidnight))).toBe("Oct 25");
    expect(dayOf(NOW) * DAY_MS).toBeLessThanOrEqual(NOW);
  });
});

describe("labelStep", () => {
  it("labels every day of a week and about six of a longer range", () => {
    expect(labelStep(7)).toBe(1);
    expect(labelStep(30)).toBe(5);
    expect(labelStep(90)).toBe(15);
  });
});
