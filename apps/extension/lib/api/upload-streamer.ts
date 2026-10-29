import {
  createIndexedRecording,
  createPartUploader,
  finishRecordingFile,
  UploadStalledError,
  type OnlineSignal,
  type PartRef,
  type RecordingFile,
} from "@captureflow/engine/media";
import type { FinalizeResponse, InitRequest, UploadTransport } from "./types";

export { UploadStalledError };
export type { OnlineSignal };

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

export type LocalFiles = {
  screen: RecordingFile;
  webcam: RecordingFile | null;
  remove(): Promise<void>;
};

export type RecordingUploadOptions = {
  transport: UploadTransport;
  openFiles(slug: string, hasWebcam: boolean): Promise<LocalFiles>;
  online?: OnlineSignal;
  partBytes?: number;
  retryWait?: (ms: number) => Promise<void>;
};

export type RecordingUpload = {
  readonly slug: string;
  readonly hasWebcam: boolean;
  readonly screenBytes: number;
  readonly webcamBytes: number;
  readonly uploadedBytes: number;
  // Bytes this recording may still add and how long it may run, or null
  // where the server set no cap.
  readonly remainingBytes: number | null;
  readonly maxDurationMs: number | null;
  pushScreen(bytes: Uint8Array): void;
  pushWebcam(bytes: Uint8Array): void;
  uploadPoster(bytes: Uint8Array): Promise<void>;
  uploadPosterCard(bytes: Uint8Array): Promise<void>;
  /*
   * durationMs rides finalize because /init runs before the recording exists.
   * Throws UploadStalledError when the connection never came back: the files
   * stay on this device for resumeRecordingUpload.
   */
  finish(durationMs?: number): Promise<FinalizeResponse>;
  abort(): void;
};

export class NothingRecordedError extends Error {
  constructor() {
    super("Nothing was recorded before the recording stopped");
  }
}

// What a recording left on this device needs to be finished later.
export type PendingUpload = {
  slug: string;
  deviceId: string;
  init: InitRequest;
  hasWebcam: boolean;
};

async function finalizeScreen(
  transport: UploadTransport,
  slug: string,
  parts: PartRef[],
  sizeBytes: number,
  durationMs: number | null | undefined,
): Promise<FinalizeResponse> {
  try {
    return await transport.finalizeScreen({
      slug,
      parts,
      sizeBytes,
      ...(durationMs && durationMs > 0 ? { durationMs } : {}),
    });
  } catch (err) {
    // A finalize lost to the network may still have been applied — the
    // no-auth state probe disambiguates (finalize is idempotent).
    const probe = await transport.state(slug).catch(() => null);
    if (probe?.state !== "ready") throw err;
    return { url: transport.viewUrl(slug) };
  }
}

// Best-effort: a camera that fails to land leaves the viewer playing screen-only.
async function finalizeWebcam(
  transport: UploadTransport,
  slug: string,
  parts: PartRef[],
  sizeBytes: number,
): Promise<void> {
  if (parts.length === 0) return;
  await transport.finalizeWebcam({ slug, parts, sizeBytes }).catch(() => {});
}

/*
 * Open a (dual) multipart recording upload. Bytes go to this device's copy
 * first and are uploaded from there, so nothing is lost to a crash or a dead
 * connection. The webcam stream exists only when /init reserved one.
 */
