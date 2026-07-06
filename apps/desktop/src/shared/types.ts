import type { WindowBounds } from "@captureflow/engine";

export type {
  RecordingFrameEvent,
  WindowAtPoint,
  WindowBounds,
} from "@captureflow/engine";

export type CaptureSource = {
  id: string;
  name: string;
  thumbnailDataUrl: string;
  displayId: string;
  windowBounds?: WindowBounds;
  // Window sources only; from the native window detector (desktopCapturer doesn't expose it).
  ownerName?: string;
  // Window sources only: captured top-left corner radius in points, mirrored by the dim and overlay highlight.
  cornerRadius?: number;
  // Window sources only: owning OS pid, raised at record start so the target app keeps focus when the toolbar hides.
  pid?: number;
  // Display sources only: when true, record start hides desktop icons via Finder and stop restores them.
  hideDesktopIcons?: boolean;
};

export function isWindowSource(source: CaptureSource): boolean {
  return source.id.startsWith("window:");
}

export function getWindowId(source: CaptureSource): number | undefined {
  if (!isWindowSource(source)) return undefined;
  return parseInt(source.id.split(":")[1], 10);
}

export function getDisplayId(source: CaptureSource): number | undefined {
  if (!source.displayId) return undefined;
  const n = parseInt(source.displayId, 10);
  return Number.isFinite(n) ? n : undefined;
}

export const TOOLBAR_WIDTH = 750;
export const TOOLBAR_WIDTH_SCREENSHOT = 320;
export function toolbarWidthForMode(mode: RecordingMode): number {
  return mode === "screenshot" ? TOOLBAR_WIDTH_SCREENSHOT : TOOLBAR_WIDTH;
}
export const TOOLBAR_BAR_HEIGHT = 50;
// Band reserved below the bar so bottom-placed tooltips don't clip the window edge.
export const TOOLBAR_TOOLTIP_BELOW = 48;
// Total window height; main pins the bar via the offsets below so this can grow without moving the bar on screen.
export const TOOLBAR_HEIGHT = 178;
export const TOOLBAR_BAR_BOTTOM_OFFSET = 48;

export type RecordingMode = "recording" | "screenshot";

