import { describe, expect, it } from "vitest";
import { concat, readerFromBytes, view } from "./bytes";
import {
  createWebmReserver,
  scanWebm,
  webmIndexPatch,
  type WebmScan,
} from "./webm-index";

function vint(size: number): Uint8Array {
  return new Uint8Array([0x40 | (size >> 8), size & 0xff]);
}
function el(id: number[], body: Uint8Array): Uint8Array {
  return concat([new Uint8Array(id), vint(body.byteLength), body]);
}
const UNKNOWN_SIZE = new Uint8Array([
  0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
]);
const u8 = (...b: number[]) => new Uint8Array(b);

function block(track: number, relative: number, key: boolean, payload = 50) {
  const body = new Uint8Array(4 + payload);
  body[0] = 0x80 | track;
  view(body).setInt16(1, relative);
  body[3] = key ? 0x80 : 0;
  return el([0xa3], body);
}

// MediaRecorder's shape: unknown-size Segment and Clusters, audio track 1, video track 2.
function recording(seconds: number, keyEverySeconds: number): Uint8Array {
  const header = el(
    [0x1a, 0x45, 0xdf, 0xa3],
    el([0x42, 0x82], new TextEncoder().encode("webm")),
  );
  const info = el(
    [0x15, 0x49, 0xa9, 0x66],
    el([0x2a, 0xd7, 0xb1], u8(0x0f, 0x42, 0x40)),
  );
  const tracks = el(
    [0x16, 0x54, 0xae, 0x6b],
    concat([
      el([0xae], concat([el([0xd7], u8(1)), el([0x83], u8(2))])),
      el([0xae], concat([el([0xd7], u8(2)), el([0x83], u8(1))])),
    ]),
  );
  const clusters: Uint8Array[] = [];
  for (let ms = 0; ms < seconds * 1000; ms += 500) {
    const blocks: Uint8Array[] = [el([0xe7], u8(ms >> 8, ms & 0xff))];
    for (let t = 0; t < 500; t += 100) {
      blocks.push(block(1, t, true, 20));
      blocks.push(block(2, t, (ms + t) % (keyEverySeconds * 1000) === 0));
    }
    clusters.push(
      concat([u8(0x1f, 0x43, 0xb6, 0x75), UNKNOWN_SIZE, ...blocks]),
    );
  }
  return concat([
    header,
    u8(0x18, 0x53, 0x80, 0x67),
    UNKNOWN_SIZE,
    info,
    tracks,
    ...clusters,
  ]);
}

function streamThrough(file: Uint8Array, reserveBytes?: number): Uint8Array {
  const reserver = createWebmReserver(reserveBytes);
  const out: Uint8Array[] = [];
  for (let at = 0; at < file.byteLength; at += 13) {
    out.push(...reserver.write(file.subarray(at, at + 13)));
  }
  return concat(out);
}

describe("createWebmReserver", () => {
  it("adds a Void right before the first Cluster and changes nothing else", () => {
    const file = recording(3, 1);
    const out = streamThrough(file, 1024);
    expect(out.byteLength).toBe(file.byteLength + 1024);
    const firstCluster = file.findIndex(
      (_, i) =>
        file[i] === 0x1f &&
        file[i + 1] === 0x43 &&
        file[i + 2] === 0xb6 &&
        file[i + 3] === 0x75,
    );
    expect(out[firstCluster]).toBe(0xec);
    expect(out.subarray(firstCluster + 1024)).toEqual(
      file.subarray(firstCluster),
    );
  });
});

describe("scanWebm + webmIndexPatch", () => {
  it("finds video keyframes, duration and the reserve", async () => {
    const out = streamThrough(recording(10, 2), 4096);
    const scan = (await scanWebm(readerFromBytes(out))) as WebmScan;
    expect(scan.videoTrack).toBe(2);
    expect(scan.keyframes.map((k) => k.time)).toEqual([
      0, 2000, 4000, 6000, 8000,
    ]);
    expect(scan.durationTicks).toBe(9900);
    expect(scan.reserve?.size).toBe(4096);
    expect(scan.completeBytes).toBe(out.byteLength);
  });

  it("writes Duration and Cues that point at the right clusters", async () => {
    const out = streamThrough(recording(10, 2), 4096);
    const reader = readerFromBytes(out);
    const scan = (await scanWebm(reader)) as WebmScan;
    const patch = (await webmIndexPatch(reader, scan, 100))!;
    const indexed = out.slice();
    indexed.set(patch.bytes, patch.offset);
    expect(indexed.byteLength).toBe(out.byteLength);

    const after = (await scanWebm(readerFromBytes(indexed))) as WebmScan;
    expect(after.info.offset).toBeGreaterThan(scan.info.offset);
    const durationAt = indexOf(after.info.body, [0x44, 0x89]);
    expect(view(after.info.body).getFloat64(durationAt + 3)).toBe(10_000);

    const cuesAt = indexOf(indexed, [0x1c, 0x53, 0xbb, 0x6b]);
    expect(cuesAt).toBeGreaterThan(0);
    for (const k of scan.keyframes) {
      const clusterAt = after.segmentStart + k.clusterPosition;
      expect(Array.from(indexed.subarray(clusterAt, clusterAt + 4))).toEqual([
        0x1f, 0x43, 0xb6, 0x75,
      ]);
    }
  });

  it("thins cues to fit a small reserve", async () => {
    const out = streamThrough(recording(60, 1), 160);
    const reader = readerFromBytes(out);
    const scan = (await scanWebm(reader)) as WebmScan;
    expect(scan.keyframes).toHaveLength(60);
    const patch = await webmIndexPatch(reader, scan);
    expect(patch).not.toBeNull();
  });

  it("stops at the last whole block of a cut-off file", async () => {
    const out = streamThrough(recording(4, 1), 1024);
    const cut = out.subarray(0, out.byteLength - 30);
    const scan = (await scanWebm(readerFromBytes(cut))) as WebmScan;
    expect(scan.completeBytes).toBeLessThan(cut.byteLength);
    expect(scan.completeBytes).toBeGreaterThan(out.byteLength - 200);
  });
});

function indexOf(bytes: Uint8Array, needle: number[]): number {
  outer: for (let i = 0; i <= bytes.byteLength - needle.length; i++) {
    for (let j = 0; j < needle.length; j++)
      if (bytes[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}
