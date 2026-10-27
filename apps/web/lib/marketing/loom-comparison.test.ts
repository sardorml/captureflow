import { describe, expect, it } from "vitest";
import {
  getCaptureflowMonthly,
  getLoomMonthly,
  getYearlySavings,
  ourPlanFor,
} from "./loom-comparison";

describe("loom comparison math", () => {
  it("prices Loom per seat", () => {
    expect(getLoomMonthly("business", 10)).toBe(180);
    expect(getLoomMonthly("businessAi", 10)).toBe(240);
  });

  it("prices CaptureFlow per member on the matching plan", () => {
    expect(ourPlanFor("business").id).toBe("light");
    expect(ourPlanFor("businessAi").id).toBe("pro");
    expect(getCaptureflowMonthly("business", 10)).toBe(
      10 * ourPlanFor("business").priceMonthlyUsd,
    );
  });

  it("compares the two per-seat prices over a year", () => {
    expect(getYearlySavings("business", 10)).toBeCloseTo(
      (180 - getCaptureflowMonthly("business", 10)) * 12,
    );
  });

  it("never reports negative savings", () => {
    expect(getYearlySavings("business", 0)).toBe(0);
  });
});
