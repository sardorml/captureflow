import type { FinalizeResponse, InitRequest, UploadTransport } from "./types";

// R2 multipart minimum part size (except the trailing part). All non-trailing
// parts must share one length, so we drain in fixed CHUNK_BYTES slices.
export const CHUNK_BYTES = 5 * 1024 * 1024;

type PartRef = { partNumber: number; etag: string };

export type ShareUploadOptions = {
  transport: UploadTransport;
  chunkBytes?: number;
};

export type ShareUpload = {
  readonly slug: string;
  readonly totalBytes: number;
  push(bytes: Uint8Array): void;
  finish(sizeBytes?: number): Promise<FinalizeResponse>;
  abort(): void;
};

/*
 * Open a multipart share upload and return a handle that streams recorder
 * chunks to it. `push` buffers and drains full parts in the background (one
 * request in flight); `finish` flushes the tail and finalizes. Fail-fast: a
 * dropped part rejects `finish` with no retry. The caller owns the lifecycle.
 */
export async function startShareUpload(
  init: InitRequest,
  options: ShareUploadOptions,
): Promise<ShareUpload> {
  const { transport, chunkBytes = CHUNK_BYTES } = options;
  const { slug } = await transport.init(init);

  let partNumber = 1;
  const etags: PartRef[] = [];
  let buf: Uint8Array[] = [];
  let bufBytes = 0;
  let totalBytes = 0;
  let inFlight: Promise<void> | null = null;
  let aborted = false;
  // Set once finish() starts claiming part numbers, so a late push can't race
  // the pump for the same number.
  let finishing = false;
  let failure: unknown = null;

  function drainPart(maxBytes: number): Uint8Array {
    const target = Math.min(bufBytes, maxBytes);
    const out = new Uint8Array(target);
    let written = 0;
    while (written < target && buf.length > 0) {
      const head = buf[0];
      if (head === undefined) break;
      const remaining = target - written;
      if (head.byteLength <= remaining) {
        out.set(head, written);
        written += head.byteLength;
        buf.shift();
        bufBytes -= head.byteLength;
      } else {
        out.set(head.subarray(0, remaining), written);
        buf[0] = head.subarray(remaining);
        bufBytes -= remaining;
        written += remaining;
      }
    }
    return out;
  }

  function pump(): void {
    if (aborted || finishing || failure) return;
    if (inFlight) return;
    if (bufBytes < chunkBytes) return;
    const bytes = drainPart(chunkBytes);
    const n = partNumber++;
    inFlight = (async () => {
      try {
        const res = await transport.uploadPart(slug, n, bytes);
        etags.push({ partNumber: res.partNumber, etag: res.etag });
      } catch (err) {
        // Fail-fast: no per-part retry — abort the share on a dropped part.
        failure = err;
      } finally {
        inFlight = null;
        if (!failure && !finishing && bufBytes >= chunkBytes) pump();
      }
    })();
  }

  async function flushTail(): Promise<void> {
    if (inFlight) {
      try {
        await inFlight;
      } catch {
        /* recorded in `failure` by pump */
      }
    }
    if (failure) throw failure;

    // R2 rejects a non-trailing part that isn't CHUNK_BYTES, so split a tail
    // larger than one chunk into full parts plus one smaller trailing part.
    while (bufBytes > chunkBytes) {
      const res = await transport.uploadPart(
        slug,
        partNumber++,
        drainPart(chunkBytes),
      );
      etags.push({ partNumber: res.partNumber, etag: res.etag });
    }
    if (bufBytes > 0) {
      const res = await transport.uploadPart(
        slug,
        partNumber++,
        drainPart(bufBytes),
      );
      etags.push({ partNumber: res.partNumber, etag: res.etag });
    }
  }

  return {
    get slug() {
      return slug;
    },
    get totalBytes() {
      return totalBytes;
    },
    push(bytes: Uint8Array): void {
      if (aborted || finishing || failure) return;
      if (bytes.byteLength === 0) return;
      buf.push(bytes);
      bufBytes += bytes.byteLength;
      totalBytes += bytes.byteLength;
      pump();
    },
    async finish(sizeBytes?: number): Promise<FinalizeResponse> {
      if (aborted) throw new Error("Upload was aborted");
      finishing = true;
      await flushTail();
      if (etags.length === 0) throw new Error("No parts uploaded");
      return transport.finalize({
        slug,
        parts: etags,
        sizeBytes: sizeBytes && sizeBytes > 0 ? sizeBytes : totalBytes,
      });
    },
    abort(): void {
      aborted = true;
      buf = [];
      bufBytes = 0;
    },
  };
}
