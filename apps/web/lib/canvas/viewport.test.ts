import { describe, expect, it } from "vitest";
import {
  MAX_SCALE,
  MIN_SCALE,
  panBy,
  toWorld,
  wheelScale,
  zoomAround,
} from "./viewport";

describe("viewport", () => {
  it("maps screen points through pan and zoom", () => {
    expect(toWorld({ x: 100, y: 50, scale: 2 }, { x: 300, y: 250 })).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("keeps the anchored world point fixed while zooming", () => {
    const view = { x: 40, y: -20, scale: 1.5 };
    const anchor = { x: 640, y: 360 };
    const before = toWorld(view, anchor);
    const after = toWorld(zoomAround(view, anchor, 3), anchor);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it("clamps the scale", () => {
    const view = { x: 0, y: 0, scale: 1 };
    expect(zoomAround(view, { x: 0, y: 0 }, 100).scale).toBe(MAX_SCALE);
    expect(zoomAround(view, { x: 0, y: 0 }, 0.001).scale).toBe(MIN_SCALE);
  });

  it("pans by screen pixels", () => {
    expect(panBy({ x: 1, y: 2, scale: 2 }, 10, -5)).toEqual({
      x: 11,
      y: -3,
      scale: 2,
    });
  });

  it("turns wheel deltas into a zoom factor around one", () => {
    expect(wheelScale(0, 0)).toBe(1);
    expect(wheelScale(100, 0)).toBeLessThan(1);
    expect(wheelScale(-100, 0)).toBeGreaterThan(1);
    expect(wheelScale(3, 1)).toBeCloseTo(wheelScale(48, 0));
  });
});
