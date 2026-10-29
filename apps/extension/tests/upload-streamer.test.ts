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
import { RecordingApiHttpError } from "../lib/api/client";
import type {
  SegmentFinalizeRequest,
  InitRequest,
  RecordingStream,
  UploadTransport,
} from "../lib/api/types";

const INIT: InitRequest = { contentType: "video/mp4", source: "instant" };

type SegmentCall = { stream: RecordingStream; offset: number; size: number };

type FakeTransport = UploadTransport & {
  segments: SegmentCall[];
  received(stream: RecordingStream): number;
  finalizedScreen: SegmentFinalizeRequest | null;
  finalizedWebcam: SegmentFinalizeRequest | null;
  abortedSlugs: string[];
};

function fakeTransport(
  opts: { webcam?: boolean; overrides?: Partial<UploadTransport> } = {},
): FakeTransport {
  const segments: SegmentCall[] = [];
  let finalizedScreen: SegmentFinalizeRequest | null = null;
  let finalizedWebcam: SegmentFinalizeRequest | null = null;
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
    uploadSegment: async (_slug, stream, offset, bytes) => {
      segments.push({ stream, offset, size: bytes.byteLength });
    },
    finalizeScreen: async (req) => {
      finalizedScreen = req;
      return { url: `https://captureflow.dev/s/${req.slug}` };
    },
    finalizeWebcam: async (req) => {
      finalizedWebcam = req;
    },
    uploadPoster: async () => {},
    uploadPosterCard: async () => {},
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
    segments,
    // Bytes from 0 the server holds without a gap.
    received(stream) {
      let end = 0;
      for (const s of segments
        .filter((c) => c.stream === stream)
        .sort((a, b) => a.offset - b.offset)) {
        if (s.offset <= end) end = Math.max(end, s.offset + s.size);
      }
      return end;
    },
    get finalizedScreen() {
      return finalizedScreen;
    },
    get finalizedWebcam() {
      return finalizedWebcam;
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

// Not MP4 or WebM, so no index header: segments start at byte 0.
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

// The segment interval, fired by hand.
function clock() {
  const ticks = new Set<() => void>();
  return {
    every: (_ms: number, cb: () => void) => {
      ticks.add(cb);
      return () => ticks.delete(cb);
    },
    tick: () => {
      for (const cb of ticks) cb();
    },
  };
}

function options(
  transport: UploadTransport,
  extra: Partial<RecordingUploadOptions> = {},
): RecordingUploadOptions {
  return {
    transport,
    openFiles: deviceFiles().openFiles,
    retryWait: () => new Promise((r) => setTimeout(r, 0)),
    every: clock().every,
    ...extra,
  };
}

const tick = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 5));

