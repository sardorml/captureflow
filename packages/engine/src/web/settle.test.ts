import { describe, expect, it } from "vitest";
import { createSettleDetector } from "./settle";

const still = (v: number) => new Float32Array(16).fill(v);
const feed = (frames: ArrayLike<number>[]) => {
  const detector = createSettleDetector();
  return frames.map((f) => detector.note(f));
};

describe("settle detector", () => {
  it("stays quiet on a still picture", () => {
    expect(feed(Array.from({ length: 20 }, () => still(100)))).not.toContain(
      true,
    );
  });

  it("fires once when a burst of motion comes to rest", () => {
    const frames = [
      ...Array.from({ length: 5 }, (_, i) => still(i * 40)),
      ...Array.from({ length: 10 }, () => still(200)),
    ];
    const fired = feed(frames);
    expect(fired.filter(Boolean)).toHaveLength(1);
    // The sixth frame is the last moving one; four still frames follow it.
    expect(fired.indexOf(true)).toBe(9);
  });

  it("ignores a one-frame blip", () => {
    const frames = [
      still(0),
      still(0),
      still(90),
      still(0),
      still(0),
      still(0),
      still(0),
      still(0),
    ];
    expect(feed(frames)).not.toContain(true);
  });

  it("fires again for a later burst", () => {
    const burst = [
      ...Array.from({ length: 4 }, (_, i) => still(i * 50)),
      ...Array.from({ length: 6 }, () => still(255)),
    ];
    const fired = feed([...burst, ...burst.map((f) => still(255 - f[0]!))]);
    expect(fired.filter(Boolean)).toHaveLength(2);
  });
});
