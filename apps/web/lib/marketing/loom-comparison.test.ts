import { describe, expect, it } from "vitest";
import {
  CAPTUREFLOW_MONTHLY,
  getLoomMonthly,
  getYearlySavings,
} from "./loom-comparison";

describe("loom comparison math", () => {
  it("prices Loom per seat", () => {
    expect(getLoomMonthly("business", 10)).toBe(180);
    expect(getLoomMonthly("businessAi", 10)).toBe(240);
  });

  it("compares against the flat managed price over a year", () => {
    expect(getYearlySavings("business", 10)).toBeCloseTo(
      (180 - CAPTUREFLOW_MONTHLY) * 12,
    );
  });

  it("never reports negative savings", () => {
    expect(getYearlySavings("business", 0)).toBe(0);
  });
});
