import { describe, expect, it } from "vitest";
import { createFmp4Muxer } from "../web/fmp4-mux";
import { concat, fourcc, readerFromBytes, view } from "./bytes";
import {
  createFmp4Reserver,
  fmp4IndexPatch,
  scanFmp4,
  type Fmp4Scan,
} from "./fmp4-index";

const FPS = 30;
const FRAME_US = 1_000_000 / FPS;

function muxed(seconds: number, keyEvery = FPS * 2): Uint8Array {
  const out: { bytes: Uint8Array; position: number }[] = [];
  const muxer = createFmp4Muxer({
    video: { width: 64, height: 64, frameRate: FPS },
    output: (bytes, position) => out.push({ bytes: bytes.slice(), position }),
  });
  for (let i = 0; i < seconds * FPS; i++) {
    const key = i % keyEvery === 0;
    muxer.addVideoChunkRaw(
      new Uint8Array(key ? 900 : 200).fill(i % 251),
      key ? "key" : "delta",
      i * FRAME_US,
      FRAME_US,
      i === 0
        ? {
            decoderConfig: {
              codec: "avc1.42001f",
              codedWidth: 64,
              codedHeight: 64,
              description: new Uint8Array([1, 0x42, 0, 0x1f, 0xff, 0xe0, 0]),
            },
          }
        : undefined,
    );
  }
  muxer.finalize();
  const size = Math.max(...out.map((o) => o.position + o.bytes.byteLength));
  const file = new Uint8Array(size);
  for (const o of out) file.set(o.bytes, o.position);
  return file;
}

function topLevel(file: Uint8Array): string[] {
  const types: string[] = [];
  for (let at = 0; at + 8 <= file.byteLength; ) {
    types.push(fourcc(file, at + 4));
    at += view(file).getUint32(at);
  }
  return types;
}

// Splits at uneven offsets so box headers land across writes.
function streamThrough(file: Uint8Array, reserveBytes?: number): Uint8Array {
  const reserver = createFmp4Reserver(reserveBytes);
  const out: Uint8Array[] = [];
  let seed = 7;
  for (let at = 0; at < file.byteLength; ) {
    seed = (seed * 48271) % 2147483647;
    const n = Math.min(1 + (seed % 37), file.byteLength - at);
    out.push(...reserver.write(file.subarray(at, at + n)));
    at += n;
  }
  return concat(out);
}

function apply(file: Uint8Array, patch: { offset: number; bytes: Uint8Array }) {
  const copy = file.slice();
  copy.set(patch.bytes, patch.offset);
  return copy;
}

function sidxReferences(file: Uint8Array, at: number) {
  const dv = view(file);
  const count = dv.getUint16(at + 38);
  return {
    timescale: dv.getUint32(at + 16),
    firstOffset: Number(dv.getBigUint64(at + 28)),
    refs: Array.from({ length: count }, (_, i) => ({
      size: dv.getUint32(at + 40 + i * 12) & 0x7fffffff,
      duration: dv.getUint32(at + 44 + i * 12),
      sap: dv.getUint32(at + 48 + i * 12) >>> 28,
    })),
  };
}

describe("createFmp4Reserver", () => {
  it("puts a free box right after moov and drops mfra", () => {
    const file = muxed(10);
    expect(topLevel(file)).toContain("mfra");
    const out = streamThrough(file, 4096);
    const types = topLevel(out);
    expect(types.slice(0, 3)).toEqual(["ftyp", "moov", "free"]);
    expect(types).not.toContain("mfra");
    expect(types.filter((t) => t === "moof")).toHaveLength(
      topLevel(file).filter((t) => t === "moof").length,
    );
  });
});

describe("scanFmp4 + fmp4IndexPatch", () => {
  it("indexes every fragment with its size and duration", async () => {
    const out = streamThrough(muxed(20), 4096);
    const scan = (await scanFmp4(readerFromBytes(out))) as Fmp4Scan;
    expect(scan.fragments).toHaveLength(10);
    expect(scan.completeBytes).toBe(out.byteLength);

    const patch = fmp4IndexPatch(scan);
    expect(patch?.bytes.byteLength).toBe(4096);
    const indexed = apply(out, patch!);
    expect(fourcc(indexed, scan.reserve!.offset + 4)).toBe("free");
    const sidxAt =
      scan.reserve!.offset + view(indexed).getUint32(scan.reserve!.offset);
    expect(fourcc(indexed, sidxAt + 4)).toBe("sidx");

    const { timescale, firstOffset, refs } = sidxReferences(indexed, sidxAt);
    const firstMoof = scan.fragments[0]!.offset;
    const sidxEnd = sidxAt + view(indexed).getUint32(sidxAt);
    expect(firstOffset).toBe(0);
    expect(sidxEnd).toBe(firstMoof);
    expect(refs.reduce((n, r) => n + r.size, 0)).toBe(
      out.byteLength - firstMoof,
    );
    expect(refs.reduce((n, r) => n + r.duration, 0) / timescale).toBeCloseTo(
      20,
      1,
    );
    expect(refs.every((r) => r.sap === 0b1001)).toBe(true);
  });

  it("shares references once fragments outgrow the reserve", async () => {
    const out = streamThrough(muxed(60), 40 + 8 + 12 * 4);
    const scan = (await scanFmp4(readerFromBytes(out))) as Fmp4Scan;
    expect(scan.fragments).toHaveLength(30);
    const indexed = apply(out, fmp4IndexPatch(scan)!);
    const sidxAt =
      scan.reserve!.offset + view(indexed).getUint32(scan.reserve!.offset);
    const { refs } = sidxReferences(indexed, sidxAt);
    expect(refs.length).toBeLessThanOrEqual(4);
    expect(refs.reduce((n, r) => n + r.size, 0)).toBe(
      out.byteLength - scan.fragments[0]!.offset,
    );
  });

  it("stops at the last complete fragment of a cut-off file", async () => {
    const out = streamThrough(muxed(20), 4096);
    const full = (await scanFmp4(readerFromBytes(out))) as Fmp4Scan;
    const cut = out.subarray(0, full.fragments[6]!.offset + 100);
    const scan = (await scanFmp4(readerFromBytes(cut))) as Fmp4Scan;
    expect(scan.fragments).toHaveLength(6);
    expect(scan.completeBytes).toBe(full.fragments[6]!.offset);
    expect(fmp4IndexPatch(scan)).not.toBeNull();
  });

  it("has nothing to patch without a reserve", async () => {
    const scan = (await scanFmp4(readerFromBytes(muxed(4)))) as Fmp4Scan;
    expect(scan.reserve).toBeNull();
    expect(fmp4IndexPatch(scan)).toBeNull();
  });
});

describe("createFmp4Reserver on a stream that isn't MP4", () => {
  it("passes it through untouched", () => {
    const junk = new Uint8Array(300).fill(0);
    junk[3] = 3;
    const reserver = createFmp4Reserver(1024);
    const out = concat([
      ...reserver.write(junk.subarray(0, 5)),
      ...reserver.write(junk.subarray(5)),
    ]);
    expect(out).toEqual(junk);
  });
});
