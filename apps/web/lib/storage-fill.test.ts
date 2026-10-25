import { describe, expect, it } from "vitest";
import { storageFill } from "./storage-fill";

const GB = 1024 ** 3;

describe("storageFill", () => {
  it("is null without a limit", () => {
    expect(storageFill(5 * GB, null)).toBeNull();
  });

  it("is full when the plan has no storage at all", () => {
    expect(storageFill(0, 0)).toEqual({ ratio: 1, tone: "full" });
  });

  it("turns from ok to near to full as usage grows", () => {
    expect(storageFill(0.5 * GB, GB)).toEqual({ ratio: 0.5, tone: "ok" });
    expect(storageFill(0.8 * GB, GB)).toEqual({ ratio: 0.8, tone: "near" });
    expect(storageFill(GB, GB)).toEqual({ ratio: 1, tone: "full" });
  });

  it("clamps overuse and negative totals", () => {
    expect(storageFill(3 * GB, GB)).toEqual({ ratio: 1, tone: "full" });
    expect(storageFill(-1, GB)).toEqual({ ratio: 0, tone: "ok" });
  });
});
