import { describe, expect, it } from "vitest";
import { MIC_CHAIN, dbToGain } from "./mic-chain";

describe("mic chain", () => {
  it("converts decibels to linear gain", () => {
    expect(dbToGain(0)).toBe(1);
    expect(dbToGain(6)).toBeCloseTo(1.995, 3);
    expect(dbToGain(-20)).toBeCloseTo(0.1, 6);
  });

  it("lifts a quiet laptop mic to a speaking level and still holds peaks", () => {
    // A -33 dB RMS voice with -13 dB peaks, as measured off a MacBook mic.
    const voiceRms = -33;
    const peak = -13;
    const { compressor, makeupDb, limiter } = MIC_CHAIN;
    const over = Math.max(0, peak - compressor.threshold);
    const peakOut = compressor.threshold + over / compressor.ratio + makeupDb;
    expect(voiceRms + makeupDb).toBeGreaterThan(-24);
    expect(peakOut).toBeLessThan(limiter.threshold);
  });
});
