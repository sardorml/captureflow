import assert from "node:assert/strict";
import { test } from "node:test";
import { createPeakCollector, WAVEFORM_BUCKETS } from "./peaks.ts";

function samples(values: number[]): Buffer {
  const out = Buffer.alloc(values.length * 4);
  values.forEach((v, i) => out.writeFloatLE(v, i * 4));
  return out;
}

test("no samples read as silence", () => {
  const peaks = createPeakCollector().finish();
  assert.equal(peaks.length, WAVEFORM_BUCKETS);
  assert.ok(peaks.every((p) => p === 0));
});

test("a sample split across chunks still counts", () => {
  const collector = createPeakCollector();
  const bytes = samples([0.5]);
  collector.add(bytes.subarray(0, 3));
  collector.add(bytes.subarray(3));
  assert.equal(collector.finish()[0], 0.5);
});

test("keeps the loudest level and ignores its sign", () => {
  const collector = createPeakCollector();
  const quiet = new Array<number>(16_000).fill(0.1);
  quiet[8_000] = -0.75;
  collector.add(samples(quiet));
  const peaks = collector.finish();
  assert.equal(peaks[0], peaks[WAVEFORM_BUCKETS - 1]);
  assert.equal(peaks[WAVEFORM_BUCKETS / 2], 0.75);
});
