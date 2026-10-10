import type {
  FinalizeResponse,
  InitRequest,
  PartResponse,
  UploadTransport,
} from "./types";

// R2 multipart minimum part size (except the trailing part). All non-trailing
// parts must be the same length, so we drain in fixed CHUNK_BYTES slices.
export const CHUNK_BYTES = 5 * 1024 * 1024;

/*
 * Concurrent part uploads per stream. Sequential parts cap throughput at
 * chunk-size ÷ round-trip, which falls below the recorder's production rate
 * and turns the post-stop flush into minutes on long captures.
 */
const MAX_INFLIGHT_PARTS = 4;

type PartRef = { partNumber: number; etag: string };
type PartUploader = (
  partNumber: number,
  bytes: Uint8Array,
) => Promise<PartResponse>;

type PartStream = {
  readonly totalBytes: number;
  readonly uploadedBytes: number;
  push(bytes: Uint8Array): void;
  drain(): Promise<PartRef[]>;
  abort(): void;
};

export type OnlineSignal = {
  isOnline(): boolean;
  onOnline(cb: () => void): () => void;
};

// Offscreen documents get the standard connectivity events.
function defaultOnlineSignal(): OnlineSignal {
  return {
    isOnline: () =>
      typeof navigator === "undefined" || navigator.onLine !== false,
    onOnline: (cb) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("online", cb);
      return () => window.removeEventListener("online", cb);
    },
  };
}

/*
 * One multipart stream, up to MAX_INFLIGHT_PARTS requests in flight. Fail-fast:
 * a failed part rejects drain(). Queued parts wait out an offline window
 * instead of failing — only a request that dies mid-flight is fatal (desktop
 * parity).
 */
