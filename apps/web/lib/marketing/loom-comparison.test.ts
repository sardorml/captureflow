import { describe, expect, it } from "vitest";
import {
  CAPTUREFLOW_PER_SEAT,
  getCaptureflowMonthly,
  getLoomMonthly,
  getYearlySavings,
} from "./loom-comparison";

describe("loom comparison math", () => {
  it("prices Loom per seat", () => {
    expect(getLoomMonthly("business", 10)).toBe(180);
    expect(getLoomMonthly("businessAi", 10)).toBe(240);
  });

  it("prices CaptureFlow per member at the Team rate", () => {
    expect(getCaptureflowMonthly(10)).toBe(10 * CAPTUREFLOW_PER_SEAT);
  });

  it("compares the two per-seat prices over a year", () => {
    expect(getYearlySavings("business", 10)).toBeCloseTo(
      (180 - 10 * CAPTUREFLOW_PER_SEAT) * 12,
    );
  });

  it("never reports negative savings", () => {
    expect(getYearlySavings("business", 0)).toBe(0);
  });
});
