export type CapturePrefs = {
  camera: boolean;
  mic: boolean;
  cameraId?: string;
  micId?: string;
};

/*
 * Timing fields let any surface (popup, control bar) derive the live elapsed
 * time locally: elapsed = (pausedAt ?? now) - startedAt - pausedMs.
 */
export type RecordingStatus =
  | { kind: "idle" }
  | { kind: "preparing" }
  | { kind: "recording"; startedAt: number; pausedMs: number }
  | { kind: "paused"; startedAt: number; pausedMs: number; pausedAt: number }
  | { kind: "uploading" }
  | { kind: "done" }
  | { kind: "cancelled" }
  | { kind: "error"; detail?: string };

export type RecordingStatusKind = RecordingStatus["kind"];

export type RecordingResultPayload =
  | { ok: true; url: string; bytes: number; durationMs: number }
  | { ok: false; error: string; code?: string };

export type RecordingResult = RecordingResultPayload & { at: number };

// Marker for the recording being uploaded right now; a marker that outlives
// its offscreen document is a crashed upload the SW aborts server-side.
export type ActiveUpload = {
  slug: string;
  deviceId: string;
};

const recordingStatusItem = storage.defineItem<RecordingStatus>(
  "session:recordingStatus",
  { fallback: { kind: "idle" } },
);

const recordingResultItem = storage.defineItem<RecordingResult | null>(
  "local:recordingResult",
  { fallback: null },
);

const capturePrefsItem = storage.defineItem<CapturePrefs>(
  "local:capturePrefs",
  { fallback: { camera: false, mic: false } },
);

const cameraBlockedItem = storage.defineItem<boolean>("local:cameraBlocked", {
  fallback: false,
});

// local: (not session:) so a browser crash still leaves the marker for the sweep.
const activeUploadItem = storage.defineItem<ActiveUpload | null>(
  "local:activeUpload",
  { fallback: null },
);

export const getRecordingStatus = (): Promise<RecordingStatus> =>
  recordingStatusItem.getValue();
export const setRecordingStatus = (status: RecordingStatus): Promise<void> =>
  recordingStatusItem.setValue(status);
export const watchRecordingStatus = (
  cb: (status: RecordingStatus) => void,
): (() => void) => recordingStatusItem.watch(cb);

export const getRecordingResult = (): Promise<RecordingResult | null> =>
  recordingResultItem.getValue();
export const saveRecordingResult = (
  result: RecordingResultPayload,
): Promise<void> => recordingResultItem.setValue({ ...result, at: Date.now() });
export const watchRecordingResult = (
  cb: (result: RecordingResult | null) => void,
): (() => void) => recordingResultItem.watch(cb);

export const getCapturePrefs = (): Promise<CapturePrefs> =>
  capturePrefsItem.getValue();
export const setCapturePrefs = (prefs: CapturePrefs): Promise<void> =>
  capturePrefsItem.setValue(prefs);
export const watchCapturePrefs = (
  cb: (prefs: CapturePrefs) => void,
): (() => void) => capturePrefsItem.watch(cb);

export const getCameraBlocked = (): Promise<boolean> =>
  cameraBlockedItem.getValue();
export const setCameraBlocked = (blocked: boolean): Promise<void> =>
  cameraBlockedItem.setValue(blocked);
export const watchCameraBlocked = (
  cb: (blocked: boolean) => void,
): (() => void) => cameraBlockedItem.watch(cb);

export const getActiveUpload = (): Promise<ActiveUpload | null> =>
  activeUploadItem.getValue();
export const setActiveUpload = (upload: ActiveUpload | null): Promise<void> =>
  activeUploadItem.setValue(upload);