describe("startRecordingUpload — screen stream", () => {
  it("sends what the file gained at each interval while recording", async () => {
    const transport = fakeTransport();
    const time = clock();
    const upload = await startRecordingUpload(
      INIT,
      options(transport, { every: time.every }),
    );

    upload.pushScreen(bytes(50));
    await tick();
    expect(transport.segments).toHaveLength(0);
    time.tick();
    await tick();
    upload.pushScreen(bytes(30));
    await tick();
    time.tick();
    await tick();

    expect(transport.segments).toEqual([
      { stream: "screen", offset: 0, size: 50 },
      { stream: "screen", offset: 50, size: 30 },
    ]);
  });

  it("sends the rest at stop and finalizes from segments", async () => {
    const transport = fakeTransport();
    const upload = await startRecordingUpload(INIT, options(transport));

    upload.pushScreen(bytes(50));
    upload.pushScreen(bytes(30));
    const res = await upload.finish();

    expect(transport.received("screen")).toBe(80);
    expect(transport.finalizedScreen).toEqual({
      slug: "abc12345",
      segments: true,
      sizeBytes: 80,
    });
    expect(res.url).toContain("abc12345");
  });

  it("cuts a long stretch into bounded segments", async () => {
    const transport = fakeTransport();
    const upload = await startRecordingUpload(
      INIT,
      options(transport, { maxSegmentBytes: 100 }),
    );
    upload.pushScreen(bytes(250));
    await upload.finish();
    expect(transport.segments.map((s) => s.size)).toEqual([100, 100, 50]);
  });

  it("retries a segment that fails instead of losing the recording", async () => {
    let failures = 2;
    const sent: SegmentCall[] = [];
    const transport = fakeTransport({
      overrides: {
        uploadSegment: async (_slug, stream, offset, b) => {
          if (failures-- > 0) throw new Error("network down");
          sent.push({ stream, offset, size: b.byteLength });
        },
      },
    });
    const upload = await startRecordingUpload(INIT, options(transport));

    upload.pushScreen(bytes(250));
    await upload.finish();

    expect(sent).toEqual([{ stream: "screen", offset: 0, size: 250 }]);
    expect(transport.finalizedScreen?.sizeBytes).toBe(250);
  });

  it("keeps the files and reports a stall when segments never land", async () => {
    const transport = fakeTransport({
      overrides: {
        uploadSegment: async () => {
          throw new Error("network down");
        },
      },
    });
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

  it("counts uploadedBytes as segments land, not as they are queued", async () => {
    const gate: (() => void)[] = [];
    const transport = fakeTransport({
      overrides: {
        uploadSegment: () => new Promise<void>((r) => gate.push(r)),
      },
    });
    const time = clock();
    const upload = await startRecordingUpload(
      INIT,
      options(transport, { every: time.every }),
    );

    upload.pushScreen(bytes(200));
    await tick();
    time.tick();
    await tick();
    expect(upload.uploadedBytes).toBe(0);
    gate.shift()?.();
    await tick();
    expect(upload.uploadedBytes).toBe(200);
  });

  it("finalizes only after the work it was handed", async () => {
    const order: string[] = [];
    const transport = fakeTransport({
      overrides: {
        finalizeScreen: async (req) => {
          order.push("finalize");
          return { url: req.slug };
        },
      },
    });
    const upload = await startRecordingUpload(INIT, options(transport));
    upload.pushScreen(bytes(40));
    const transcript = new Promise<void>((r) =>
      setTimeout(() => {
        order.push("transcript");
        r();
      }, 20),
    );
    await upload.finish(undefined, transcript);
    expect(order).toEqual(["transcript", "finalize"]);
  });
});

/*
 * Storage is the only ceiling on a recording, so the budget /init reports is
 * what the recorder stops on. Surfacing it verbatim — including its absence —
 * is this layer's whole job in that decision.
 */
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
    const upload = await startRecordingUpload(INIT, options(transport));

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

    expect(transport.received("webcam")).toBe(0);
    expect(transport.finalizedWebcam).toBeNull();
  });

  it("uploads and finalizes both streams when a webcam was reserved", async () => {
    const transport = fakeTransport({ webcam: true });
    const upload = await startRecordingUpload(INIT, options(transport));
    expect(upload.hasWebcam).toBe(true);

    upload.pushScreen(bytes(120));
    upload.pushWebcam(bytes(60));
    await upload.finish();

    expect(transport.received("screen")).toBe(120);
    expect(transport.received("webcam")).toBe(60);
    expect(transport.finalizedWebcam).toEqual({
      slug: "abc12345",
      segments: true,
      sizeBytes: 60,
    });
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
  it("holds segments while offline and sends them on the online signal", async () => {
    const transport = fakeTransport();
    const net = fakeOnline(false);
    const time = clock();
    const upload = await startRecordingUpload(
      INIT,
      options(transport, { online: net.signal, every: time.every }),
    );

    upload.pushScreen(bytes(250));
    await tick();
    time.tick();
    await tick();
    expect(transport.segments).toHaveLength(0);

    net.set(true);
    await tick();
    expect(transport.received("screen")).toBe(250);
    await upload.finish();
    expect(transport.finalizedScreen?.sizeBytes).toBe(250);
  });

  it("waits for connectivity before sending the rest", async () => {
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
    expect(transport.segments).toHaveLength(0);

    net.set(true);
    await finishing;
    expect(transport.received("screen")).toBe(40);
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

  it("retries a lost finalize, then keeps the files for later", async () => {
    const finalizeScreen = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const device = deviceFiles();
    const transport = fakeTransport({ overrides: { finalizeScreen } });
    const upload = await startRecordingUpload(
      INIT,
      options(transport, { openFiles: device.openFiles }),
    );
    upload.pushScreen(bytes(40));
    await expect(upload.finish()).rejects.toBeInstanceOf(UploadStalledError);
    expect(finalizeScreen.mock.calls.length).toBeGreaterThan(1);
    expect(device.store.has("abc12345")).toBe(true);
  });

  it("gives up at once when the server refuses the recording", async () => {
    const finalizeScreen = vi.fn(async () => {
      throw new RecordingApiHttpError("over cap", 413, "storage_limit");
    });
    const transport = fakeTransport({ overrides: { finalizeScreen } });
    const upload = await startRecordingUpload(INIT, options(transport));
    upload.pushScreen(bytes(40));
    await expect(upload.finish()).rejects.toThrow("over cap");
    expect(finalizeScreen).toHaveBeenCalledTimes(1);
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
          overrides: { uploadSegment: async () => new Promise(() => {}) },
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
    expect(transport.received("screen")).toBe(250);
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

    expect(transport.segments).toEqual([]);
    expect(device.store.has("abc12345")).toBe(false);
  });
});
