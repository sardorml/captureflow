import { loadDeviceId } from "../device-id";
import { logInfo, logWarn } from "../logger";
import {
  onShareConnectivityChange,
  getShareConnectivity,
} from "./share-connectivity";
import { getActiveWorkspaceId } from "./share-workspaces";
import {
  CHUNK_BYTES,
  postBytes,
  postJson,
  ShareApiHttpError,
} from "./share-api-client";
import { buildShareEditUrl } from "./share-edit-url";
import {
  handleUploadError,
  type ShareUploadFailure,
} from "./share-error-handler";
import type {
  ShareFinishMeta,
  ShareFinishResult,
  ShareStartMeta,
  ShareStartResult,
} from "../../../shared/types";

type InitResponse = {
  slug: string;
  uploadId: string;
  storageKey: string;
  webcamUploadId?: string;
  webcamStorageKey?: string;
};

type PartResponse = { partNumber: number; etag: string };
type FinalizeResponse = { url: string };

type Stream = {
  uploadId: string | null;
  partNumber: number;
  etags: { partNumber: number; etag: string }[];
  buf: Uint8Array[];
  bufBytes: number;
  totalBytes: number;
  inFlight: Promise<void> | null;
  partPath: string;
};

type Session = {
  slug: string;
  deviceId: string;
  hasWebcam: boolean;
  screen: Stream;
  webcam: Stream;
  paused: boolean;
  unsubConnectivity: () => void;
  aborted: boolean;
  // flushTail claims part numbers without setting stream.inFlight; this stops new pumps so a late renderer push can't race it for the same part number.
  finishing: boolean;
};

let session: Session | null = null;

function makeStream(uploadId: string | null, partPath: string): Stream {
  return {
    uploadId,
    partNumber: 1,
    etags: [],
    buf: [],
    bufBytes: 0,
    totalBytes: 0,
    inFlight: null,
    partPath,
  };
}

export async function startShareUpload(
  meta: ShareStartMeta,
): Promise<ShareStartResult> {
  if (session) {
    logWarn(
      "share-streamer",
      "starting new session while previous still live; aborting prior",
    );
    abortShareUpload();
  }

  const deviceId = await loadDeviceId();
  try {
    const init = await postJson<InitResponse>("/init", deviceId, {
      contentType: "video/mp4",
      source: "instant",
      preset: "share",
      title: meta.title ?? undefined,
      hasWebcam: meta.hasWebcam === true,
      workspaceId: getActiveWorkspaceId() ?? undefined,
    });
    const unsubConnectivity = onShareConnectivityChange((state) => {
      if (!session) return;
      session.paused = state === "offline";
      if (state === "online") {
        void pumpStream(session, session.screen);
        if (session.webcam.uploadId) void pumpStream(session, session.webcam);
      }
    });
    session = {
      slug: init.slug,
      deviceId,
      hasWebcam: !!init.webcamUploadId,
      screen: makeStream(init.uploadId, "/part"),
      webcam: makeStream(init.webcamUploadId ?? null, "/webcam-part"),
      paused: getShareConnectivity() === "offline",
      unsubConnectivity,
      aborted: false,
      finishing: false,
    };
    logInfo(
      "share-streamer",
      `started: slug=${init.slug}, screen=${init.uploadId.slice(0, 12)}…, webcam=${
        init.webcamUploadId ? init.webcamUploadId.slice(0, 12) + "…" : "none"
      }`,
    );
    return { ok: true, slug: init.slug, editUrl: buildShareEditUrl(init.slug) };
  } catch (err) {
    const failure = handleUploadError(err, { phase: "init" });
    return failureToStart(failure);
  }
}

export function pushScreenBytes(bytes: ArrayBuffer): void {
  const s = session;
  if (!s || s.aborted) return;
  pushBytes(s, s.screen, bytes);
}

export function getActiveShareSlug(): string | null {
  return session?.slug ?? null;
}

export function getActiveDeviceId(): string | null {
  return session?.deviceId ?? null;
}

export function pushWebcamBytes(bytes: ArrayBuffer): void {
  const s = session;
  if (!s || s.aborted) return;
  if (!s.webcam.uploadId) return;
  pushBytes(s, s.webcam, bytes);
}

function pushBytes(s: Session, stream: Stream, bytes: ArrayBuffer): void {
  if (bytes.byteLength === 0) return;
  const view = new Uint8Array(bytes);
  stream.buf.push(view);
  stream.bufBytes += view.byteLength;
  stream.totalBytes += view.byteLength;
  void pumpStream(s, stream);
}

async function pumpStream(s: Session, stream: Stream): Promise<void> {
  if (s.aborted) return;
  if (s.finishing) return;
  if (s.paused) return;
  if (stream.inFlight) return;
  if (stream.bufBytes < CHUNK_BYTES) return;
  if (!stream.uploadId) return;
  const partBytes = drainPart(stream, CHUNK_BYTES);
  const partNumber = stream.partNumber++;
  stream.inFlight = (async () => {
    try {
      const path = `${stream.partPath}?slug=${encodeURIComponent(s.slug)}&part=${partNumber}`;
      const res = await postBytes<PartResponse>(path, s.deviceId, partBytes);
      stream.etags.push({ partNumber: res.partNumber, etag: res.etag });
      logInfo(
        "share-streamer",
        `${stream.partPath} part ${partNumber} ok: ${partBytes.byteLength}B`,
      );
    } catch (err) {
      // Non-fatal at part level — finalize surfaces the failure with whatever parts landed.
      handleUploadError(err, {
        slug: s.slug,
        phase: `part ${stream.partPath}`,
      });
    } finally {
      stream.inFlight = null;
      if (stream.bufBytes >= CHUNK_BYTES && !s.paused && !s.aborted) {
        void pumpStream(s, stream);
      }
    }
  })();
}

