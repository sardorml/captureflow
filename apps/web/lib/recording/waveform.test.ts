import { describe, expect, it } from "vitest";
import { peakBetween, waveformBuckets } from "./waveform";

function tone(samples: number, amplitude: number): Float32Array {
  const out = new Float32Array(samples);
  for (let i = 0; i < samples; i++) out[i] = amplitude * Math.sin(i / 7);
  return out;
}

describe("waveformBuckets", () => {
  it("is silent for silence or no audio", () => {
    expect(Array.from(waveformBuckets([new Float32Array(100)], 4))).toEqual([
      0, 0, 0, 0,
    ]);
    expect(waveformBuckets([], 4).length).toBe(4);
  });

  it("keeps a quiet voice visible next to one loud click", () => {
    const voice = tone(10_000, 0.2);
    voice[5_000] = 1;
    const buckets = waveformBuckets([voice], 100);
    expect(buckets[50]).toBe(1);
    expect(buckets[10]).toBeGreaterThan(0.9);
  });

  it("mixes channels by the louder one", () => {
    const left = tone(1_000, 0.1);
    const right = tone(1_000, 0.5);
    const mono = waveformBuckets([right], 10);
    expect(Array.from(waveformBuckets([left, right], 10))).toEqual(
      Array.from(mono),
    );
  });
});

describe("peakBetween", () => {
  it("returns the loudest bucket in a span", () => {
    const buckets = new Float32Array([0.1, 0.9, 0.2, 0.3]);
    expect(peakBetween(buckets, 0, 0.5)).toBeCloseTo(0.9);
    expect(peakBetween(buckets, 0.5, 1)).toBeCloseTo(0.3);
    expect(peakBetween(buckets, 0.6, 0.6)).toBeCloseTo(0.2);
  });
});
