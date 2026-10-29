import { shell } from "electron";
import {
  NothingRecordedError,
  resumeRecordingUpload,
  startRecordingUpload as startUpload,
  UploadStalledError,
  type OnlineSignal,
  type RecordingUpload,
} from "@captureflow/engine/media";
import { loadDeviceId } from "../device-id";
import { logInfo, logWarn } from "../logger";
import {
  onRecordingConnectivityChange,
  getRecordingConnectivity,
} from "./recording-connectivity";
import { getActiveWorkspaceId } from "./recording-workspaces";
import { RecordingApiHttpError } from "./recording-api-client";
import { buildRecordingEditUrl } from "./recording-edit-url";
import { handleUploadError } from "./recording-error-handler";
import {
  closeLocalRecording,
  listLocalRecordings,
  openLocalRecording,
  type DesktopPendingUpload,
} from "./recording-local-files";
import {
  createRecordingTransport,
  type RecordingInitRequest,
} from "./recording-transport";
import type {
  RecordingFinishMeta,
  RecordingFinishResult,
  RecordingStartMeta,
  RecordingStartResult,
} from "../../../shared/types";

type Session = { upload: RecordingUpload; deviceId: string };

let session: Session | null = null;
let isStarting = false;
// Recordings this run is still uploading; a resume must never touch them.
const busySlugs = new Set<string>();
let resuming: Promise<void> | null = null;

const online: OnlineSignal = {
  isOnline: () => getRecordingConnectivity() !== "offline",
  onOnline: (cb) =>
    onRecordingConnectivityChange((state) => {
      if (state === "online") cb();
    }),
};

function uploadOptions(
  pending: Omit<DesktopPendingUpload, "slug" | "hasWebcam">,
) {
  return {
    transport: createRecordingTransport(pending.deviceId),
    openFiles: (slug: string, hasWebcam: boolean) =>
      openLocalRecording({ ...pending, slug, hasWebcam }),
    online,
  };
}

export async function startRecordingUpload(
  meta: RecordingStartMeta,
): Promise<RecordingStartResult> {
  if (session) {
    logWarn(
      "recording-streamer",
      "starting new session while previous still live; aborting prior",
    );
    abortRecordingUpload();
  }

  isStarting = true;
  try {
    const deviceId = await loadDeviceId();
    const init: RecordingInitRequest = {
      contentType: "video/mp4",
      source: "instant",
      preset: "recording",
      client: "desktop",
      title: meta.title ?? undefined,
      hasWebcam: meta.hasWebcam === true,
      workspaceId: getActiveWorkspaceId() ?? undefined,
    };
    const upload = await startUpload(init, uploadOptions({ deviceId, init }));
    session = { upload, deviceId };
    busySlugs.add(upload.slug);
    logInfo(
      "recording-streamer",
      `started: slug=${upload.slug}, webcam=${upload.hasWebcam}`,
    );
    return {
      ok: true,
      slug: upload.slug,
      editUrl: buildRecordingEditUrl(upload.slug),
    };
  } catch (err) {
    const failure = handleUploadError(err, { phase: "init" });
    return {
      ok: false,
      error: failure.message,
      code: failure.code,
      status: failure.status,
    };
  } finally {
    isStarting = false;
  }
}

export function pushScreenBytes(bytes: ArrayBuffer): void {
  session?.upload.pushScreen(new Uint8Array(bytes));
}

export function pushWebcamBytes(bytes: ArrayBuffer): void {
  session?.upload.pushWebcam(new Uint8Array(bytes));
}

export function getActiveRecordingSlug(): string | null {
  return session?.upload.slug ?? null;
}

export function getActiveDeviceId(): string | null {
  return session?.deviceId ?? null;
}

// Only a request the server refused for good makes the local copy worthless.
function isRejected(err: unknown): boolean {
  return (
    err instanceof RecordingApiHttpError &&
    err.status >= 400 &&
    err.status < 500
  );
}

export async function finishRecordingUpload(
  meta: RecordingFinishMeta,
): Promise<RecordingFinishResult> {
  const s = session;
  if (!s) {
    return {
      ok: false,
      error: "No active recording session",
      code: "no_session",
    };
  }
  session = null;
  const { slug } = s.upload;

  try {
    await s.upload.finish(meta.durationMs);
    logInfo(
      "recording-streamer",
      `finished: slug=${slug}, screenBytes=${s.upload.screenBytes}, webcamBytes=${s.upload.webcamBytes}`,
    );
    return { ok: true, slug, url: buildRecordingEditUrl(slug) };
  } catch (err) {
    if (s.upload.screenBytes > 0 && !isRejected(err)) {
      logWarn(
        "recording-streamer",
        `finish deferred for ${slug}: ${String(err)}`,
      );
      await closeLocalRecording(slug);
      return {
        ok: false,
        error:
          err instanceof UploadStalledError
            ? err.message
            : new UploadStalledError(err).message,
        code: "upload_pending",
      };
    }
    const failure = handleUploadError(err, { slug, phase: "finalize" });
    s.upload.abort();
    return {
      ok: false,
      error: failure.message,
      code: failure.code,
      status: failure.status,
    };
  } finally {
    busySlugs.delete(slug);
    void resumePendingUploads();
  }
}

export function abortRecordingUpload(): void {
  const s = session;
  if (!s) return;
  session = null;
  s.upload.abort();
  busySlugs.delete(s.upload.slug);
  logInfo("recording-streamer", `aborted: slug=${s.upload.slug}`);
}

async function resumeOne(pending: DesktopPendingUpload): Promise<void> {
  try {
    const { slug } = await resumeRecordingUpload(
      pending,
      uploadOptions(pending),
    );
    logInfo("recording-streamer", `resumed: ${pending.slug} → ${slug}`);
    // The server had given up on the old link, so this one is new to the user.
    if (slug !== pending.slug) {
      void shell.openExternal(buildRecordingEditUrl(slug));
    }
  } catch (err) {
    if (err instanceof NothingRecordedError) return;
    logWarn(
      "recording-streamer",
      `resume failed for ${pending.slug}: ${String(err)}`,
    );
    await closeLocalRecording(pending.slug);
  }
}

/*
 * Finishes uploads an earlier session left on disk: after a crash, a quit
 * mid-upload, or a connection that never came back. Runs at launch and
 * whenever the connection returns, never alongside a live recording.
 */
export function resumePendingUploads(): Promise<void> {
  if (isStarting || busySlugs.size > 0) return Promise.resolve();
  resuming ??= (async () => {
    try {
      for (const pending of await listLocalRecordings()) {
        if (isStarting || busySlugs.size > 0) return;
        await resumeOne(pending);
      }
    } finally {
      resuming = null;
    }
  })();
  return resuming;
}

export function initRecordingUploadRecovery(): void {
  void resumePendingUploads();
  onRecordingConnectivityChange((state) => {
    if (state === "online") void resumePendingUploads();
  });
}
