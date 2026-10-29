import type { ByteReader } from "./bytes";

export type OnlineSignal = {
  isOnline(): boolean;
  onOnline(cb: () => void): () => void;
};

export type SegmentUploaderOptions = {
  file: ByteReader;
  uploadSegment(
    offset: number,
    bytes: Uint8Array,
    signal: AbortSignal,
  ): Promise<void>;
  // Where the bytes the index rewrites end; null until known.
  headerBytes(): number | null;
  intervalMs?: number;
  maxSegmentBytes?: number;
  concurrency?: number;
  online?: OnlineSignal;
  // A segment that keeps failing after the recording stopped gives up after this many tries.
  finishAttempts?: number;
  wait?: (ms: number) => Promise<void>;
  every?: (ms: number, cb: () => void) => () => void;
};

export type SegmentUploader = {
  readonly uploadedBytes: number;
  // The file grew.
  notify(): void;
  /*
   * Sends what is left, then the header again: by now the index has been
   * written into it. Resolves once every byte of the file is on the server.
   */
  finish(headerBytes: number): Promise<void>;
  abort(): void;
};

export class UploadStalledError extends Error {
  constructor(readonly cause: unknown) {
    super(
      "The upload couldn't finish. Your recording is saved on this device and finishes uploading once you're back online.",
    );
  }
}

const INTERVAL_MS = 2000;
const MAX_SEGMENT_BYTES = 8 * 1024 * 1024;
const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30_000;
// A stalled request is retried after this rather than holding the upload
// until the network gives up.
const BASE_TIMEOUT_MS = 20_000;
const SLOWEST_BYTES_PER_MS = 32;

const alwaysOnline: OnlineSignal = {
  isOnline: () => true,
  onOnline: () => () => {},
};

function defaultEvery(ms: number, cb: () => void): () => void {
  const timer = setInterval(cb, ms);
  return () => clearInterval(timer);
}

type Segment = { offset: number; end: number };

/*
 * Uploads a growing recording file as small byte-addressed segments: every
 * interval, whatever the file gained goes up, so stopping leaves only the
 * last moments to send. The header (everything up to the index reserve) goes
 * first and once more at the end, after the index is written into it.
 * Failing segments retry with backoff for as long as the recording runs and
 * wait out offline spells; the bytes are safe in the file.
 */
export function createSegmentUploader(
  options: SegmentUploaderOptions,
): SegmentUploader {
  const {
    file,
    uploadSegment,
    intervalMs = INTERVAL_MS,
    maxSegmentBytes = MAX_SEGMENT_BYTES,
    concurrency = 2,
    online = alwaysOnline,
    finishAttempts = 8,
    wait = (ms) => new Promise((r) => setTimeout(r, ms)),
    every = defaultEvery,
  } = options;

  const queue: Segment[] = [];
  const running = new Set<Promise<void>>();
  const failed: Segment[] = [];
  let sent: number | null = null;
  let finishing = false;
  let aborted = false;
  let uploadedBytes = 0;
  let lastError: unknown = null;

  function waitOnline(): Promise<void> {
    if (online.isOnline()) return Promise.resolve();
    return new Promise((resolve) => {
      const off = online.onOnline(() => {
        off();
        resolve();
      });
    });
  }

  async function send(segment: Segment): Promise<void> {
    for (let attempt = 1; ; attempt++) {
      if (aborted) return;
      await waitOnline();
      const end = Math.min(segment.end, file.size);
      if (end <= segment.offset) return;
      try {
        const bytes = await file.read(segment.offset, end - segment.offset);
        const timeout =
          BASE_TIMEOUT_MS + Math.ceil(bytes.byteLength / SLOWEST_BYTES_PER_MS);
        await uploadSegment(
          segment.offset,
          bytes,
          AbortSignal.timeout(timeout),
        );
        uploadedBytes += bytes.byteLength;
        return;
      } catch (err) {
        if (finishing && attempt >= finishAttempts) throw err;
        await wait(Math.min(RETRY_BASE_MS * 2 ** (attempt - 1), RETRY_MAX_MS));
      }
    }
  }

  function drain(): void {
    while (!aborted && running.size < concurrency && queue.length > 0) {
      const segment = queue.shift()!;
      const task: Promise<void> = send(segment)
        .catch((err: unknown) => {
          lastError = err;
          failed.push(segment);
        })
        .finally(() => {
          running.delete(task);
          drain();
        });
      running.add(task);
    }
  }

  function cut(all: boolean): void {
    if (aborted || finishing) return;
    if (sent === null) {
      const header = options.headerBytes();
      if (header === null || file.size < header) return;
      sent = header;
      if (header > 0) queue.push({ offset: 0, end: header });
    }
    while (file.size - sent >= maxSegmentBytes) {
      queue.push({ offset: sent, end: sent + maxSegmentBytes });
      sent += maxSegmentBytes;
    }
    if (all && file.size > sent) {
      queue.push({ offset: sent, end: file.size });
      sent = file.size;
    }
    drain();
  }

  const stopTimer = every(intervalMs, () => cut(true));

  async function settle(): Promise<void> {
    while (running.size > 0) await Promise.all(running);
  }

  return {
    get uploadedBytes() {
      return uploadedBytes;
    },
    notify: () => cut(false),
    async finish(headerBytes) {
      stopTimer();
      finishing = true;
      await settle();
      if (aborted) throw new Error("Upload aborted");
      queue.push(...failed.splice(0));
      for (
        let at = sent ?? headerBytes;
        at < file.size;
        at += maxSegmentBytes
      ) {
        queue.push({
          offset: at,
          end: Math.min(at + maxSegmentBytes, file.size),
        });
      }
      sent = file.size;
      if (headerBytes > 0) queue.push({ offset: 0, end: headerBytes });
      lastError = null;
      drain();
      await settle();
      if (aborted) throw new Error("Upload aborted");
      if (failed.length > 0) throw new UploadStalledError(lastError);
    },
    abort() {
      aborted = true;
      stopTimer();
      queue.length = 0;
    },
  };
}
