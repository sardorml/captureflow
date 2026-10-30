import { describe, expect, it } from "vitest";
import { fitBitrate, nearBudget } from "./budget";

const MB = 1024 * 1024;

describe("fitBitrate", () => {
  it("keeps the ceiling when the recording is unmetered", () => {
    expect(fitBitrate(4_000_000, null, 600_000)).toBe(4_000_000);
  });

  it("fits a free recording's five minutes into its 50 MB", () => {
    const bitrate = fitBitrate(4_000_000, 50 * MB, 5 * 60_000);
    const bytes = ((bitrate + 128_000) * 300) / 8;
    expect(bitrate).toBeLessThan(4_000_000);
    expect(bytes).toBeLessThan(50 * MB);
  });

  it("keeps the ceiling when the budget is roomy", () => {
    expect(fitBitrate(4_000_000, 10_000 * MB, 600_000)).toBe(4_000_000);
  });

  it("never drops below a watchable floor", () => {
    expect(fitBitrate(4_000_000, 1 * MB, 600_000)).toBe(300_000);
  });
});

describe("nearBudget", () => {
  it("trips just short of the budget, and never when unmetered", () => {
    expect(nearBudget(94, 100)).toBe(false);
    expect(nearBudget(95, 100)).toBe(true);
    expect(nearBudget(10 ** 12, null)).toBe(false);
  });
});
