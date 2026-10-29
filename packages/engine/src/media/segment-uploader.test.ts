import { describe, expect, it } from "vitest";
import type { RecordingFile } from "./recording-file";
import {
  createSegmentUploader,
  UploadStalledError,
  type OnlineSignal,
  type SegmentUploaderOptions,
} from "./segment-uploader";

function memoryFile(): RecordingFile & { bytes(): Uint8Array } {
  let bytes = new Uint8Array(0);
  return {
    get size() {
      return bytes.byteLength;
    },
    bytes: () => bytes,
    async read(offset, length) {
      return bytes.slice(offset, offset + length);
    },
    async append(chunk) {
      const next = new Uint8Array(bytes.byteLength + chunk.byteLength);
      next.set(bytes);
      next.set(chunk, bytes.byteLength);
      bytes = next;
    },
    async write(offset, chunk) {
      bytes.set(chunk, offset);
    },
    async truncate(size) {
      bytes = bytes.slice(0, size);
    },
  };
}

function fill(n: number, from = 0): Uint8Array {
  return Uint8Array.from({ length: n }, (_, i) => (from + i) & 0xff);
}

// What the server ends up with, rebuilt from every segment it accepted.
function server() {
  const segments = new Map<number, Uint8Array>();
  const calls: { offset: number; size: number }[] = [];
  return {
    calls,
    upload: async (offset: number, bytes: Uint8Array, signal: AbortSignal) => {
      expect(signal.aborted).toBe(false);
      calls.push({ offset, size: bytes.byteLength });
      segments.set(offset, bytes.slice());
    },
    file(size: number): Uint8Array {
      const out = new Uint8Array(size);
      for (const [offset, bytes] of [...segments].sort((a, b) => a[0] - b[0])) {
        out.set(bytes.subarray(0, Math.max(0, size - offset)), offset);
      }
      return out;
    },
  };
}

function clock() {
  let tick: () => void = () => {};
  return {
    every: (_ms: number, cb: () => void) => {
      tick = cb;
      return () => {
        tick = () => {};
      };
    },
    tick: () => tick(),
  };
}

const settle = () => new Promise((r) => setTimeout(r, 20));

function uploader(
  file: RecordingFile,
  upload: SegmentUploaderOptions["uploadSegment"],
  extra: Partial<SegmentUploaderOptions> = {},
) {
  const time = clock();
  let header: number | null = 100;
  const u = createSegmentUploader({
    file,
    uploadSegment: upload,
    headerBytes: () => header,
    wait: () => new Promise((r) => setTimeout(r, 0)),
    every: time.every,
    ...extra,
  });
  return { u, tick: time.tick, setHeader: (h: number | null) => (header = h) };
}

describe("createSegmentUploader", () => {
  it("sends the header, then what the file gained each tick", async () => {
    const file = memoryFile();
    const s = server();
    const { u, tick } = uploader(file, s.upload);
    await file.append(fill(150));
    tick();
    await settle();
    await file.append(fill(80, 150));
    tick();
    await settle();
    expect(s.calls).toEqual([
      { offset: 0, size: 100 },
      { offset: 100, size: 50 },
      { offset: 150, size: 80 },
    ]);
    expect(u.uploadedBytes).toBe(230);
  });

  it("holds everything until the header is known", async () => {
    const file = memoryFile();
    const s = server();
    const { tick, setHeader } = uploader(file, s.upload);
    setHeader(null);
    await file.append(fill(500));
    tick();
    await settle();
    expect(s.calls).toEqual([]);
    setHeader(64);
    tick();
    await settle();
    expect(s.calls.map((c) => c.offset)).toEqual([0, 64]);
  });

  it("cuts a full segment as soon as one is there", async () => {
    const file = memoryFile();
    const s = server();
    const { u } = uploader(file, s.upload, { maxSegmentBytes: 200 });
    await file.append(fill(550));
    u.notify();
    await settle();
    expect(s.calls).toEqual([
      { offset: 0, size: 100 },
      { offset: 100, size: 200 },
      { offset: 300, size: 200 },
    ]);
  });

  it("re-sends the header after the index is written into it", async () => {
    const file = memoryFile();
    const s = server();
    const { u, tick } = uploader(file, s.upload);
    await file.append(fill(300));
    tick();
    await settle();
    await file.write(10, new Uint8Array([9, 9, 9]));
    await file.append(fill(40, 300));
    await u.finish(100);
    expect(s.file(file.size)).toEqual(file.bytes());
    expect(s.calls.filter((c) => c.offset === 0)).toHaveLength(2);
  });

  it("finishes a recording that never got a live segment out", async () => {
    const file = memoryFile();
    const s = server();
    const { u, setHeader } = uploader(file, s.upload, { maxSegmentBytes: 64 });
    setHeader(null);
    await file.append(fill(250));
    await u.finish(40);
    expect(s.file(file.size)).toEqual(file.bytes());
  });

  it("stops at a file a crash cut back", async () => {
    const file = memoryFile();
    const s = server();
    const { u, tick } = uploader(file, s.upload);
    await file.append(fill(400));
    tick();
    await settle();
    await file.truncate(250);
    await u.finish(100);
    expect(s.file(250)).toEqual(file.bytes());
  });

  it("retries a failing segment until it lands", async () => {
    const file = memoryFile();
    const s = server();
    let failures = 3;
    const { u, tick } = uploader(file, async (offset, bytes, signal) => {
      if (offset === 100 && failures-- > 0) throw new Error("flaky");
      await s.upload(offset, bytes, signal);
    });
    await file.append(fill(200));
    tick();
    await u.finish(100);
    expect(s.file(200)).toEqual(file.bytes());
  });

  it("gives up after the finish budget and keeps the bytes for later", async () => {
    const file = memoryFile();
    const { u } = uploader(
      file,
      async () => {
        throw new Error("offline");
      },
      { finishAttempts: 3 },
    );
    await file.append(fill(200));
    await expect(u.finish(100)).rejects.toBeInstanceOf(UploadStalledError);
    expect(file.size).toBe(200);
  });

  it("waits out an offline spell", async () => {
    const file = memoryFile();
    const s = server();
    let isOnline = false;
    const waiting: (() => void)[] = [];
    const online: OnlineSignal = {
      isOnline: () => isOnline,
      onOnline: (cb) => {
        waiting.push(cb);
        return () => {};
      },
    };
    const { u, tick } = uploader(file, s.upload, { online });
    await file.append(fill(150));
    tick();
    await settle();
    expect(s.calls).toEqual([]);
    isOnline = true;
    for (const cb of waiting) cb();
    await u.finish(100);
    expect(s.file(150)).toEqual(file.bytes());
  });
});
