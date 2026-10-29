import { describe, expect, it } from "vitest";
import {
  createPartUploader,
  UploadStalledError,
  type OnlineSignal,
  type PartRef,
} from "./part-uploader";

const P = 10;

function growingFile() {
  let bytes = new Uint8Array(0);
  return {
    get size() {
      return bytes.byteLength;
    },
    async read(offset: number, length: number) {
      return bytes.slice(offset, offset + length);
    },
    grow(n: number) {
      const next = new Uint8Array(bytes.byteLength + n);
      next.set(bytes);
      for (let i = bytes.byteLength; i < next.byteLength; i++)
        next[i] = i % 256;
      bytes = next;
    },
    patch(offset: number, value: number) {
      bytes[offset] = value;
    },
    truncate(size: number) {
      bytes = bytes.slice(0, size);
    },
  };
}

function recorder(failures: Record<number, number> = {}) {
  const calls: { n: number; bytes: Uint8Array }[] = [];
  return {
    calls,
    uploadPart: async (n: number, bytes: Uint8Array): Promise<PartRef> => {
      calls.push({ n, bytes });
      if ((failures[n] ?? 0) > 0) {
        failures[n]!--;
        throw new Error(`part ${n} failed`);
      }
      return { partNumber: n, etag: `e${n}` };
    },
  };
}

const noWait = async () => {};
const tick = () => new Promise((r) => setTimeout(r, 0));

describe("createPartUploader", () => {
  it("uploads whole parts while recording and part 1 last", async () => {
    const file = growingFile();
    const api = recorder();
    const up = createPartUploader({
      file,
      uploadPart: api.uploadPart,
      partBytes: P,
      wait: noWait,
    });
    file.grow(25);
    up.notify();
    await tick();
    expect(api.calls.map((c) => c.n)).toEqual([2]);

    file.patch(0, 99);
    const parts = await up.finish();
    expect(api.calls.map((c) => c.n)).toEqual([2, 3, 1]);
    expect(parts.map((p) => p.partNumber)).toEqual([1, 2, 3]);
    expect(api.calls.find((c) => c.n === 1)!.bytes[0]).toBe(99);
    expect(api.calls.find((c) => c.n === 3)!.bytes.byteLength).toBe(5);
  });

  it("sends a short recording as a single part", async () => {
    const file = growingFile();
    const api = recorder();
    const up = createPartUploader({
      file,
      uploadPart: api.uploadPart,
      partBytes: P,
      wait: noWait,
    });
    file.grow(7);
    up.notify();
    const parts = await up.finish();
    expect(parts).toEqual([{ partNumber: 1, etag: "e1" }]);
  });

  it("retries a failing part instead of losing it", async () => {
    const file = growingFile();
    const api = recorder({ 2: 3 });
    const up = createPartUploader({
      file,
      uploadPart: api.uploadPart,
      partBytes: P,
      wait: noWait,
    });
    file.grow(30);
    up.notify();
    const parts = await up.finish();
    expect(parts.map((p) => p.partNumber)).toEqual([1, 2, 3]);
    expect(api.calls.filter((c) => c.n === 2)).toHaveLength(4);
  });

  it("gives up after the recording stops when a part keeps failing", async () => {
    const file = growingFile();
    const api = recorder({ 3: 100 });
    const up = createPartUploader({
      file,
      uploadPart: api.uploadPart,
      partBytes: P,
      wait: noWait,
      finishAttempts: 3,
    });
    file.grow(30);
    await expect(up.finish()).rejects.toBeInstanceOf(UploadStalledError);
  });

  it("waits for the connection before sending", async () => {
    let isOnline = false;
    const listeners = new Set<() => void>();
    const online: OnlineSignal = {
      isOnline: () => isOnline,
      onOnline: (cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
      },
    };
    const file = growingFile();
    const api = recorder();
    const up = createPartUploader({
      file,
      uploadPart: api.uploadPart,
      partBytes: P,
      wait: noWait,
      online,
    });
    file.grow(25);
    up.notify();
    await tick();
    expect(api.calls).toHaveLength(0);
    const finished = up.finish();
    isOnline = true;
    for (const cb of [...listeners]) cb();
    expect((await finished).map((p) => p.partNumber)).toEqual([1, 2, 3]);
  });

  it("re-sends a part a truncation cut into", async () => {
    const file = growingFile();
    const api = recorder();
    const up = createPartUploader({
      file,
      uploadPart: api.uploadPart,
      partBytes: P,
      wait: noWait,
    });
    file.grow(30);
    up.notify();
    await tick();
    expect(api.calls.map((c) => c.n)).toEqual([2, 3]);
    file.truncate(27);
    const parts = await up.finish();
    expect(parts.map((p) => p.partNumber)).toEqual([1, 2, 3]);
    expect(api.calls.filter((c) => c.n === 3).at(-1)!.bytes.byteLength).toBe(7);
  });
});