export const IPC_CHANNELS = {
  GET_SOURCES: "get-sources",
  SHOW_ITEM_IN_FOLDER: "show-item-in-folder",
  HIDE_WINDOW: "hide-window",
  SHOW_WINDOW: "show-window",
  GET_ACTIVE_WINDOW_SOURCE: "get-active-window-source",
  SHOW_RECORDING_OVERLAY: "show-recording-overlay",
  HIDE_RECORDING_OVERLAY: "hide-recording-overlay",
  RESIZE_WINDOW: "resize-window",
  SHOW_RECORDING_DIM: "show-recording-dim",
  HIDE_RECORDING_DIM: "hide-recording-dim",
  FILE_EXISTS: "file-exists",
  GET_PERMISSIONS: "get-permissions",
  REQUEST_MIC_PERMISSION: "request-mic-permission",
  REQUEST_CAMERA_PERMISSION: "request-camera-permission",
  START_NATIVE_RECORDING: "start-native-recording",
  STOP_NATIVE_RECORDING: "stop-native-recording",
  PAUSE_NATIVE_RECORDING: "pause-native-recording",
  RESUME_NATIVE_RECORDING: "resume-native-recording",
  IS_NATIVE_RECORDING_ACTIVE: "is-native-recording-active",
  NATIVE_RECORDER_CRASHED: "native-recorder-crashed",
  OPEN_EXTERNAL: "open-external",
  PROBE_SCREEN_RECORDING_PERMISSION: "probe-screen-recording-permission",
  SOURCE_SELECTED: "source-selected",
  OPEN_SELECTION_OVERLAY: "open-selection-overlay",
  SELECTION_OVERLAY_INIT: "selection-overlay-init",
  SELECTION_OVERLAY_SOURCES: "selection-overlay-sources",
  SELECTION_OVERLAY_RESULT: "selection-overlay-result",
  GET_WINDOW_AT_POINT: "get-window-at-point",
  FOCUS_APP_BY_PID: "focus-app-by-pid",
  CLOSE_SELECTION_OVERLAY: "close-selection-overlay",
  SELECTION_OVERLAY_CANCELLED: "selection-overlay-cancelled",
  SELECTION_OVERLAY_RESET: "selection-overlay-reset",
  PLAY_SOUND: "play-sound",
  PERMISSIONS_GRANTED: "permissions-granted",
  SHOW_WEBCAM_BUBBLE: "show-webcam-bubble",
  HIDE_WEBCAM_BUBBLE: "hide-webcam-bubble",
  // Hides the window without releasing the MediaStream, keeping the camera warm for instant re-show.
  SOFT_HIDE_WEBCAM_BUBBLE: "soft-hide-webcam-bubble",
  WEBCAM_BUBBLE_INIT: "webcam-bubble-init",
  WEBCAM_BUBBLE_RELEASE: "webcam-bubble-release",
  FIT_WINDOW_TO_CONTENT: "fit-window-to-content",
  REQUEST_MEDIA_PERMISSION: "request-media-permission",
  PERMISSION_DIALOG_INIT: "permission-dialog-init",
  PERMISSION_DIALOG_RESPOND: "permission-dialog-respond",
  LOG_FROM_RENDERER: "log-from-renderer",
  APPLY_RECORDING_DISPLAY_MODE: "apply-recording-display-mode",
  RESTORE_RECORDING_DISPLAY_MODE: "restore-recording-display-mode",
  SHOW_RELEASE_NOTES: "show-release-notes",
  RELEASE_NOTES_PENDING: "release-notes-pending",
  RELEASE_NOTES_MARK_SHOWN: "release-notes-mark-shown",
  SEND_BUG_REPORT: "send-bug-report",
  GET_USER_PREFS: "get-user-prefs",
  SET_USER_PREF: "set-user-pref",
  USER_PREFS_CHANGED: "user-prefs-changed",
  RECORDING_FRAME_EVENT: "recording-frame-event",
  // Streaming-upload protocol: /api/init fires at record START so the slug exists by stop;
  // screen and webcam stream in parallel; RECORDING_FINISH finalizes both and returns the edit URL.
  RECORDING_START: "recording-start",
  RECORDING_PART_SCREEN: "recording-part-screen",
  RECORDING_PART_WEBCAM: "recording-part-webcam",
  RECORDING_FINISH: "recording-finish",
  RECORDING_ABORT: "recording-abort",
  // First composited frame as JPEG, posted to /api/poster as the viewer-link OG thumbnail.
  RECORDING_UPLOAD_POSTER: "recording-upload-poster",
  // Fired when the user clicks record; kicks off recordingStart + audio acquisition during the 3s countdown.
  RECORDING_PREP_START: "recording-prep-start",
  RECORDING_PREP_CANCEL: "recording-prep-cancel",
  RECORDING_READY_OPEN_LINK: "recording-ready-open-link",
  RECORDING_FAILURE_OPEN: "recording-failure-open",
  RECORDING_FAILURE_INIT: "recording-failure-init",
  RECORDING_FAILURE_CLOSE: "recording-failure-close",
  // Opened when a capture needs the user to sign in or be online first; main shows a native confirm dialog.
  CAPTURE_GATE_OPEN: "capture-gate-open",
  // Web-account auth: SIGN_IN opens the login URL (returns via captureflow:// deep link); CHANGED fans out to all windows.
  RECORDING_AUTH_GET: "recording-auth-get",
  RECORDING_AUTH_SIGN_IN: "recording-auth-sign-in",
  RECORDING_AUTH_SIGN_OUT: "recording-auth-sign-out",
  RECORDING_AUTH_CHANGED: "recording-auth-changed",
  // Recording-backend reachability, separate from auth (a signed-in user can still be offline).
  RECORDING_CONNECTIVITY_GET: "recording-connectivity-get",
  RECORDING_CONNECTIVITY_CHANGED: "recording-connectivity-changed",
  RECORDING_USAGE_GET: "recording-usage-get",
  RECORDING_USAGE_CHANGED: "recording-usage-changed",
  RECORDING_USAGE_REFRESH: "recording-usage-refresh",
  RECORDING_USAGE_OPEN_UPGRADE: "recording-usage-open-upgrade",
  // Workspace switcher state; SELECT persists the active target in userData, CHANGED fans out on any change.
  WORKSPACES_GET: "workspaces-get",
  WORKSPACES_REFRESH: "workspaces-refresh",
  WORKSPACES_SELECT: "workspaces-select",
  WORKSPACES_CHANGED: "workspaces-changed",
  // Renderer publishes hit rects; main polls the cursor at ~60Hz and toggles setIgnoreMouseEvents so the
  // window's transparent areas above the visible bar don't eat clicks meant for the app underneath.
  TOOLBAR_SET_HIT_RECTS: "toolbar-set-hit-rects",
  // Resize the toolbar window on mode flip; main re-centres against the previous x so the bar doesn't jump.
  TOOLBAR_RESIZE_FOR_MODE: "toolbar-resize-for-mode",
  // Screenshot pipeline: main spawns the native sidecar in snapshot mode, copies/saves the PNG, plays the
  // shutter, and uploads it. Replaces the recording-start path for this mode.
  CAPTURE_SCREENSHOT: "capture-screenshot",
  SCREENSHOT_CAPTURED: "screenshot-captured",
  SCREENSHOT_UPLOAD_COMPLETE: "screenshot-upload-complete",
  SCREENSHOT_UPLOAD_FAILED: "screenshot-upload-failed",
  SCREENSHOT_NOTIFICATION_CLOSE: "screenshot-notification-close",
  SCREENSHOT_OPEN_EDIT: "screenshot-open-edit",
  SCREENSHOT_COPY_LINK: "screenshot-copy-link",
  SCREENSHOT_DELETE: "screenshot-delete",
} as const;

