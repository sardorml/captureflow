import { describe, expect, it } from "vitest";
import { createBitrateGovernor } from "./bitrate-governor";

const STEP_MS = 5000;

/*
 * A recording whose bytes grow with the screen bitrate plus a fixed camera,
 * uploading over a link of `uplinkBps` (both in bits per second).
 */
function simulate(opts: {
  ceiling: number;
  cameraBps: number;
  uplink: (atMs: number) => number;
  minutes: number;
}) {
  const governor = createBitrateGovernor({ ceiling: opts.ceiling });
  let recorded = 0;
  let uploaded = 0;
  const backlogs: number[] = [];
  const bitrates: number[] = [];
  for (let at = 0; at <= opts.minutes * 60_000; at += STEP_MS) {
    governor.sample({
      atMs: at,
      recordedBytes: recorded,
      uploadedBytes: uploaded,
    });
    recorded += ((governor.bitrate + opts.cameraBps) / 8) * (STEP_MS / 1000);
    uploaded = Math.min(
      recorded,
      uploaded + (opts.uplink(at) / 8) * (STEP_MS / 1000),
    );
    backlogs.push(recorded - uploaded);
    bitrates.push(governor.bitrate);
  }
  return { backlogs, bitrates, governor };
}

describe("createBitrateGovernor", () => {
  it("leaves a recording the connection keeps up with alone", () => {
    const { bitrates } = simulate({
      ceiling: 4_000_000,
      cameraBps: 1_500_000,
      uplink: () => 20_000_000,
      minutes: 5,
    });
    expect(new Set(bitrates)).toEqual(new Set([4_000_000]));
  });

  it("drops to what a slow connection moves and keeps the backlog small", () => {
    const { bitrates, backlogs } = simulate({
      ceiling: 4_000_000,
      cameraBps: 500_000,
      uplink: () => 2_000_000,
      minutes: 30,
    });
    // After settling: on average within what the link carries beside the
    // camera, and never more than ten seconds of uplink left to send.
    const half = bitrates.length / 2;
    const tail = bitrates.slice(half);
    expect(tail.reduce((a, b) => a + b, 0) / tail.length).toBeLessThan(
      1_500_000,
    );
    expect(Math.max(...backlogs.slice(half))).toBeLessThan(
      (2_000_000 / 8) * 10,
    );
  });

  it("never goes below the floor", () => {
    const { bitrates } = simulate({
      ceiling: 2_500_000,
      cameraBps: 600_000,
      uplink: () => 300_000,
      minutes: 10,
    });
    expect(Math.min(...bitrates)).toBe(500_000);
  });

  it("climbs back once the connection recovers", () => {
    const { bitrates } = simulate({
      ceiling: 4_000_000,
      cameraBps: 0,
      uplink: (at) => (at < 5 * 60_000 ? 1_500_000 : 50_000_000),
      minutes: 12,
    });
    expect(Math.min(...bitrates)).toBeLessThan(1_500_000);
    expect(bitrates.at(-1)).toBe(4_000_000);
  });

  it("spaces changes out", () => {
    const governor = createBitrateGovernor({ ceiling: 4_000_000 });
    const mb = 1024 * 1024;
    governor.sample({ atMs: 0, recordedBytes: 10 * mb, uploadedBytes: 0 });
    expect(
      governor.sample({
        atMs: 5000,
        recordedBytes: 15 * mb,
        uploadedBytes: mb,
      }),
    ).not.toBeNull();
    expect(
      governor.sample({
        atMs: 7000,
        recordedBytes: 17 * mb,
        uploadedBytes: mb,
      }),
    ).toBeNull();
  });

  it("holds still while paused", () => {
    const governor = createBitrateGovernor({ ceiling: 4_000_000 });
    const mb = 1024 * 1024;
    governor.sample({ atMs: 0, recordedBytes: 9 * mb, uploadedBytes: 0 });
    expect(
      governor.sample({
        atMs: 20_000,
        recordedBytes: 9 * mb,
        uploadedBytes: 0,
      }),
    ).toBeNull();
  });
});
