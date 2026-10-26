import { describe, expect, it } from "vitest";
import { createRateGate } from "./rate-gate";

const FRAME_US = 1_000_000 / 30;

describe("createRateGate", () => {
  it("lets a stream at the ceiling through untouched", () => {
    const gate = createRateGate(1_000_000);
    for (let i = 0; i < 300; i++) {
      expect(gate.over(i * FRAME_US)).toBe(false);
      gate.spent(1_000_000 / 8 / 30);
    }
  });

  it("skips frames after a burst until the ceiling has drained it", () => {
    const gate = createRateGate(1_000_000);
    gate.over(0);
    gate.spent(400_000);
    expect(gate.over(FRAME_US)).toBe(true);
    expect(gate.over(1_000_000)).toBe(true);
    expect(gate.over(1_300_000)).toBe(false);
  });

  it("never drains below empty", () => {
    const gate = createRateGate(1_000_000);
    gate.over(0);
    gate.over(60_000_000);
    gate.spent(240_000);
    expect(gate.over(60_000_000 + FRAME_US)).toBe(false);
  });
});
