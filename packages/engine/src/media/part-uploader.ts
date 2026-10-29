import type { ByteReader } from "./bytes";

// R2's minimum part size. Every part but the last must be exactly this long.
export const PART_BYTES = 5 * 1024 * 1024;

export type PartRef = { partNumber: number; etag: string };

export type OnlineSignal = {
  isOnline(): boolean;
  onOnline(cb: () => void): () => void;
};

export type PartUploaderOptions = {
  file: ByteReader;
  uploadPart(partNumber: number, bytes: Uint8Array): Promise<PartRef>;
  partBytes?: number;
  concurrency?: number;
  online?: OnlineSignal;
  // A part that keeps failing after the recording stopped gives up after this many tries.
  finishAttempts?: number;
  wait?: (ms: number) => Promise<void>;
};

export type PartUploader = {
  readonly uploadedBytes: number;
  // The file grew; upload any part that is now whole.
  notify(): void;
  // Uploads what is left, part 1 last, and resolves with every part in order.
  finish(): Promise<PartRef[]>;
  abort(): void;
};

export class UploadStalledError extends Error {
  constructor(readonly cause: unknown) {
    super(
      "The upload couldn't finish. Your recording is saved on this device and finishes uploading once you're back online.",
    );
  }
}

const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30_000;

const alwaysOnline: OnlineSignal = {
  isOnline: () => true,
  onOnline: () => () => {},
};

/*
 * Uploads a growing recording file in fixed slices: part n is bytes
 * [(n-1)·P, n·P). Part 1 waits for finish() because the seek index is written
 * into it last. A failing part retries with backoff for as long as the
 * recording runs (the bytes are safe on disk) and waits out offline spells.
 */
export function createPartUploader(options: PartUploaderOptions): PartUploader {
  const {
    file,
    uploadPart,
    partBytes = PART_BYTES,
    concurrency = 4,
    online = alwaysOnline,
    finishAttempts = 8,
    wait = (ms) => new Promise((r) => setTimeout(r, ms)),
  } = options;

  const done = new Map<number, PartRef>();
  const running = new Map<number, Promise<void>>();
  let nextLivePart = 2;
  let finishing = false;
  let aborted = false;
  let uploadedBytes = 0;
  let stalled: unknown = null;

  function partRange(n: number): [number, number] {
    const start = (n - 1) * partBytes;
    return [start, Math.min(start + partBytes, file.size)];
  }

  function waitOnline(): Promise<void> {
    if (online.isOnline()) return Promise.resolve();
    return new Promise((resolve) => {
      const off = online.onOnline(() => {
        off();
        resolve();
      });
    });
  }

  async function send(n: number): Promise<void> {
    for (let attempt = 1; ; attempt++) {
      if (aborted) return;
      await waitOnline();
      const [start, end] = partRange(n);
      try {
        const bytes = await file.read(start, end - start);
        const ref = await uploadPart(n, bytes);
        done.set(n, ref);
        uploadedBytes += bytes.byteLength;
        return;
      } catch (err) {
        if (finishing && attempt >= finishAttempts) throw err;
        await wait(Math.min(RETRY_BASE_MS * 2 ** (attempt - 1), RETRY_MAX_MS));
      }
    }
  }

  function start(n: number): void {
    const task = send(n)
      .catch((err: unknown) => {
        stalled ??= err;
      })
      .finally(() => {
        running.delete(n);
        pump();
      });
    running.set(n, task);
  }

  function pump(): void {
    if (aborted || finishing) return;
    while (
      running.size < concurrency &&
      nextLivePart * partBytes <= file.size
    ) {
      start(nextLivePart++);
    }
  }

  return {
    get uploadedBytes() {
      return uploadedBytes;
    },
    notify: pump,
    async finish() {
      finishing = true;
      await Promise.all(running.values());
      const last = Math.max(1, Math.ceil(file.size / partBytes));
      // A finish that cut the file back invalidates parts that ran past it.
      for (const n of [...done.keys()]) {
        if (n * partBytes > file.size) done.delete(n);
      }
      const pending: number[] = [];
      for (let n = 2; n <= last; n++) {
        if (!done.has(n) && !running.has(n)) pending.push(n);
      }
      // Earlier failures are retried here with a bounded budget.
      stalled = null;
      while (pending.length > 0 || running.size > 0) {
        while (pending.length > 0 && running.size < concurrency) {
          start(pending.shift()!);
        }
        await Promise.race(running.values());
      }
      if (!aborted && !done.has(1) && file.size > 0) start(1);
      await Promise.all(running.values());
      if (aborted) throw new Error("Upload aborted");
      const missing = Array.from({ length: last }, (_, i) => i + 1).filter(
        (n) => !done.has(n),
      );
      if (stalled || missing.length > 0) throw new UploadStalledError(stalled);
      return [...done.values()].sort((a, b) => a.partNumber - b.partNumber);
    },
    abort() {
      aborted = true;
    },
  };
}