// Renderer-safe; never carries the raw bearer token (main keeps that for outbound calls).
export type RecordingAuthState =
  | { kind: "signed_out" }
  | {
      kind: "signed_in";
      tokenId: string;
      label: string | null;
      email: string | null;
    };

export type RecordingConnectivityState = "online" | "offline";

// `kind: 'unknown'` is the pre-probe boot state, treated as "no lock yet" so a slow network
// doesn't flash the upgrade modal on launch.
export type RecordingUsageState =
  | { kind: "unknown" }
  | {
      kind: "known";
      usedBytes: number;
      limitBytes: number;
      activeCount: number;
      activeLimit: number;
      capReached: boolean;
      isDev: boolean;
      // False (or absent on legacy cached state) means the account is on the free tier.
      proSubscriptionActive: boolean;
      checkedAt: number;
    };

export type WorkspaceSummary = {
  id: string;
  name: string;
  kind: "personal" | "team";
  role: "owner" | "member";
};

// `unknown` hides the chip pre-probe (and when signed out) so a stale paint doesn't flash someone else's workspace.
export type WorkspacesState =
  | { kind: "unknown" }
  | {
      kind: "known";
      workspaces: WorkspaceSummary[];
      activeId: string | null;
    };

// Persisted user toggles; see src/main/lib/user-prefs.ts for storage.
export type UserPrefs = {
  // Opt-in PostHog analytics; never captures recording content, only anonymous product-usage events.
  analyticsEnabled: boolean;
  termsAccepted: boolean;
};

export type RecordingStartMeta = {
  title: string | null;
  hasWebcam: boolean;
};

export type RecordingStartResult =
  | { ok: true; slug: string; editUrl: string }
  | { ok: false; error: string; code?: string; status?: number };

// `webcamTotalBytes` is only meaningful when RECORDING_START.hasWebcam was true.
export type RecordingFinishMeta = {
  durationMs: number;
  screenTotalBytes: number;
  webcamTotalBytes?: number;
};

export type RecordingFinishResult =
  | { ok: true; slug: string; url: string }
  | {
      ok: false;
      error: string;
      code?: string;
      status?: number;
      partialUrl?: string;
    };

export type RecordingFailureKind = "no-link" | "partial" | "init-failed";

export type RecordingFailureState = {
  kind: RecordingFailureKind;
  message: string;
  url?: string;
};

export type UpgradeReason = "recording" | "screenshot" | "cloud";

export type BugReportPayload = {
  description: string;
  email?: string;
};

export type BugReportResult = { ok: true } | { ok: false; error: string };

export type SelectionOverlayMode = "display" | "window" | "area";

export type ReleaseNotesInitPayload = {
  version: string;
  message: string;
  detail: string;
};

export type PermissionDialogInitPayload = {
  kind: "camera" | "microphone";
  variant: "first-time" | "denied";
};
