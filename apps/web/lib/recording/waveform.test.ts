import { describe, expect, it } from "vitest";
import {
  mergePeaks,
  normalisePeaks,
  peakBuckets,
  peakBetween,
  waveformBuckets,
  hydratePeaks,
  hydrateWaveformUpload,
  WAVEFORM_BUCKETS,
  WAVEFORM_BYTES,
} from "./waveform";

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

describe("mergePeaks", () => {
  it("takes the louder track in each bucket", () => {
    const merged = mergePeaks([
      new Float32Array([0.25, 0.75, 0]),
      new Float32Array([0.5, 0.125]),
    ]);
    expect(Array.from(merged)).toEqual([0.5, 0.75, 0]);
  });

  it("lets a quiet track add nothing to a voice once normalised", () => {
    const voice = peakBuckets([tone(1_000, 0.5)], 10);
    const hiss = peakBuckets([tone(1_000, 0.01)], 10);
    expect(Array.from(normalisePeaks(mergePeaks([voice, hiss])))).toEqual(
      Array.from(normalisePeaks(voice)),
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

describe("hydratePeaks", () => {
  it("reads saved peaks", () => {
    const bytes = new ArrayBuffer(WAVEFORM_BYTES);
    new Float32Array(bytes)[3] = 0.5;
    expect(hydratePeaks(bytes)?.[3]).toBe(0.5);
  });

  it("refuses the wrong size", () => {
    expect(hydratePeaks(new ArrayBuffer(WAVEFORM_BYTES - 4))).toBeNull();
    expect(hydratePeaks(new ArrayBuffer(WAVEFORM_BYTES + 4))).toBeNull();
  });

  it("refuses values that aren't levels", () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, -0.5]) {
      const bytes = new ArrayBuffer(WAVEFORM_BYTES);
      new Float32Array(bytes)[0] = bad;
      expect(hydratePeaks(bytes)).toBeNull();
    }
  });
});

describe("hydrateWaveformUpload", () => {
  const peaks = () => Array.from({ length: WAVEFORM_BUCKETS }, () => 0.5);

  it("takes a full set of peaks for a known track", () => {
    const got = hydrateWaveformUpload({ track: "webcam", peaks: peaks() });
    expect(got?.track).toBe("webcam");
    expect(got?.peaks.length).toBe(WAVEFORM_BUCKETS);
    expect(got?.peaks[7]).toBe(0.5);
  });

  it("refuses the wrong count, a bad value or an unknown track", () => {
    expect(hydrateWaveformUpload({ track: "screen", peaks: [0.5] })).toBeNull();
    const negative = peaks();
    negative[3] = -1;
    expect(
      hydrateWaveformUpload({ track: "screen", peaks: negative }),
    ).toBeNull();
    const text = peaks() as unknown[];
    text[3] = "1";
    expect(hydrateWaveformUpload({ track: "screen", peaks: text })).toBeNull();
    expect(hydrateWaveformUpload({ track: "mic", peaks: peaks() })).toBeNull();
    expect(hydrateWaveformUpload(undefined)).toBeNull();
  });
});
