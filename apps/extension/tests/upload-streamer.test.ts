import { describe, expect, it, vi } from "vitest";
import type { RecordingFile } from "@captureflow/engine/media";
import {
  resumeRecordingUpload,
  startRecordingUpload,
  UploadStalledError,
  type LocalFiles,
  type OnlineSignal,
  type PendingUpload,
  type RecordingUploadOptions,
} from "../lib/api/upload-streamer";
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
  posterCardBytes: number | null;
  abortedSlugs: string[];
};

function fakeTransport(
  opts: { webcam?: boolean; overrides?: Partial<UploadTransport> } = {},
): FakeTransport {
  const screenParts: PartCall[] = [];
  const webcamParts: PartCall[] = [];
  let finalizedScreen: FinalizeRequest | null = null;
  let finalizedWebcam: FinalizeRequest | null = null;
  let posterBytes: number | null = null;
  let posterCardBytes: number | null = null;
  const abortedSlugs: string[] = [];

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
      return { url: `https://captureflow.dev/s/${req.slug}` };
    },
    finalizeWebcam: async (req) => {
      finalizedWebcam = req;
    },
    uploadPoster: async (_slug, bytes) => {
      posterBytes = bytes.byteLength;
    },
    uploadPosterCard: async (_slug, bytes) => {
      posterCardBytes = bytes.byteLength;
    },
    uploadAudioPart: async () => {},
    transcribe: async () => {},
    abort: async (req) => {
      abortedSlugs.push(req.slug);
    },
    state: async () => ({ state: "pending" }),
    viewUrl: (slug) => `https://captureflow.dev/r/${slug}`,
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
    get posterCardBytes() {
      return posterCardBytes;
    },
    get abortedSlugs() {
      return abortedSlugs;
    },
  };
}

