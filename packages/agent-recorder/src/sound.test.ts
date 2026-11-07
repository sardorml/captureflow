import { describe, expect, it } from "vitest";
import { CHANNELS, SAMPLE_RATE } from "./pacing";
import { layerSounds, typingSound } from "./sound";

const peakBetween = (pcm: Int16Array, fromMs: number, toMs: number) => {
  let peak = 0;
  const from = Math.round((fromMs / 1000) * SAMPLE_RATE) * CHANNELS;
  const to = Math.round((toMs / 1000) * SAMPLE_RATE) * CHANNELS;
  for (let i = from; i < to && i < pcm.length; i++) {
    peak = Math.max(peak, Math.abs(pcm[i]!));
  }
  return peak;
};

describe("typingSound", () => {
  const prompt = {
    text: "Hi there",
    at: [500, 600, 700, 1200, 1300],
    sendAt: 2500,
  };

  it("clicks on every key and on send, and is quiet in between", () => {
    const pcm = typingSound(prompt, 1);
    expect(pcm.length / CHANNELS / SAMPLE_RATE).toBeCloseTo(2.77, 1);
    for (const at of prompt.at) {
      expect(peakBetween(pcm, at, at + 20)).toBeGreaterThan(2000);
    }
    expect(peakBetween(pcm, 2500, 2520)).toBeGreaterThan(3000);
    expect(peakBetween(pcm, 2590, 2610)).toBeGreaterThan(1000);
    expect(peakBetween(pcm, 800, 1190)).toBeLessThan(300);
    expect(peakBetween(pcm, 1400, 2490)).toBeLessThan(300);
    expect(pcm[0]).toBe(pcm[1]);
  });

  it("is the same for the same seed and never clips", () => {
    const a = typingSound(prompt, 7);
    const b = typingSound(prompt, 7);
    expect(a).toEqual(b);
    expect(peakBetween(a, 0, 3000)).toBeLessThan(20000);
  });
});

describe("layerSounds", () => {
  it("places each sound at its moment and keeps the sum inside range", () => {
    const tone = new Int16Array(4 * CHANNELS).fill(30000);
    const bed = layerSounds([
      { pcm: tone, atMs: 0 },
      { pcm: tone, atMs: 1000 },
      { pcm: tone, atMs: 1000 },
    ]);
    expect(bed.length).toBe(SAMPLE_RATE * CHANNELS + tone.length);
    expect(bed[0]).toBe(30000);
    expect(bed[CHANNELS * 4]).toBe(0);
    expect(bed[SAMPLE_RATE * CHANNELS]).toBe(32767);
    expect(layerSounds([])).toHaveLength(0);
  });
});
