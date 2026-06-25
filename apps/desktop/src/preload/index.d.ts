import type {
  CaptureSource,
  TrackingData,
  WindowBounds,
  SelectionOverlayMode,
  WindowAtPoint,
  PermissionDialogInitPayload,
  ReleaseNotesInitPayload,
  BugReportPayload,
  BugReportResult,
  UserPrefs,
  RecordingFrameEvent,
  RecordingAuthState,
  RecordingConnectivityState,
  RecordingUsageState,
  WorkspacesState,
  RecordingStartMeta,
  RecordingStartResult,
  RecordingFinishMeta,
  RecordingFinishResult,
  RecordingFailureState,
  UpgradeReason,
} from "../shared/types";

declare global {
  interface Window {
    electronAPI: {
      getSources: () => Promise<CaptureSource[]>;
      getRecordingsDir: () => Promise<string>;
      showItemInFolder: (path: string) => Promise<void>;
      resizeWindow: (opts: {
        width: number;
        height: number;
        minWidth?: number;
        minHeight?: number;
      }) => Promise<void>;
      startCursorTracking: (
        displayId: string,
        windowBounds?: WindowBounds,
        wallClockMs?: number,
      ) => Promise<void>;
      stopCursorTracking: () => Promise<{ data: TrackingData }>;
      pauseCursorTracking: () => Promise<void>;
      resumeCursorTracking: () => Promise<void>;
      deleteCurrentSession: () => Promise<void>;
      onCursorPosition: (
        callback: (pos: import("../shared/types").CursorPosition) => void,
      ) => () => void;
      fileExists: (filePath: string) => Promise<boolean>;
      getPermissions: () => Promise<{
        screen: string;
        microphone: string;
        camera: string;
        accessibility: boolean;
      }>;
      requestMicPermission: () => Promise<boolean>;
      requestCameraPermission: () => Promise<boolean>;
      openExternal: (url: string) => Promise<void>;
      playSound: (name: string) => Promise<void>;
      sendBugReport: (payload: BugReportPayload) => Promise<BugReportResult>;
      permissionsGranted: () => Promise<void>;
      showWebcamBubble: (deviceId: string) => Promise<void>;
      hideWebcamBubble: () => Promise<void>;
      softHideWebcamBubble: () => Promise<void>;
      onWebcamBubbleInit: (callback: (deviceId: string) => void) => () => void;
      onWebcamBubbleRelease: (callback: () => void) => () => void;
      onToolbarVisible: (callback: () => void) => () => void;
      onEditorCloseRequested: (callback: () => void) => () => void;
      onEditorSaveAndClose: (callback: () => void) => () => void;
      onEditorDeleteAndClose: (callback: () => void) => () => void;
      forceCloseEditor: () => void;
      log: (
        level: "info" | "warn" | "error",
        component: string,
        message: string,
      ) => void;
      showReleaseNotes: (opts?: {
        force?: boolean;
      }) => Promise<ReleaseNotesInitPayload | null>;
      releaseNotesPending: () => Promise<ReleaseNotesInitPayload | null>;
      markReleaseNotesShown: () => Promise<void>;
      getRecordingAuth: () => Promise<RecordingAuthState>;
      signInRecordingAuth: () => Promise<void>;
      signOutRecordingAuth: () => Promise<RecordingAuthState>;
      onRecordingAuthChanged: (
        callback: (state: RecordingAuthState) => void,
      ) => () => void;
      getRecordingConnectivity: () => Promise<RecordingConnectivityState>;
      onRecordingConnectivityChanged: (
        callback: (state: RecordingConnectivityState) => void,
      ) => () => void;
      getRecordingUsage: () => Promise<RecordingUsageState>;
      refreshRecordingUsage: () => Promise<RecordingUsageState>;
      openRecordingUpgradeCheckout: () => Promise<void>;
      onRecordingUsageChanged: (
        callback: (state: RecordingUsageState) => void,
      ) => () => void;
      getWorkspaces: () => Promise<WorkspacesState>;
      refreshWorkspaces: () => Promise<WorkspacesState>;
      selectWorkspace: (id: string) => Promise<WorkspacesState>;
      onWorkspacesChanged: (
        callback: (state: WorkspacesState) => void,
      ) => () => void;
      fitWindowToContent: (opts: { width?: number; height: number }) => void;
      requestMediaPermission: (
        kind: "camera" | "microphone",
      ) => Promise<boolean>;
      onPermissionDialogInit: (
        callback: (payload: PermissionDialogInitPayload) => void,
      ) => () => void;
      respondToPermissionDialog: (allow: boolean) => void;
      requestAccessibility: () => Promise<boolean>;
      probeScreenRecordingPermission: () => Promise<void>;
      startNativeRecording: (config: {
        outputDir: string;
        displayId?: number;
        windowId?: number;
        fps?: number;
        captureAudio?: boolean;
        includeSelfWindows?: boolean;
        cropRect?: WindowBounds;
        recording?: boolean;
      }) => Promise<{
        windowBounds?: WindowBounds;
        wallClockMs?: number;
        cornerRadius?: number;
      }>;
      stopNativeRecording: () => Promise<{
        path: string;
        systemAudioPath: string | null;
        duration: number;
        width: number;
        height: number;
      }>;
      pauseNativeRecording: () => Promise<void>;
      resumeNativeRecording: () => Promise<void>;
      isNativeRecordingActive: () => Promise<boolean>;
      hideWindow: () => Promise<void>;
      showRecordingOverlay: (opts?: {
        startedAt?: number;
        capMs?: number;
      }) => Promise<void>;
      hideRecordingOverlay: () => Promise<void>;
      showRecordingDim: (
        bounds: {
          x: number;
          y: number;
          width: number;
          height: number;
        },
        cornerRadius?: number,
      ) => Promise<void>;
      hideRecordingDim: () => Promise<void>;
      onOverlayAction: (callback: (action: string) => void) => () => void;
      onNativeRecorderCrashed: (callback: () => void) => () => void;
      showWindow: () => Promise<void>;
      getActiveWindowSource: () => Promise<CaptureSource | null>;
      onSourceSelected: (
        callback: (source: CaptureSource) => void,
      ) => () => void;
      sendEditorReady: () => void;
      openSelectionOverlay: (
        mode: SelectionOverlayMode,
        devices: { hasCamera: boolean; hasMic: boolean },
        includeSelf?: boolean,
      ) => Promise<void>;
      closeSelectionOverlay: () => Promise<void>;
      getWindowAtPoint: (x: number, y: number) => Promise<WindowAtPoint>;
      focusAppByPid: (pid?: number) => Promise<boolean>;
      applyRecordingDisplayMode: (opts: {
        hideDesktopIcons: boolean;
      }) => Promise<void>;
      restoreRecordingDisplayMode: () => Promise<void>;
      onSelectionOverlayInit: (
        callback: (data: {
          mode: SelectionOverlayMode;
          displayName: string;
          displayWidth: number;
          displayHeight: number;
          displayRefreshRate: number;
          sources: CaptureSource[];
          hasCamera: boolean;
          hasMic: boolean;
        }) => void,
      ) => () => void;
      onSelectionOverlaySources: (
        callback: (sources: CaptureSource[]) => void,
      ) => () => void;
      sendSelectionResult: (source: CaptureSource) => void;
      onSelectionOverlayCancelled: (callback: () => void) => () => void;
      onSelectionOverlayReset: (callback: () => void) => () => void;
      onAutoStartRecording: (callback: () => void) => () => void;
      getUserPrefs: () => Promise<UserPrefs>;
      setUserPref: <K extends keyof UserPrefs>(
        key: K,
        value: UserPrefs[K],
      ) => Promise<UserPrefs>;
      onUserPrefsChanged: (callback: (prefs: UserPrefs) => void) => () => void;
      onRecordingFrameEvent: (
        callback: (event: RecordingFrameEvent) => void,
      ) => () => void;
      recordingReadyOpenLink: (url: string) => void;
      // Streaming-upload protocol — see preload/index.ts for the IPC
      // wiring and shared/types.ts for the payload shapes.
      recordingStart: (
        meta: RecordingStartMeta,
      ) => Promise<RecordingStartResult>;
      recordingPartScreen: (bytes: ArrayBuffer) => void;
      recordingPartWebcam: (bytes: ArrayBuffer) => void;
      recordingFinish: (
        meta: RecordingFinishMeta,
      ) => Promise<RecordingFinishResult>;
      recordingAbort: () => void;
      recordingUploadPoster: (bytes: ArrayBuffer) => void;
      notifyRecordingPrepStart: () => void;
      notifyRecordingPrepCancel: () => void;
      onRecordingPrepStart: (callback: () => void) => () => void;
      onRecordingPrepCancel: (callback: () => void) => () => void;
      recordingFailureOpen: (state: RecordingFailureState) => Promise<void>;
      onRecordingFailureInit: (
        callback: (state: RecordingFailureState) => void,
      ) => () => void;
      recordingFailureClose: () => void;
      showCaptureGateDialog: (reason: UpgradeReason) => Promise<void>;
      toolbarSetHitRects: (
        rects: { x: number; y: number; width: number; height: number }[],
      ) => void;
      toolbarResizeForMode: (mode: "recording" | "screenshot") => void;
      captureScreenshot: (
        target:
          | { kind: "display"; displayId: number }
          | { kind: "window"; windowId: number }
          | {
              kind: "area";
              displayId: number;
              cropRect: { x: number; y: number; width: number; height: number };
            },
      ) => Promise<
        | {
            ok: true;
            id: string;
            viewUrl: string;
            editUrl: string;
            localCopyPath: string | null;
          }
        | { ok: false; error: string; code?: string }
      >;
      onScreenshotCaptured: (
        callback: (payload: {
          localPath: string;
          sourceTitle: string | null;
          width: number;
          height: number;
        }) => void,
      ) => () => void;
      onScreenshotUploadComplete: (
        callback: (payload: {
          id: string;
          viewUrl: string;
          editUrl: string;
        }) => void,
      ) => () => void;
      onScreenshotUploadFailed: (
        callback: (payload: { reason: string }) => void,
      ) => () => void;
      screenshotNotificationClose: () => void;
      screenshotOpenEdit: (editUrl: string) => void;
      screenshotCopyLink: (viewUrl: string) => void;
      screenshotDelete: (id: string) => void;
    };
  }
}
