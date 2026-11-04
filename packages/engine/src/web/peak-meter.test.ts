import { describe, expect, it } from "vitest";
import { bucketPeaks, createPeakMeter } from "./peak-meter";

const samples = (...values: number[]) => Float32Array.from(values);

describe("bucketPeaks", () => {
  it("keeps the loudest value of each span", () => {
    expect(Array.from(bucketPeaks([0.125, 0.75, 0.25, 0.5], 2))).toEqual([
      0.75, 0.5,
    ]);
  });

  it("repeats a short series across more buckets", () => {
    expect(Array.from(bucketPeaks([0.5, 0.25], 4))).toEqual([
      0.5, 0.5, 0.25, 0.25,
    ]);
  });

  it("is flat without a series", () => {
    expect(Array.from(bucketPeaks([], 3))).toEqual([0, 0, 0]);
  });
});

describe("createPeakMeter", () => {
  it("takes nothing before start or after finish", () => {
    const meter = createPeakMeter();
    meter.push(samples(0.75));
    meter.start();
    meter.push(samples(0.125, -0.5));
    expect(Array.from(meter.finish(1))).toEqual([0.5]);
    meter.push(samples(0.75));
    meter.start();
    expect(Array.from(meter.finish(1))).toEqual([0]);
  });

  it("leaves paused time out of the series", () => {
    const meter = createPeakMeter();
    meter.start();
    meter.push(samples(0.25));
    meter.pause();
    meter.push(samples(1));
    meter.resume();
    meter.push(samples(0.5));
    expect(Array.from(meter.finish(2))).toEqual([0.25, 0.5]);
  });

  it("starts a fresh series on each start", () => {
    const meter = createPeakMeter();
    meter.start();
    meter.push(samples(0.75));
    meter.start();
    meter.push(samples(0.25));
    expect(Array.from(meter.finish(1))).toEqual([0.25]);
  });
});