function drainPart(stream: Stream, maxBytes: number): Uint8Array {
  const target = Math.min(stream.bufBytes, maxBytes);
  const out = new Uint8Array(target);
  let written = 0;
  while (written < target && stream.buf.length > 0) {
    const head = stream.buf[0];
    const remaining = target - written;
    if (head.byteLength <= remaining) {
      out.set(head, written);
      written += head.byteLength;
      stream.buf.shift();
      stream.bufBytes -= head.byteLength;
    } else {
      out.set(head.subarray(0, remaining), written);
      stream.buf[0] = head.subarray(remaining);
      stream.bufBytes -= remaining;
      written += remaining;
    }
  }
  return out;
}

export async function finishShareUpload(
  meta: ShareFinishMeta,
): Promise<ShareFinishResult> {
  const s = session;
  if (!s) {
    return { ok: false, error: "No active share session", code: "no_session" };
  }
  if (s.aborted) {
    clearSession();
    return { ok: false, error: "Share session was aborted", code: "aborted" };
  }

  s.finishing = true;

  try {
    await flushTail(s, s.screen);
    if (s.webcam.uploadId) await flushTail(s, s.webcam);

    // Screen finalize is load-bearing; webcam is best-effort (viewer falls back to screen-only).
    const screenFinal = await finalizeStream(
      s,
      s.screen,
      "/finalize",
      meta.screenTotalBytes,
    );
    let webcamErr: ShareUploadFailure | null = null;
    if (s.webcam.uploadId && s.webcam.etags.length > 0) {
      try {
        await finalizeStream(
          s,
          s.webcam,
          "/webcam-finalize",
          meta.webcamTotalBytes ?? s.webcam.totalBytes,
        );
      } catch (err) {
        webcamErr = handleUploadError(err, {
          slug: s.slug,
          phase: "webcam-finalize",
        });
      }
    }

    logInfo(
      "share-streamer",
      `finished: slug=${s.slug}, viewerUrl=${screenFinal.url}, screenBytes=${
        s.screen.totalBytes
      }, webcamBytes=${s.webcam.totalBytes}, webcamFailed=${!!webcamErr}`,
    );
    clearSession();
    return { ok: true, slug: s.slug, url: buildShareEditUrl(s.slug) };
  } catch (err) {
    const failure = handleUploadError(err, { slug: s.slug, phase: "finalize" });
    const partialUrl =
      s.screen.etags.length > 0 ? buildShareEditUrl(s.slug) : undefined;
    clearSession();
    return {
      ok: false,
      error: failure.message,
      code: failure.code,
      status: failure.status,
      partialUrl,
    };
  }
}

async function flushTail(s: Session, stream: Stream): Promise<void> {
  // Drain any in-flight part first so we don't double-claim a part number.
  if (stream.inFlight) {
    try {
      await stream.inFlight;
    } catch {
      /* already logged by pumpStream */
    }
  }
  if (stream.bufBytes === 0) return;
  if (!stream.uploadId) return;

  // R2's completeMultipartUpload requires all non-trailing parts to share one
  // length; a tail >CHUNK_BYTES shipped whole would be rejected. Split it into
  // N more CHUNK_BYTES parts plus one smaller trailing chunk.
  while (stream.bufBytes > CHUNK_BYTES) {
    const partBytes = drainPart(stream, CHUNK_BYTES);
    const partNumber = stream.partNumber++;
    const path = `${stream.partPath}?slug=${encodeURIComponent(s.slug)}&part=${partNumber}`;
    const res = await postBytes<PartResponse>(path, s.deviceId, partBytes);
    stream.etags.push({ partNumber: res.partNumber, etag: res.etag });
    logInfo(
      "share-streamer",
      `${stream.partPath} backfill part ${partNumber} ok: ${partBytes.byteLength}B`,
    );
  }

  if (stream.bufBytes === 0) return;
  const tailBytes = drainPart(stream, stream.bufBytes);
  const partNumber = stream.partNumber++;
  const path = `${stream.partPath}?slug=${encodeURIComponent(s.slug)}&part=${partNumber}`;
  const res = await postBytes<PartResponse>(path, s.deviceId, tailBytes);
  stream.etags.push({ partNumber: res.partNumber, etag: res.etag });
  logInfo(
    "share-streamer",
    `${stream.partPath} tail part ${partNumber} ok: ${tailBytes.byteLength}B`,
  );
}

async function finalizeStream(
  s: Session,
  stream: Stream,
  path: string,
  sizeBytes: number,
): Promise<FinalizeResponse> {
  if (stream.etags.length === 0) {
    throw new ShareApiHttpError(`${path}: no parts uploaded`, 502);
  }
  return postJson<FinalizeResponse>(path, s.deviceId, {
    slug: s.slug,
    parts: stream.etags,
    sizeBytes: sizeBytes > 0 ? sizeBytes : stream.totalBytes,
  });
}

export function abortShareUpload(): void {
  const s = session;
  if (!s) return;
  s.aborted = true;
  s.unsubConnectivity();
  logInfo("share-streamer", `aborted: slug=${s.slug}`);
  session = null;
}

function clearSession(): void {
  const s = session;
  if (!s) return;
  s.unsubConnectivity();
  session = null;
}

function failureToStart(f: ShareUploadFailure): ShareStartResult {
  return { ok: false, error: f.message, code: f.code, status: f.status };
}
