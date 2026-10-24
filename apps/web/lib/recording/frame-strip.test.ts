import { describe, expect, it } from "vitest";
import { frameIndexAt, planFrameTimes } from "./frame-strip";

describe("planFrameTimes", () => {
  it("is empty without a duration", () => {
    expect(planFrameTimes(0)).toEqual([]);
    expect(planFrameTimes(Number.NaN)).toEqual([]);
  });

  it("spaces short recordings two seconds apart", () => {
    expect(planFrameTimes(9)).toEqual([0, 2, 4, 6]);
  });

  it("caps long recordings at forty frames", () => {
    const times = planFrameTimes(3600);
    expect(times).toHaveLength(40);
    expect(times[1]).toBe(90);
  });

  it("always has at least one frame", () => {
    expect(planFrameTimes(1)).toEqual([0]);
  });
});

describe("frameIndexAt", () => {
  const times = [0, 2, 4, 6];

  it("picks the last frame at or before the time", () => {
    expect(frameIndexAt(times, 0)).toBe(0);
    expect(frameIndexAt(times, 3.9)).toBe(1);
    expect(frameIndexAt(times, 4)).toBe(2);
    expect(frameIndexAt(times, 100)).toBe(3);
  });

  it("clamps times before the first frame", () => {
    expect(frameIndexAt(times, -1)).toBe(0);
  });
});