// Manually driven connectivity: flip `online` and fire the queued listeners.
function fakeOnline(initial = true) {
  let online = initial;
  const listeners = new Set<() => void>();
  const signal: OnlineSignal = {
    isOnline: () => online,
    onOnline: (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
  return {
    signal,
    set(next: boolean) {
      online = next;
      if (online) {
        for (const cb of [...listeners]) cb();
      }
    },
  };
}

const bytes = (n: number): Uint8Array => new Uint8Array(n);

function memoryFile(): RecordingFile {
  let data = new Uint8Array(0);
  return {
    get size() {
      return data.byteLength;
    },
    read: async (offset, length) => data.slice(offset, offset + length),
    append: async (chunk) => {
      const next = new Uint8Array(data.byteLength + chunk.byteLength);
      next.set(data);
      next.set(chunk, data.byteLength);
      data = next;
    },
    write: async (offset, chunk) => {
      data.set(chunk, offset);
    },
    truncate: async (size) => {
      data = data.slice(0, size);
    },
  };
}

// This device's copy, kept across "crashes" by slug like the real one.
function deviceFiles() {
  const store = new Map<string, LocalFiles>();
  const removed: string[] = [];
  const openFiles = async (slug: string, hasWebcam: boolean) => {
    let files = store.get(slug);
    if (!files) {
      files = {
        screen: memoryFile(),
        webcam: hasWebcam ? memoryFile() : null,
        remove: async () => {
          store.delete(slug);
          removed.push(slug);
        },
      };
      store.set(slug, files);
    }
    return files;
  };
  return { openFiles, store, removed };
}

function options(
  transport: UploadTransport,
  extra: Partial<RecordingUploadOptions> = {},
): RecordingUploadOptions {
  return {
    transport,
    openFiles: deviceFiles().openFiles,
    partBytes: 100,
    retryWait: async () => {},
    ...extra,
  };
}

const byPart = (parts: PartCall[]) =>
  [...parts].sort((a, b) => a.partNumber - b.partNumber);

const tick = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

describe("startRecordingUpload — screen stream", () => {
  it("buffers below the chunk size and ships one trailing part on finish", async () => {
    const transport = fakeTransport();
    const upload = await startRecordingUpload(INIT, options(transport));

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
    const upload = await startRecordingUpload(INIT, options(transport));

    upload.pushScreen(bytes(250));
    await upload.finish();

    expect(byPart(transport.screenParts)).toEqual([
      { partNumber: 1, size: 100 },
      { partNumber: 2, size: 100 },
      { partNumber: 3, size: 50 },
    ]);
  });

  it("sends part 1 last, after the rest of the file", async () => {
    const transport = fakeTransport();
    const upload = await startRecordingUpload(INIT, options(transport));
    upload.pushScreen(bytes(250));
    await upload.finish();
    expect(transport.screenParts.at(-1)?.partNumber).toBe(1);
  });

  it("retries a part that fails instead of losing the recording", async () => {
    let failures = 2;
    const uploadScreenPart = vi.fn(async (_slug, partNumber: number) => {
      if (partNumber === 2 && failures-- > 0) throw new Error("network down");
      return { partNumber, etag: `s-${partNumber}` };
    });
    const transport = fakeTransport({ overrides: { uploadScreenPart } });
    const upload = await startRecordingUpload(INIT, options(transport));

    upload.pushScreen(bytes(250));
    await upload.finish();

    expect(transport.finalizedScreen?.parts).toHaveLength(3);
  });

  it("keeps the files and reports a stall when parts never land", async () => {
    const uploadScreenPart = vi.fn(async () => {
      throw new Error("network down");
    });
    const transport = fakeTransport({ overrides: { uploadScreenPart } });
    const device = deviceFiles();
    const upload = await startRecordingUpload(
      INIT,
      options(transport, { openFiles: device.openFiles }),
    );

    upload.pushScreen(bytes(250));

    await expect(upload.finish()).rejects.toBeInstanceOf(UploadStalledError);
    expect(transport.finalizedScreen).toBeNull();
    expect(transport.abortedSlugs).toEqual([]);
    expect(device.store.has("abc12345")).toBe(true);
  });

  it("rejects a finish with no screen bytes", async () => {
    const transport = fakeTransport();
    const upload = await startRecordingUpload(INIT, options(transport));
    await expect(upload.finish()).rejects.toThrow("No screen parts");
  });
});

/*
 * Storage is the only ceiling on a recording, so the budget /init reports is
 * what the recorder stops on. Surfacing it verbatim — including its absence —
 * is this layer's whole job in that decision.
 */
/*
 * Throughput hangs on this: sequential parts cap the flush at chunk ÷
 * round-trip, which is what made "Saving…" run for minutes on long captures.
 */
// Resolves every part as it is requested until the finish settles.
async function settle(
  parts: { resolve(n: number): void },
  finishing: Promise<unknown>,
): Promise<void> {
  let done = false;
  void finishing.finally(() => {
    done = true;
  });
  while (!done) {
    for (let n = 1; n <= 20; n++) parts.resolve(n);
    await tick();
  }
  await finishing;
}

describe("startRecordingUpload — concurrent parts", () => {
  function deferredScreenParts() {
    const resolvers = new Map<number, () => void>();
    let inFlight = 0;
    let maxInFlight = 0;
    const uploadScreenPart = async (
      _slug: string,
      partNumber: number,
      bytes: Uint8Array,
    ) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise<void>((resolve) => resolvers.set(partNumber, resolve));
      inFlight--;
      return { partNumber, etag: `s-${partNumber}`, size: bytes.byteLength };
    };
    return {
      uploadScreenPart,
      resolve: (partNumber: number) => resolvers.get(partNumber)?.(),
      get maxInFlight() {
        return maxInFlight;
      },
    };
  }

  it("keeps several parts in flight at once", async () => {
    const parts = deferredScreenParts();
    const transport = fakeTransport({
      overrides: { uploadScreenPart: parts.uploadScreenPart },
    });
    const upload = await startRecordingUpload(INIT, options(transport));

    upload.pushScreen(bytes(650));
    await tick();
    expect(parts.maxInFlight).toBe(4);

    const finishing = upload.finish();
    await settle(parts, finishing);

    expect(transport.finalizedScreen?.sizeBytes).toBe(650);
  });

  it("finalizes with ascending part numbers when parts finish out of order", async () => {
    const parts = deferredScreenParts();
    const transport = fakeTransport({
      overrides: { uploadScreenPart: parts.uploadScreenPart },
    });
    const upload = await startRecordingUpload(INIT, options(transport));

    upload.pushScreen(bytes(300));
    await tick();
    parts.resolve(3);
    await tick();
    parts.resolve(2);
    const finishing = upload.finish();
    await settle(parts, finishing);

    expect(transport.finalizedScreen?.parts.map((p) => p.partNumber)).toEqual([
      1, 2, 3,
    ]);
  });

  it("counts uploadedBytes as parts complete, not as they are queued", async () => {
    const parts = deferredScreenParts();
    const transport = fakeTransport({
      overrides: { uploadScreenPart: parts.uploadScreenPart },
    });
    const upload = await startRecordingUpload(INIT, options(transport));

    upload.pushScreen(bytes(200));
    await tick();
    expect(upload.uploadedBytes).toBe(0);

    parts.resolve(2);
    await tick();
    await tick();
    expect(upload.uploadedBytes).toBe(100);

    const finishing = upload.finish();
    await settle(parts, finishing);
    expect(upload.uploadedBytes).toBe(200);
  });
});

describe("startRecordingUpload — storage budget", () => {
  it("carries the remaining budget through from init", async () => {
    const transport = fakeTransport({
      overrides: {
        init: async () => ({
          slug: "abc12345",
          uploadId: "upload-1",
          storageKey: "videos/abc12345.mp4",
          remainingBytes: 4_096,
        }),
      },
    });
    const upload = await startRecordingUpload(INIT, options(transport));

    expect(upload.remainingBytes).toBe(4_096);
  });

  it("reports no budget when init omits one, so nothing stops the recording", async () => {
    const upload = await startRecordingUpload(INIT, options(fakeTransport()));

    expect(upload.remainingBytes).toBeNull();
  });

  it("counts both streams against the one budget", async () => {
    const transport = fakeTransport({ webcam: true });
    const upload = await startRecordingUpload(
      INIT,
      options(transport, { partBytes: 1_000 }),
    );

    upload.pushScreen(bytes(60));
    upload.pushWebcam(bytes(40));

    expect(upload.screenBytes + upload.webcamBytes).toBe(100);
  });
});

describe("startRecordingUpload — webcam stream", () => {
  it("ignores webcam pushes when init reserved no webcam", async () => {
    const transport = fakeTransport({ webcam: false });
    const upload = await startRecordingUpload(INIT, options(transport));
    expect(upload.hasWebcam).toBe(false);

    upload.pushScreen(bytes(40));
    upload.pushWebcam(bytes(40));
    await upload.finish();

    expect(transport.webcamParts).toHaveLength(0);
    expect(transport.finalizedWebcam).toBeNull();
  });

  it("uploads and finalizes both streams when a webcam was reserved", async () => {
    const transport = fakeTransport({ webcam: true });
    const upload = await startRecordingUpload(INIT, options(transport));
    expect(upload.hasWebcam).toBe(true);

    upload.pushScreen(bytes(120));
    upload.pushWebcam(bytes(60));
    await upload.finish();

    expect(byPart(transport.screenParts).map((p) => p.size)).toEqual([100, 20]);
    expect(transport.webcamParts).toEqual([{ partNumber: 1, size: 60 }]);
    expect(transport.finalizedWebcam?.parts).toEqual([
      { partNumber: 1, etag: "w-1" },
    ]);
  });

  it("treats a webcam finalize failure as best-effort (recording still succeeds)", async () => {
    const finalizeWebcam = vi.fn(async () => {
      throw new Error("webcam finalize 502");
    });
    const transport = fakeTransport({
      webcam: true,
      overrides: { finalizeWebcam },
    });
    const upload = await startRecordingUpload(INIT, options(transport));

    upload.pushScreen(bytes(40));
    upload.pushWebcam(bytes(40));

    const res = await upload.finish();
    expect(res.url).toContain("abc12345");
    expect(transport.finalizedScreen).not.toBeNull();
    expect(finalizeWebcam).toHaveBeenCalled();
  });

  it("does not finalize the webcam when it recorded nothing", async () => {
    const transport = fakeTransport({ webcam: true });
    const upload = await startRecordingUpload(INIT, options(transport));

    upload.pushScreen(bytes(40));
    await upload.finish();

    expect(transport.finalizedWebcam).toBeNull();
  });
});

describe("startRecordingUpload — poster", () => {
  it("delegates poster upload to the transport", async () => {
    const transport = fakeTransport();
    const upload = await startRecordingUpload(INIT, options(transport));
    await upload.uploadPoster(bytes(512));
    expect(transport.posterBytes).toBe(512);
  });

  it("delegates the card upload to the transport", async () => {
    const transport = fakeTransport();
    const upload = await startRecordingUpload(INIT, options(transport));
    await upload.uploadPosterCard(bytes(256));
    expect(transport.posterCardBytes).toBe(256);
  });
});

describe("startRecordingUpload — abort", () => {
  it("releases the server-side upload exactly once", async () => {
    const transport = fakeTransport();
    const upload = await startRecordingUpload(INIT, options(transport));
    upload.pushScreen(bytes(40));
    upload.abort();
    upload.abort();
    await tick();
    expect(transport.abortedSlugs).toEqual(["abc12345"]);
  });

  it("removes this device's copy", async () => {
    const device = deviceFiles();
    const upload = await startRecordingUpload(
      INIT,
      options(fakeTransport(), { openFiles: device.openFiles }),
    );
    upload.pushScreen(bytes(40));
    upload.abort();
    await tick();
    expect(device.removed).toEqual(["abc12345"]);
  });
});

describe("startRecordingUpload — offline handling", () => {
  it("holds queued parts while offline and resumes on the online signal", async () => {
    const transport = fakeTransport();
    const net = fakeOnline(false);
    const upload = await startRecordingUpload(
      INIT,
      options(transport, { online: net.signal }),
    );

    upload.pushScreen(bytes(250));
    await tick();
    expect(transport.screenParts).toHaveLength(0);

    net.set(true);
    await tick();
    await tick();
    expect(transport.screenParts.map((p) => p.partNumber)).toEqual([2]);

    await upload.finish();
    expect(byPart(transport.screenParts).map((p) => p.size)).toEqual([
      100, 100, 50,
    ]);
  });

  it("waits for connectivity before draining the tail", async () => {
    const transport = fakeTransport();
    const net = fakeOnline(true);
    const upload = await startRecordingUpload(
      INIT,
      options(transport, { online: net.signal }),
    );

    upload.pushScreen(bytes(40));
    net.set(false);
    const finishing = upload.finish();
    await tick();
    expect(transport.screenParts).toHaveLength(0);

    net.set(true);
    await finishing;
    expect(transport.screenParts).toEqual([{ partNumber: 1, size: 40 }]);
  });
});

describe("startRecordingUpload — finalize fallback", () => {
  it("treats a network-lost finalize as success when the state probe says ready", async () => {
    const transport = fakeTransport({
      overrides: {
        finalizeScreen: async () => {
          throw new TypeError("fetch failed");
        },
        state: async () => ({ state: "ready" }),
      },
    });
    const upload = await startRecordingUpload(INIT, options(transport));
    upload.pushScreen(bytes(40));
    const res = await upload.finish();
    expect(res.url).toBe("https://captureflow.dev/r/abc12345");
  });

  it("rethrows the finalize failure when the recording is not ready", async () => {
    const transport = fakeTransport({
      overrides: {
        finalizeScreen: async () => {
          throw new TypeError("fetch failed");
        },
      },
    });
    const upload = await startRecordingUpload(INIT, options(transport));
    upload.pushScreen(bytes(40));
    await expect(upload.finish()).rejects.toThrow("fetch failed");
  });
});

describe("resumeRecordingUpload", () => {
  const PENDING: PendingUpload = {
    slug: "abc12345",
    deviceId: "dev",
    init: INIT,
    hasWebcam: false,
  };

  // A recording that "crashed": its bytes reached this device, nothing finished.
  async function crashed(device: ReturnType<typeof deviceFiles>) {
    const upload = await startRecordingUpload(
      INIT,
      options(
        fakeTransport({
          overrides: {
            uploadScreenPart: async () => new Promise(() => {}),
          },
        }),
        { openFiles: device.openFiles },
      ),
    );
    upload.pushScreen(bytes(250));
    await tick();
  }

  it("finishes the same recording from this device's copy", async () => {
    const device = deviceFiles();
    await crashed(device);
    const transport = fakeTransport();

    const res = await resumeRecordingUpload(
      PENDING,
      options(transport, { openFiles: device.openFiles }),
    );

    expect(res.url).toContain("abc12345");
    expect(byPart(transport.screenParts).map((p) => p.size)).toEqual([
      100, 100, 50,
    ]);
    expect(transport.finalizedScreen?.sizeBytes).toBe(250);
    expect(device.store.has("abc12345")).toBe(false);
  });

  it("uploads as a new recording when the server already gave up", async () => {
    const device = deviceFiles();
    await crashed(device);
    const transport = fakeTransport({
      overrides: {
        state: async () => ({ state: "failed" }),
        init: async () => ({
          slug: "new54321",
          uploadId: "u",
          storageKey: "videos/new54321.mp4",
        }),
      },
    });

    const res = await resumeRecordingUpload(
      PENDING,
      options(transport, { openFiles: device.openFiles }),
    );

    expect(res.url).toContain("new54321");
    expect(transport.finalizedScreen?.slug).toBe("new54321");
    expect(transport.abortedSlugs).toEqual(["abc12345"]);
  });

  it("only clears the copy when the finalize had already landed", async () => {
    const device = deviceFiles();
    await crashed(device);
    const transport = fakeTransport({
      overrides: { state: async () => ({ state: "ready" }) },
    });

    await resumeRecordingUpload(
      PENDING,
      options(transport, { openFiles: device.openFiles }),
    );

    expect(transport.screenParts).toEqual([]);
    expect(device.store.has("abc12345")).toBe(false);
  });
});
