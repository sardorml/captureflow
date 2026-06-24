import { describe, expect, it, vi } from "vitest";
import { startShareUpload } from "../lib/api/upload-streamer";
import type {
  FinalizeRequest,
  InitRequest,
  UploadTransport,
} from "../lib/api/types";

const INIT: InitRequest = { contentType: "video/mp4", source: "instant" };

type PartCall = { partNumber: number; size: number };

type FakeTransport = UploadTransport & {
  screenParts: PartCall[];
  webcamParts: PartCall[];
  finalizedScreen: FinalizeRequest | null;
  finalizedWebcam: FinalizeRequest | null;
  posterBytes: number | null;
};

function fakeTransport(
  opts: { webcam?: boolean; overrides?: Partial<UploadTransport> } = {},
): FakeTransport {
  const screenParts: PartCall[] = [];
  const webcamParts: PartCall[] = [];
  let finalizedScreen: FinalizeRequest | null = null;
  let finalizedWebcam: FinalizeRequest | null = null;
  let posterBytes: number | null = null;

  const base: UploadTransport = {
    init: async () => ({
      slug: "abc12345",
      uploadId: "upload-1",
      storageKey: "videos/abc12345.mp4",
      ...(opts.webcam
        ? {
            webcamUploadId: "upload-2",
            webcamStorageKey: "videos/abc12345-webcam.webm",
          }
        : {}),
    }),
    uploadScreenPart: async (_slug, partNumber, bytes) => {
      screenParts.push({ partNumber, size: bytes.byteLength });
      return { partNumber, etag: `s-${partNumber}` };
    },
    uploadWebcamPart: async (_slug, partNumber, bytes) => {
      webcamParts.push({ partNumber, size: bytes.byteLength });
      return { partNumber, etag: `w-${partNumber}` };
    },
    finalizeScreen: async (req) => {
      finalizedScreen = req;
      return { url: `https://captureflow.xyz/s/${req.slug}` };
    },
    finalizeWebcam: async (req) => {
      finalizedWebcam = req;
    },
    uploadPoster: async (_slug, bytes) => {
      posterBytes = bytes.byteLength;
    },
  };

  const transport = { ...base, ...opts.overrides };
  return {
    ...transport,
    get screenParts() {
      return screenParts;
    },
    get webcamParts() {
      return webcamParts;
    },
    get finalizedScreen() {
      return finalizedScreen;
    },
    get finalizedWebcam() {
      return finalizedWebcam;
    },
    get posterBytes() {
      return posterBytes;
    },
  };
}

const bytes = (n: number): Uint8Array => new Uint8Array(n);

describe("startShareUpload — screen stream", () => {
  it("buffers below the chunk size and ships one trailing part on finish", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.pushScreen(bytes(50));
    upload.pushScreen(bytes(30));
    expect(transport.screenParts).toHaveLength(0);

    const res = await upload.finish();

    expect(transport.screenParts).toEqual([{ partNumber: 1, size: 80 }]);
    expect(transport.finalizedScreen).toEqual({
      slug: "abc12345",
      parts: [{ partNumber: 1, etag: "s-1" }],
      sizeBytes: 80,
    });
    expect(res.url).toContain("abc12345");
  });

  it("splits a large body into equal chunks plus a smaller trailing part", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.pushScreen(bytes(250));
    await upload.finish();

    expect(transport.screenParts).toEqual([
      { partNumber: 1, size: 100 },
      { partNumber: 2, size: 100 },
      { partNumber: 3, size: 50 },
    ]);
  });

  it("fails fast when a screen part rejects and never finalizes", async () => {
    const uploadScreenPart = vi.fn(async (_slug, partNumber: number) => {
      if (partNumber === 1) throw new Error("network down");
      return { partNumber, etag: `s-${partNumber}` };
    });
    const transport = fakeTransport({ overrides: { uploadScreenPart } });
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.pushScreen(bytes(250));

    await expect(upload.finish()).rejects.toThrow("network down");
    expect(transport.finalizedScreen).toBeNull();
  });

  it("rejects a finish with no screen bytes", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });
    await expect(upload.finish()).rejects.toThrow("No screen parts");
  });
});

describe("startShareUpload — webcam stream", () => {
  it("ignores webcam pushes when init reserved no webcam", async () => {
    const transport = fakeTransport({ webcam: false });
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });
    expect(upload.hasWebcam).toBe(false);

    upload.pushScreen(bytes(40));
    upload.pushWebcam(bytes(40));
    await upload.finish();

    expect(transport.webcamParts).toHaveLength(0);
    expect(transport.finalizedWebcam).toBeNull();
  });

  it("uploads and finalizes both streams when a webcam was reserved", async () => {
    const transport = fakeTransport({ webcam: true });
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });
    expect(upload.hasWebcam).toBe(true);

    upload.pushScreen(bytes(120));
    upload.pushWebcam(bytes(60));
    await upload.finish();

    expect(transport.screenParts.map((p) => p.size)).toEqual([100, 20]);
    expect(transport.webcamParts).toEqual([{ partNumber: 1, size: 60 }]);
    expect(transport.finalizedWebcam?.parts).toEqual([
      { partNumber: 1, etag: "w-1" },
    ]);
  });

  it("treats a webcam finalize failure as best-effort (share still succeeds)", async () => {
    const finalizeWebcam = vi.fn(async () => {
      throw new Error("webcam finalize 502");
    });
    const transport = fakeTransport({
      webcam: true,
      overrides: { finalizeWebcam },
    });
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.pushScreen(bytes(40));
    upload.pushWebcam(bytes(40));

    const res = await upload.finish();
    expect(res.url).toContain("abc12345");
    expect(transport.finalizedScreen).not.toBeNull();
    expect(finalizeWebcam).toHaveBeenCalled();
  });

  it("does not finalize the webcam when it recorded nothing", async () => {
    const transport = fakeTransport({ webcam: true });
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });

    upload.pushScreen(bytes(40));
    await upload.finish();

    expect(transport.finalizedWebcam).toBeNull();
  });
});

describe("startShareUpload — poster", () => {
  it("delegates poster upload to the transport", async () => {
    const transport = fakeTransport();
    const upload = await startShareUpload(INIT, { transport, chunkBytes: 100 });
    await upload.uploadPoster(bytes(512));
    expect(transport.posterBytes).toBe(512);
  });
});
