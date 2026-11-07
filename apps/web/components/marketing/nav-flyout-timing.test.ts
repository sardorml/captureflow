import { describe, expect, it } from "vitest";
import { groupDelayMs, partInDelayMs, partOutMs } from "./nav-flyout-timing";

describe("nav flyout timing", () => {
  it("staggers columns 0, 80, 120 and 160 ms", () => {
    expect([0, 1, 2, 3].map(groupDelayMs)).toEqual([0, 80, 120, 160]);
  });

  it("starts each part 20 ms after the one above it", () => {
    expect(partInDelayMs(0, 1)).toBe(100);
    expect(partInDelayMs(0, 2)).toBe(120);
    expect(partInDelayMs(1, 1)).toBe(180);
    expect(partInDelayMs(3, 1)).toBe(260);
  });

  it("caps the leave at 240 ms", () => {
    expect(partOutMs(1, 9)).toBe(240);
    expect(partOutMs(9, 9)).toBe(160);
    expect(partOutMs(8, 9)).toBe(180);
  });
});
