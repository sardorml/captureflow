import {
  NothingRecordedError,
  resumeRecordingUpload as resumeUpload,
  startRecordingUpload as startUpload,
  UploadStalledError,
  type LocalFiles,
  type OnlineSignal,
  type PendingUpload as EnginePendingUpload,
  type RecordingUpload,
  type RecordingUploadOptions as EngineUploadOptions,
} from "@captureflow/engine/media";
import type { InitRequest } from "./types";

export { NothingRecordedError, UploadStalledError };
export type { LocalFiles, OnlineSignal, RecordingUpload };

export type RecordingUploadOptions = EngineUploadOptions<InitRequest>;
export type PendingUpload = EnginePendingUpload<InitRequest>;

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

export function startRecordingUpload(
  init: InitRequest,
  options: RecordingUploadOptions,
): Promise<RecordingUpload> {
  return startUpload(init, {
    ...options,
    online: options.online ?? defaultOnlineSignal(),
  });
}

export function resumeRecordingUpload(
  pending: PendingUpload,
  options: RecordingUploadOptions,
): Promise<{ url: string }> {
  return resumeUpload(pending, {
    ...options,
    online: options.online ?? defaultOnlineSignal(),
  });
}
