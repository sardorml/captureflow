/*
 * Loudness of the mic over a recording, one peak per audio buffer, kept in
 * recording time: nothing is taken between start and finish while paused.
 * finish() folds the series into the bucket count the editor's lane wants.
 */
export type PeakMeter = {
  start(): void;
  pause(): void;
  resume(): void;
  finish(buckets: number): Float32Array<ArrayBuffer>;
};

export type PeakMeterInput = PeakMeter & {
  push(samples: Float32Array): void;
};

export function bucketPeaks(
  series: readonly number[],
  buckets: number,
): Float32Array<ArrayBuffer> {
  const out = new Float32Array(Math.max(0, buckets));
  if (series.length === 0) return out;
  for (let b = 0; b < out.length; b++) {
    const start = Math.floor((b * series.length) / out.length);
    const end = Math.max(
      start + 1,
      Math.floor(((b + 1) * series.length) / out.length),
    );
    let peak = 0;
    for (let i = start; i < end && i < series.length; i++) {
      const v = series[i] ?? 0;
      if (v > peak) peak = v;
    }
    out[b] = peak;
  }
  return out;
}

export function createPeakMeter(): PeakMeterInput {
  let series: number[] = [];
  let active = false;
  let paused = false;
  return {
    push(samples) {
      if (!active || paused) return;
      let peak = 0;
      for (let i = 0; i < samples.length; i++) {
        const v = Math.abs(samples[i] ?? 0);
        if (v > peak) peak = v;
      }
      series.push(peak);
    },
    start() {
      series = [];
      active = true;
      paused = false;
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    },
    finish(buckets) {
      active = false;
      return bucketPeaks(series, buckets);
    },
  };
}
