export type CapturePrefs = {
  camera: boolean;
  mic: boolean;
};

export type RecordingStatusKind =
  | "idle"
  | "preparing"
  | "recording"
  | "uploading"
  | "done"
  | "cancelled"
  | "error";

export type RecordingStatus = {
  kind: RecordingStatusKind;
  detail?: string;
};

export type RecordingResultPayload =
  | { ok: true; url: string; bytes: number; durationMs: number }
  | { ok: false; error: string };

export type RecordingResult = RecordingResultPayload & { at: number };

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
