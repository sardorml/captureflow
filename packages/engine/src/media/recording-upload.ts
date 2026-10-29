import {
  createIndexedRecording,
  finishRecordingFile,
  type RecordingFile,
  type RecordingFormat,
} from "./recording-file";
import {
  createSegmentUploader,
  UploadStalledError,
  type OnlineSignal,
  type SegmentUploader,
} from "./segment-uploader";

const defaultWait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export type UploadInitResponse = {
  slug: string;
  webcamUploadId?: string;
  remainingBytes?: number;
  maxDurationMs?: number;
};

export type UploadStream = "screen" | "webcam";

export type UploadFinalizeRequest = {
  slug: string;
  segments: true;
  sizeBytes: number;
  durationMs?: number;
};

export type RecordingUploadTransport<Init> = {
  init(req: Init): Promise<UploadInitResponse>;
  uploadSegment(
    slug: string,
    stream: UploadStream,
    offset: number,
    bytes: Uint8Array,
    signal: AbortSignal,
  ): Promise<void>;
  finalizeScreen(req: UploadFinalizeRequest): Promise<{ url: string }>;
  finalizeWebcam(req: UploadFinalizeRequest): Promise<void>;
  abort(req: { slug: string }): Promise<void>;
  state(slug: string): Promise<{ state: string }>;
  viewUrl(slug: string): string;
};

export type LocalFiles = {
  screen: RecordingFile;
  webcam: RecordingFile | null;
  remove(): Promise<void>;
};

export type RecordingUploadOptions<Init> = {
  transport: RecordingUploadTransport<Init>;
  openFiles(slug: string, hasWebcam: boolean): Promise<LocalFiles>;
  online?: OnlineSignal;
  retryWait?: (ms: number) => Promise<void>;
  intervalMs?: number;
  maxSegmentBytes?: number;
  every?: (ms: number, cb: () => void) => () => void;
};

export type RecordingUpload = {
  readonly slug: string;
  readonly hasWebcam: boolean;
  readonly screenBytes: number;
  readonly webcamBytes: number;
  readonly uploadedBytes: number;
  // Null where the server set no cap.
  readonly remainingBytes: number | null;
  readonly maxDurationMs: number | null;
  pushScreen(bytes: Uint8Array): void;
  pushWebcam(bytes: Uint8Array): void;
  /*
   * durationMs rides finalize because /init runs before the recording exists.
   * beforeFinalize is awaited after the bytes are up and before the
   * recording is finalized. Throws UploadStalledError when the connection
   * never came back: the files stay on this device for resumeRecordingUpload.
   */
  finish(
    durationMs?: number,
    beforeFinalize?: Promise<unknown>,
  ): Promise<{ url: string }>;
  abort(): void;
};

export class NothingRecordedError extends Error {
  constructor() {
    super("Nothing was recorded before the recording stopped");
  }
}

// What a recording left on this device needs to be finished later.
export type PendingUpload<Init> = {
  slug: string;
  deviceId: string;
  init: Init;
  hasWebcam: boolean;
};

function segmentUploader<Init>(
  options: RecordingUploadOptions<Init>,
  slug: string,
  stream: UploadStream,
  file: RecordingFile,
  headerBytes: () => number | null,
): SegmentUploader {
  return createSegmentUploader({
    file,
    uploadSegment: (offset, bytes, signal) =>
      options.transport.uploadSegment(slug, stream, offset, bytes, signal),
    headerBytes,
    online: options.online,
    wait: options.retryWait,
    intervalMs: options.intervalMs,
    maxSegmentBytes: options.maxSegmentBytes,
    every: options.every,
  });
}

const FINALIZE_ATTEMPTS = 4;

// Only a request the server refused for good makes the local copy worthless.
function isRejection(err: unknown): boolean {
  const { status, code } = (err ?? {}) as { status?: unknown; code?: unknown };
  return (
    typeof status === "number" &&
    status >= 400 &&
    status < 500 &&
    code !== "segments_incomplete"
  );
}

async function finalizeScreen<Init>(
  transport: RecordingUploadTransport<Init>,
  slug: string,
  sizeBytes: number,
  durationMs: number | null | undefined,
  wait: (ms: number) => Promise<void>,
): Promise<{ url: string }> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await transport.finalizeScreen({
        slug,
        segments: true,
        sizeBytes,
        ...(durationMs && durationMs > 0 ? { durationMs } : {}),
      });
    } catch (err) {
      // A finalize lost to the network may still have been applied — the
      // no-auth state probe disambiguates (finalize is idempotent).
      const probe = await transport.state(slug).catch(() => null);
      if (probe?.state === "ready") return { url: transport.viewUrl(slug) };
      if (isRejection(err)) throw err;
      if (attempt >= FINALIZE_ATTEMPTS) throw new UploadStalledError(err);
      await wait(1000 * attempt);
    }
  }
}

