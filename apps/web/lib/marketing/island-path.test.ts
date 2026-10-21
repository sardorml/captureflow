import { describe, expect, it } from "vitest";
import { islandPath } from "./island-path";

const points = (d: string) =>
  [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));

describe("islandPath", () => {
  it("draws nothing before the bar is measured", () => {
    expect(islandPath(0, 60, 0)).toBe("");
    expect(islandPath(1200, 0, 1)).toBe("");
  });

  it("reaches past the bar's sides into concave shoulders at rest", () => {
    const [x] = points(islandPath(1200, 60, 0));
    expect(x).toBe(-11);
    expect(islandPath(1200, 60, 0)).toContain("L1211 0");
  });

  it("rounds every corner to the island radius once floating", () => {
    const d = islandPath(1200, 60, 1);
    expect(d.startsWith("M24 0 L1176 0")).toBe(true);
    expect(d).toContain("1200 24");
    expect(d).toContain("L0 24");
  });

  it("stays one closed shape at every step of the morph", () => {
    for (const p of [0, 0.2, 0.5, 0.8, 1, 1.3]) {
      const d = islandPath(1200, 60, p);
      expect(d.match(/M/g)).toHaveLength(1);
      expect(d.endsWith("Z")).toBe(true);
      expect(points(d).every(Number.isFinite)).toBe(true);
    }
  });
});