function createPartStream(
  uploadPart: PartUploader,
  chunkBytes: number,
  online: OnlineSignal,
): PartStream {
  let partNumber = 1;
  const etags: PartRef[] = [];
  let buf: Uint8Array[] = [];
  let bufBytes = 0;
  let totalBytes = 0;
  let uploadedBytes = 0;
  const inFlight = new Set<Promise<void>>();
  let aborted = false;
  // Once draining, pushes are ignored so a late chunk can't race the pump.
  let draining = false;
  let failure: unknown = null;
  let unsubOnline: (() => void) | null = null;

  function pumpWhenOnline(): void {
    if (unsubOnline) return;
    unsubOnline = online.onOnline(() => {
      unsubOnline?.();
      unsubOnline = null;
      pump();
    });
  }

  function waitOnline(): Promise<void> {
    if (online.isOnline()) return Promise.resolve();
    return new Promise((resolve) => {
      const unsub = online.onOnline(() => {
        unsub();
        resolve();
      });
    });
  }

  function takePart(maxBytes: number): Uint8Array {
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

  function launch(bytes: Uint8Array): void {
    const n = partNumber++;
    const task: Promise<void> = (async () => {
      try {
        const res = await uploadPart(n, bytes);
        etags.push({ partNumber: res.partNumber, etag: res.etag });
        uploadedBytes += bytes.byteLength;
      } catch (err) {
        failure ??= err;
      }
    })().finally(() => {
      inFlight.delete(task);
      pump();
    });
    inFlight.add(task);
  }

  function pump(): void {
    if (aborted || failure) return;
    if (!online.isOnline()) {
      if (bufBytes >= chunkBytes || (draining && bufBytes > 0)) {
        pumpWhenOnline();
      }
      return;
    }
    while (inFlight.size < MAX_INFLIGHT_PARTS && bufBytes >= chunkBytes) {
      launch(takePart(chunkBytes));
    }
    // The sub-chunk tail is the final part, which only exists once draining
    // guarantees no more pushes.
    if (draining && bufBytes > 0 && bufBytes < chunkBytes) {
      if (inFlight.size < MAX_INFLIGHT_PARTS) launch(takePart(bufBytes));
    }
  }

  return {
    get totalBytes() {
      return totalBytes;
    },
    get uploadedBytes() {
      return uploadedBytes;
    },
    push(bytes: Uint8Array): void {
      if (aborted || draining || failure) return;
      if (bytes.byteLength === 0) return;
      buf.push(bytes);
      bufBytes += bytes.byteLength;
      totalBytes += bytes.byteLength;
      pump();
    },
    async drain(): Promise<PartRef[]> {
      draining = true;
      pump();
      for (;;) {
        if (inFlight.size > 0) {
          // Settled tasks re-pump before resolving, so the pool stays full.
          await Promise.race(inFlight);
          continue;
        }
        if (failure || aborted || bufBytes === 0) break;
        await waitOnline();
        pump();
      }
      if (failure) throw failure;
      // Parts finish out of order; R2's complete wants them ascending.
      return [...etags].sort((a, b) => a.partNumber - b.partNumber);
    },
    abort(): void {
      aborted = true;
      buf = [];
      bufBytes = 0;
      unsubOnline?.();
      unsubOnline = null;
    },
  };
}

export type RecordingUploadOptions = {
  transport: UploadTransport;
  chunkBytes?: number;
  online?: OnlineSignal;
};

export type RecordingUpload = {
  readonly slug: string;
  readonly hasWebcam: boolean;
  readonly screenBytes: number;
  readonly webcamBytes: number;
  readonly uploadedBytes: number;
  // Bytes this recording may still add before it fills the account's storage,
  // or null when the deployment reported no cap.
  readonly remainingBytes: number | null;
  pushScreen(bytes: Uint8Array): void;
  pushWebcam(bytes: Uint8Array): void;
  uploadPoster(bytes: Uint8Array): Promise<void>;
  // durationMs rides finalize because /init runs before the recording exists.
  finish(durationMs?: number): Promise<FinalizeResponse>;
  abort(): void;
};

/*
 * Open a (dual) multipart recording upload. The webcam stream is created only when
 * /init reserved one. The caller owns the lifecycle.
 */
export async function startRecordingUpload(
  init: InitRequest,
  options: RecordingUploadOptions,
): Promise<RecordingUpload> {
  const { transport, chunkBytes = CHUNK_BYTES } = options;
  const online = options.online ?? defaultOnlineSignal();
  const res = await transport.init(init);
  const slug = res.slug;

  const screen = createPartStream(
    (n, bytes) => transport.uploadScreenPart(slug, n, bytes),
    chunkBytes,
    online,
  );
  const webcam = res.webcamUploadId
    ? createPartStream(
        (n, bytes) => transport.uploadWebcamPart(slug, n, bytes),
        chunkBytes,
        online,
      )
    : null;
  let aborted = false;

  return {
    slug,
    hasWebcam: webcam !== null,
    remainingBytes: res.remainingBytes ?? null,
    get screenBytes() {
      return screen.totalBytes;
    },
    get webcamBytes() {
      return webcam?.totalBytes ?? 0;
    },
    get uploadedBytes() {
      return screen.uploadedBytes + (webcam?.uploadedBytes ?? 0);
    },
    pushScreen: (bytes) => screen.push(bytes),
    pushWebcam: (bytes) => webcam?.push(bytes),
    uploadPoster: (bytes) => transport.uploadPoster(slug, bytes),
    async finish(durationMs?: number): Promise<FinalizeResponse> {
      const screenParts = await screen.drain();
      if (screenParts.length === 0) throw new Error("No screen parts uploaded");
      let result: FinalizeResponse;
      try {
        result = await transport.finalizeScreen({
          slug,
          parts: screenParts,
          sizeBytes: screen.totalBytes,
          ...(durationMs && durationMs > 0 ? { durationMs } : {}),
        });
      } catch (err) {
        // A finalize lost to the network may still have been applied — the
        // no-auth state probe disambiguates (finalize is idempotent).
        const probe = await transport.state(slug).catch(() => null);
        if (probe?.state !== "ready") throw err;
        result = { url: transport.viewUrl(slug) };
      }
      if (webcam) {
        try {
          const webcamParts = await webcam.drain();
          if (webcamParts.length > 0) {
            await transport.finalizeWebcam({
              slug,
              parts: webcamParts,
              sizeBytes: webcam.totalBytes,
            });
          }
        } catch {
          /* best-effort: leave the webcam pending; the viewer plays screen-only */
        }
      }
      return result;
    },
    abort(): void {
      screen.abort();
      webcam?.abort();
      if (aborted) return;
      aborted = true;
      // Release the server-side multipart + pending row; best-effort.
      void transport.abort({ slug }).catch(() => {});
    },
  };
}
