import { describe, expect, it, vi } from "vitest";
import { startShareUpload } from "../lib/api/upload-streamer";
import type {
  FinalizeRequest,
  InitRequest,
  UploadTransport,
} from "../lib/api/types";

const INIT: InitRequest = { contentType: "video/mp4", source: "instant" };

type PartCall = { partNumber: number; size: number };

function fakeTransport(
  overrides: Partial<UploadTransport> = {},
): UploadTransport & {
  parts: PartCall[];
  finalized: FinalizeRequest | null;
} {
  const parts: PartCall[] = [];
  let finalized: FinalizeRequest | null = null;
  const base: UploadTransport = {
    init: async () => ({
      slug: "abc12345",
      uploadId: "upload-1",
      storageKey: "videos/abc12345.mp4",
    }),
    uploadPart: async (_slug, partNumber, bytes) => {
      parts.push({ partNumber, size: bytes.byteLength });
      return { partNumber, etag: `etag-${partNumber}` };
    },
    finalize: async (req) => {
      finalized = req;
      return { url: `https://captureflow.xyz/s/${req.slug}` };
    },
  };
  const transport = { ...base, ...overrides };
  return {
    ...transport,
    get parts() {
      return parts;
    },
    get finalized() {
      return finalized;
    },
  };
}

const bytes = (n: number): Uint8Array => new Uint8Array(n);

describe("startShareUpload", () => {
  it("buffers below the chunk size and ships one trailing part on finish", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.push(bytes(50));
    upload.push(bytes(30));
    expect(transport.parts).toHaveLength(0); // 80 < 100: nothing drained yet

    const res = await upload.finish();

    expect(transport.parts).toEqual([{ partNumber: 1, size: 80 }]);
    expect(transport.finalized).toEqual({
      slug: "abc12345",
      parts: [{ partNumber: 1, etag: "etag-1" }],
      sizeBytes: 80,
    });
    expect(res.url).toContain("abc12345");
  });

  it("splits a large body into equal chunks plus a smaller trailing part", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.push(bytes(250));
    await upload.finish();

    expect(transport.parts).toEqual([
      { partNumber: 1, size: 100 },
      { partNumber: 2, size: 100 },
      { partNumber: 3, size: 50 },
    ]);
    expect(transport.finalized?.parts).toEqual([
      { partNumber: 1, etag: "etag-1" },
      { partNumber: 2, etag: "etag-2" },
      { partNumber: 3, etag: "etag-3" },
    ]);
    expect(transport.finalized?.sizeBytes).toBe(250);
  });

  it("coalesces small pushes across the chunk boundary", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.push(bytes(60));
    upload.push(bytes(60)); // crosses 100: first part splits the second push
    upload.push(bytes(60));
    await upload.finish();

    expect(transport.parts).toEqual([
      { partNumber: 1, size: 100 },
      { partNumber: 2, size: 80 },
    ]);
  });

  it("prefers an explicit size over the streamed byte count", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.push(bytes(40));
    await upload.finish(40_000);

    expect(transport.finalized?.sizeBytes).toBe(40_000);
  });

  it("fails fast when a part upload rejects and never finalizes", async () => {
    const uploadPart = vi.fn(async (_slug, partNumber: number) => {
      if (partNumber === 1) throw new Error("network down");
      return { partNumber, etag: `etag-${partNumber}` };
    });
    const finalize = vi.fn(async (req: FinalizeRequest) => ({
      url: `https://captureflow.xyz/s/${req.slug}`,
    }));
    const transport = fakeTransport({ uploadPart, finalize });
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.push(bytes(250)); // triggers a part-1 pump that rejects

    await expect(upload.finish()).rejects.toThrow("network down");
    expect(finalize).not.toHaveBeenCalled();
  });

  it("rejects a finish with no buffered bytes", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    await expect(upload.finish()).rejects.toThrow("No parts uploaded");
    expect(transport.finalized).toBeNull();
  });

  it("drops buffered bytes after abort", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.push(bytes(50));
    upload.abort();
    upload.push(bytes(50));

    await expect(upload.finish()).rejects.toThrow("aborted");
    expect(transport.parts).toHaveLength(0);
  });
});