// Best-effort: a camera that fails to land leaves the viewer playing screen-only.
async function finishWebcam(
  finishFile: () => Promise<{ size: number; headerBytes: number }>,
  upload: (headerBytes: number) => Promise<void>,
  finalize: (sizeBytes: number) => Promise<void>,
): Promise<void> {
  try {
    const cam = await finishFile();
    if (cam.size === 0) return;
    await upload(cam.headerBytes);
    await finalize(cam.size);
  } catch {
    /* see above */
  }
}

/*
 * Open a (dual) recording upload. Bytes go to this device's copy first and
 * are uploaded from there in small segments while recording, so nothing is
 * lost to a crash or a dead connection and little is left to send at stop.
 * The webcam stream exists only when /init reserved one.
 */
export async function startRecordingUpload<Init>(
  init: Init,
  options: RecordingUploadOptions<Init>,
): Promise<RecordingUpload> {
  const { transport } = options;
  const res = await transport.init(init);
  const slug = res.slug;
  const hasWebcam = !!res.webcamUploadId;
  const files = await options.openFiles(slug, hasWebcam);

  const open = (
    format: RecordingFormat,
    stream: UploadStream,
    file: RecordingFile,
  ) => {
    let uploader: SegmentUploader | null = null;
    const recording = createIndexedRecording(format, file, () =>
      uploader?.notify(),
    );
    uploader = segmentUploader(
      options,
      slug,
      stream,
      file,
      () => recording.headerBytes,
    );
    return { recording, uploader };
  };
  const screen = open("mp4", "screen", files.screen);
  const webcam = files.webcam ? open("webm", "webcam", files.webcam) : null;

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
        screen.uploader.uploadedBytes + (webcam?.uploader.uploadedBytes ?? 0)
      );
    },
    pushScreen(bytes) {
      if (stopped || bytes.byteLength === 0) return;
      screenBytes += bytes.byteLength;
      screen.recording.push(bytes);
    },
    pushWebcam(bytes) {
      if (stopped || !webcam || bytes.byteLength === 0) return;
      webcamBytes += bytes.byteLength;
      webcam.recording.push(bytes);
    },
    async finish(durationMs, beforeFinalize) {
      stopped = true;
      const finished = await screen.recording.finish();
      if (finished.size === 0) throw new Error("No screen parts uploaded");
      await screen.uploader.finish(finished.headerBytes);
      await beforeFinalize?.catch(() => undefined);
      const result = await finalizeScreen(
        transport,
        slug,
        finished.size,
        durationMs ?? finished.durationMs,
        options.retryWait ?? defaultWait,
      );
      if (webcam) {
        await finishWebcam(
          () => webcam.recording.finish(),
          (headerBytes) => webcam.uploader.finish(headerBytes),
          (sizeBytes) =>
            transport.finalizeWebcam({ slug, segments: true, sizeBytes }),
        );
      }
      await files.remove().catch(() => {});
      return result;
    },
    abort() {
      if (stopped) return;
      stopped = true;
      screen.uploader.abort();
      webcam?.uploader.abort();
      // Release the server-side upload + pending row; best-effort.
      void transport.abort({ slug }).catch(() => {});
      void files.remove().catch(() => {});
    },
  };
}

/*
 * Finishes a recording from the files it left on this device. The whole file
 * is sent again (a segment re-sent at the same offset replaces it), so
 * nothing has to be known about what reached the server before the crash. If
 * the server already gave up on the upload, the recording goes up as a new
 * one.
 */
export async function resumeRecordingUpload<Init>(
  pending: PendingUpload<Init>,
  options: RecordingUploadOptions<Init>,
): Promise<{ url: string; slug: string }> {
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
    return { url: transport.viewUrl(pending.slug), slug: pending.slug };
  }
  let slug = pending.slug;
  let hasWebcam = pending.hasWebcam;
  if (state?.state !== "pending") {
    const fresh = await transport.init(pending.init);
    slug = fresh.slug;
    hasWebcam = !!fresh.webcamUploadId;
  }

  const upload = (
    stream: UploadStream,
    file: RecordingFile,
    headerBytes: number,
  ) => {
    const uploader = segmentUploader(options, slug, stream, file, () => null);
    return uploader.finish(headerBytes);
  };
  await upload("screen", files.screen, screen.headerBytes);
  const result = await finalizeScreen(
    transport,
    slug,
    screen.size,
    screen.durationMs,
    options.retryWait ?? defaultWait,
  );
  if (files.webcam && webcam && hasWebcam) {
    const file = files.webcam;
    await finishWebcam(
      async () => webcam,
      (headerBytes) => upload("webcam", file, headerBytes),
      (sizeBytes) =>
        transport.finalizeWebcam({ slug, segments: true, sizeBytes }),
    );
  }
  if (slug !== pending.slug) {
    await transport.abort({ slug: pending.slug }).catch(() => {});
  }
  await files.remove();
  return { url: result.url, slug };
}