export async function startRecordingUpload(
  init: InitRequest,
  options: RecordingUploadOptions,
): Promise<RecordingUpload> {
  const { transport } = options;
  const online = options.online ?? defaultOnlineSignal();
  const res = await transport.init(init);
  const slug = res.slug;
  const hasWebcam = !!res.webcamUploadId;
  const files = await options.openFiles(slug, hasWebcam);

  const screenUploader = createPartUploader({
    file: files.screen,
    uploadPart: (n, bytes) => transport.uploadScreenPart(slug, n, bytes),
    partBytes: options.partBytes,
    online,
    wait: options.retryWait,
  });
  const screen = createIndexedRecording("mp4", files.screen, () =>
    screenUploader.notify(),
  );
  const webcamUploader =
    files.webcam &&
    createPartUploader({
      file: files.webcam,
      uploadPart: (n, bytes) => transport.uploadWebcamPart(slug, n, bytes),
      partBytes: options.partBytes,
      online,
      wait: options.retryWait,
    });
  const webcam =
    files.webcam && webcamUploader
      ? createIndexedRecording("webm", files.webcam, () =>
          webcamUploader.notify(),
        )
      : null;

  let screenBytes = 0;
  let webcamBytes = 0;
  let stopped = false;

  return {
    slug,
    hasWebcam,
    remainingBytes: res.remainingBytes ?? null,
    maxDurationMs: res.maxDurationMs ?? null,
    get screenBytes() {
      return screenBytes;
    },
    get webcamBytes() {
      return webcamBytes;
    },
    get uploadedBytes() {
      return (
        screenUploader.uploadedBytes + (webcamUploader?.uploadedBytes ?? 0)
      );
    },
    pushScreen(bytes) {
      if (stopped || bytes.byteLength === 0) return;
      screenBytes += bytes.byteLength;
      screen.push(bytes);
    },
    pushWebcam(bytes) {
      if (stopped || !webcam || bytes.byteLength === 0) return;
      webcamBytes += bytes.byteLength;
      webcam.push(bytes);
    },
    uploadPoster: (bytes) => transport.uploadPoster(slug, bytes),
    uploadPosterCard: (bytes) => transport.uploadPosterCard(slug, bytes),
    async finish(durationMs) {
      stopped = true;
      const finished = await screen.finish();
      if (finished.size === 0) throw new Error("No screen parts uploaded");
      const screenParts = await screenUploader.finish();
      const result = await finalizeScreen(
        transport,
        slug,
        screenParts,
        finished.size,
        durationMs ?? finished.durationMs,
      );
      if (webcam && webcamUploader) {
        try {
          const cam = await webcam.finish();
          await finalizeWebcam(
            transport,
            slug,
            await webcamUploader.finish(),
            cam.size,
          );
        } catch {
          /* best-effort, see finalizeWebcam */
        }
      }
      await files.remove().catch(() => {});
      return result;
    },
    abort() {
      if (stopped) return;
      stopped = true;
      screenUploader.abort();
      webcamUploader?.abort();
      // Release the server-side multipart + pending row; best-effort.
      void transport.abort({ slug }).catch(() => {});
      void files.remove().catch(() => {});
    },
  };
}

/*
 * Finishes a recording from the files it left on this device. Every part is
 * sent again (re-sending a part number replaces it), so nothing has to be
 * known about what reached the server before the crash. If the server already
 * gave up on the upload, the recording goes up as a new one.
 */
export async function resumeRecordingUpload(
  pending: PendingUpload,
  options: RecordingUploadOptions,
): Promise<FinalizeResponse> {
  const { transport } = options;
  const files = await options.openFiles(pending.slug, pending.hasWebcam);
  const screen = await finishRecordingFile("mp4", files.screen);
  if (screen.size === 0) {
    await files.remove();
    throw new NothingRecordedError();
  }
  const webcam = files.webcam
    ? await finishRecordingFile("webm", files.webcam)
    : null;

  const state = await transport.state(pending.slug).catch(() => null);
  if (state?.state === "ready") {
    await files.remove();
    return { url: transport.viewUrl(pending.slug) };
  }
  let slug = pending.slug;
  let hasWebcam = pending.hasWebcam;
  if (state?.state !== "pending") {
    const fresh = await transport.init(pending.init);
    slug = fresh.slug;
    hasWebcam = !!fresh.webcamUploadId;
  }

  const online = options.online ?? defaultOnlineSignal();
  const screenParts = await createPartUploader({
    file: files.screen,
    uploadPart: (n, bytes) => transport.uploadScreenPart(slug, n, bytes),
    partBytes: options.partBytes,
    online,
    wait: options.retryWait,
  }).finish();
  const result = await finalizeScreen(
    transport,
    slug,
    screenParts,
    screen.size,
    screen.durationMs,
  );
  if (files.webcam && webcam && hasWebcam) {
    try {
      const parts = await createPartUploader({
        file: files.webcam,
        uploadPart: (n, bytes) => transport.uploadWebcamPart(slug, n, bytes),
        partBytes: options.partBytes,
        online,
        wait: options.retryWait,
      }).finish();
      await finalizeWebcam(transport, slug, parts, webcam.size);
    } catch {
      /* best-effort, see finalizeWebcam */
    }
  }
  if (slug !== pending.slug) {
    await transport.abort({ slug: pending.slug }).catch(() => {});
  }
  await files.remove();
  return result;
}
