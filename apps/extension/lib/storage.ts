import type { RecordingVisibility } from "./api/types";
import type { PendingUpload } from "./api/upload-streamer";
import type { RecordingQualityId, RecordingLimits } from "@captureflow/engine";
import type { CameraEffect } from "./capture/camera-effects";

/*
 * Which surface the picker opens on. Chrome treats displaySurface as a hint —
 * it preselects the pane, the viewer can still pick anything — so this is a
 * starting point, not a constraint.
 */
export type CaptureSource = "screen" | "window" | "tab";

// A drawn rectangle, or the whole visible tab.
export type ScreenshotType = "area" | "tab";

export type CapturePrefs = {
  camera: boolean;
  mic: boolean;
  cameraId?: string;
  micId?: string;
  source?: CaptureSource;
  visibility?: RecordingVisibility;
  shot?: ScreenshotType;
  effect?: CameraEffect;
  quality?: RecordingQualityId;
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
  | { kind: "uploading"; uploadedBytes?: number; totalBytes?: number }
  | { kind: "done" }
  | { kind: "cancelled" }
  | { kind: "error"; detail?: string };

export type RecordingStatusKind = RecordingStatus["kind"];

export type RecordingResultPayload =
  | { ok: true; url: string; bytes: number; durationMs: number }
  | { ok: false; error: string; code?: string };

/*
 * Marker for the recording being uploaded right now. One that outlives its
 * offscreen document is a crashed recording: the SW finishes its upload from
 * the files it left on this device. Markers written before those files
 * existed carry no init and are aborted server-side instead.
 */
export type ActiveUpload = Pick<PendingUpload, "slug" | "deviceId"> &
  Partial<PendingUpload>;

export type { PendingUpload };

/*
 * local: (not session:) because the control bar reads this from a content
 * script. session: is gated behind an access level the worker grants at
 * startup, which races page load — and a watcher registered before the grant
 * lands never starts firing, so the bar simply never appeared. The worker
 * sweeps a live status left behind by a crash; see sweepStaleRecording.
 */
const recordingStatusItem = storage.defineItem<RecordingStatus>(
  "local:recordingStatus",
  { fallback: { kind: "idle" } },
);

const capturePrefsItem = storage.defineItem<CapturePrefs>(
  "local:capturePrefs",
  { fallback: { camera: false, mic: false, source: "screen" } },
);

type RememberedLimits = { token: string; limits: RecordingLimits };

// The last caps the server reported, for when the next read fails.
const recordingLimitsItem = storage.defineItem<RememberedLimits | null>(
  "local:recordingLimits",
  { fallback: null },
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

export const getCapturePrefs = (): Promise<CapturePrefs> =>
  capturePrefsItem.getValue();
export const setCapturePrefs = (prefs: CapturePrefs): Promise<void> =>
  capturePrefsItem.setValue(prefs);
export const watchCapturePrefs = (
  cb: (prefs: CapturePrefs) => void,
): (() => void) => capturePrefsItem.watch(cb);

// Where the user last dragged the camera bubble, in viewport pixels; null
// means its default corner.
export type BubblePosition = { left: number; top: number };
const bubblePositionItem = storage.defineItem<BubblePosition | null>(
  "local:bubblePosition",
  { fallback: null },
);
export const getBubblePosition = (): Promise<BubblePosition | null> =>
  bubblePositionItem.getValue();
export const setBubblePosition = (position: BubblePosition): Promise<void> =>
  bubblePositionItem.setValue(position);

// The panel's theme. "system" defers to the OS and is resolved at paint; the
// names match the dashboard's so the two pickers read alike.
export type ThemePreference = "light" | "dark" | "system";
const themeItem = storage.defineItem<ThemePreference>("local:themePreference", {
  fallback: "system",
});
export const getThemePreference = (): Promise<ThemePreference> =>
  themeItem.getValue();
export const setThemePreference = (theme: ThemePreference): Promise<void> =>
  themeItem.setValue(theme);
export const watchThemePreference = (
  cb: (theme: ThemePreference) => void,
): (() => void) => themeItem.watch(cb);

export const getRememberedLimits = (): Promise<RememberedLimits | null> =>
  recordingLimitsItem.getValue();
export const setRememberedLimits = (value: RememberedLimits): Promise<void> =>
  recordingLimitsItem.setValue(value);

export const getCameraBlocked = (): Promise<boolean> =>
  cameraBlockedItem.getValue();
export const setCameraBlocked = (blocked: boolean): Promise<void> =>
  cameraBlockedItem.setValue(blocked);
export const watchCameraBlocked = (
  cb: (blocked: boolean) => void,
): (() => void) => cameraBlockedItem.watch(cb);

const pendingUploadsItem = storage.defineItem<PendingUpload[]>(
  "local:pendingUploads",
  { fallback: [] },
);

export const getPendingUploads = (): Promise<PendingUpload[]> =>
  pendingUploadsItem.getValue();
export const setPendingUploads = (uploads: PendingUpload[]): Promise<void> =>
  pendingUploadsItem.setValue(uploads);

export const getActiveUpload = (): Promise<ActiveUpload | null> =>
  activeUploadItem.getValue();
export const setActiveUpload = (upload: ActiveUpload | null): Promise<void> =>
  activeUploadItem.setValue(upload);
