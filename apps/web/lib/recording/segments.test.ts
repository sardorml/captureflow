import { beforeEach, describe, expect, it, vi } from "vitest";

const objects = new Map<string, Uint8Array>();
const parts = new Map<string, Uint8Array>();

vi.mock("./r2", () => ({
  putObject: async (key: string, body: ArrayBuffer) => {
    objects.set(key, new Uint8Array(body.slice(0)));
  },
  readObjectRange: async (key: string, offset: number, length: number) =>
    objects.get(key)?.slice(offset, offset + length) ?? null,
  uploadPart: async (
    key: string,
    uploadId: string,
    partNumber: number,
    body: ArrayBuffer,
  ) => {
    parts.set(`${key}:${partNumber}`, new Uint8Array(body.slice(0)));
    return { partNumber, etag: `e${partNumber}-${body.byteLength}` };
  },
}));

const {
  PART_BYTES,
  buildCoveredParts,
  completeSegmentParts,
  coveredBytes,
  hydrateFinalizeSource,
  hydrateSegmentParams,
  partsReadyToBuild,
  partsToBuild,
  planReads,
  storeSegment,
} = await import("./segments");

const MiB = 1024 * 1024;
const TARGET = { storageKey: "videos/abc.mp4", uploadId: "up-1" };

function file(size: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(size));
  for (let i = 0; i < size; i++) bytes[i] = (i * 31 + (i >> 11)) & 0xff;
  return bytes;
}

async function send(slug: string, bytes: Uint8Array, offset: number) {
  const body = bytes.slice(offset, offset + Math.min(bytes.length - offset));
  await storeSegment(slug, "screen", TARGET, offset, body.buffer);
}

function assembled(list: { partNumber: number }[]): Uint8Array {
  const chunks = list.map(
    (p) => parts.get(`${TARGET.storageKey}:${p.partNumber}`)!,
  );
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

beforeEach(() => {
  objects.clear();
  parts.clear();
});

describe("hydrateSegmentParams", () => {
  it("reads a screen segment by default", () => {
    expect(
      hydrateSegmentParams(new URLSearchParams("slug=abcdefgh23&offset=42")),
    ).toEqual({ slug: "abcdefgh23", stream: "screen", offset: 42 });
  });

  it("rejects a bad stream, offset or slug", () => {
    for (const q of [
      "slug=abcdefgh23&offset=1&stream=audio",
      "slug=abcdefgh23&offset=-1",
      "slug=abcdefgh23&offset=1.5",
      "slug=abcdefgh23",
      "slug=a/b&offset=0",
    ]) {
      expect(hydrateSegmentParams(new URLSearchParams(q))).toBeNull();
    }
  });
});

describe("hydrateFinalizeSource", () => {
  it("takes segments or well-formed parts", () => {
    expect(hydrateFinalizeSource({ segments: true })).toEqual({
      segments: true,
    });
    expect(
      hydrateFinalizeSource({ parts: [{ partNumber: 1, etag: "x" }] }),
    ).toEqual({ parts: [{ partNumber: 1, etag: "x" }] });
  });

  it("rejects missing or malformed parts", () => {
    expect(hydrateFinalizeSource({})).toBeNull();
    expect(hydrateFinalizeSource({ parts: [] })).toBeNull();
    expect(hydrateFinalizeSource({ parts: [{ partNumber: 1 }] })).toBeNull();
  });
});

describe("coveredBytes and planReads", () => {
  const segs = [
    { offset: 0, size: 100 },
    { offset: 100, size: 50 },
    { offset: 120, size: 80 },
    { offset: 300, size: 10 },
  ];

  it("stops at the first gap", () => {
    expect(coveredBytes(segs)).toBe(200);
  });

  it("reads across pieces, preferring the one that reaches furthest", () => {
    expect(planReads(segs, 90, 200)).toEqual([
      { offset: 0, start: 90, length: 10 },
      { offset: 100, start: 0, length: 50 },
      { offset: 120, start: 30, length: 50 },
    ]);
  });

  it("refuses a range with a hole", () => {
    expect(planReads(segs, 150, 310)).toBeNull();
  });
});

describe("partsReadyToBuild and partsToBuild", () => {
  it("builds whole parts after the first while recording", () => {
    expect(partsReadyToBuild(3 * PART_BYTES + 1, new Set([2]))).toEqual([3]);
    expect(partsReadyToBuild(PART_BYTES * 1.5, new Set())).toEqual([]);
  });

  it("always rebuilds part 1 and the partial last part", () => {
    expect(partsToBuild(3.5 * PART_BYTES, new Set([2, 3]))).toEqual([1, 4]);
  });

  it("rebuilds a part a crash cut the file back through", () => {
    expect(partsToBuild(2.5 * PART_BYTES, new Set([2, 3]))).toEqual([1, 3]);
  });
});

describe("completeSegmentParts", () => {
  it(
    "rebuilds the file exactly from out-of-order, overlapping pieces",
    { timeout: 60_000 },
    async () => {
      const slug = "aaaaaaaaa2";
      const bytes = file(12 * MiB + 12345);
      const header = 70_000;
      await send(slug, bytes.subarray(0, header).slice(), 0);
      const cuts = [
        header,
        3 * MiB,
        3 * MiB + 7,
        7 * MiB,
        11 * MiB,
        bytes.length,
      ];
      for (let i = cuts.length - 2; i >= 0; i--) {
        const body = bytes.slice(cuts[i], cuts[i + 1]);
        await storeSegment(slug, "screen", TARGET, cuts[i]!, body.buffer);
      }
      // A resumed upload sending the middle again in other cuts.
      await storeSegment(
        slug,
        "screen",
        TARGET,
        2 * MiB,
        bytes.slice(2 * MiB, 9 * MiB).buffer,
      );
      await buildCoveredParts(slug, "screen", TARGET);
      expect([...parts.keys()].sort()).toEqual([`${TARGET.storageKey}:2`]);

      // The recorder writes the index into the header when it stops.
      bytes.fill(9, 100, 200);
      await send(slug, bytes.subarray(0, header).slice(), 0);

      const list = await completeSegmentParts(
        slug,
        "screen",
        TARGET,
        bytes.length,
      );
      expect(list?.map((p) => p.partNumber)).toEqual([1, 2, 3]);
      expect(Buffer.compare(assembled(list!), bytes)).toBe(0);
      const sizes = list!.map(
        (p) => parts.get(`${TARGET.storageKey}:${p.partNumber}`)!.length,
      );
      expect(sizes.slice(0, -1).every((s) => s === PART_BYTES)).toBe(true);
    },
  );

  it("waits while the pieces have a gap", async () => {
    const slug = "bbbbbbbbb2";
    const bytes = file(2 * MiB);
    await storeSegment(slug, "screen", TARGET, 0, bytes.slice(0, MiB).buffer);
    expect(
      await completeSegmentParts(slug, "screen", TARGET, bytes.length),
    ).toBeNull();
  });
});
