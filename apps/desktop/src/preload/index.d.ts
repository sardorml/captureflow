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
  ShareFrameEvent,
  ShareAuthState,
  ShareConnectivityState,
  ShareUsageState,
  WorkspacesState,
  ShareStartMeta,
  ShareStartResult,
  ShareFinishMeta,
  ShareFinishResult,
  ShareFailureState,
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
      getShareAuth: () => Promise<ShareAuthState>;
      signInShareAuth: () => Promise<void>;
      signOutShareAuth: () => Promise<ShareAuthState>;
      onShareAuthChanged: (
        callback: (state: ShareAuthState) => void,
      ) => () => void;
      getShareConnectivity: () => Promise<ShareConnectivityState>;
      onShareConnectivityChanged: (
        callback: (state: ShareConnectivityState) => void,
      ) => () => void;
      getShareUsage: () => Promise<ShareUsageState>;
      refreshShareUsage: () => Promise<ShareUsageState>;
      openShareUpgradeCheckout: () => Promise<void>;
      onShareUsageChanged: (
        callback: (state: ShareUsageState) => void,
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
        share?: boolean;
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
      onShareFrameEvent: (
        callback: (event: ShareFrameEvent) => void,
      ) => () => void;
      shareReadyOpenLink: (url: string) => void;
      // Streaming-upload protocol — see preload/index.ts for the IPC
      // wiring and shared/types.ts for the payload shapes.
      shareStart: (meta: ShareStartMeta) => Promise<ShareStartResult>;
      sharePartScreen: (bytes: ArrayBuffer) => void;
      sharePartWebcam: (bytes: ArrayBuffer) => void;
      shareFinish: (meta: ShareFinishMeta) => Promise<ShareFinishResult>;
      shareAbort: () => void;
      shareUploadPoster: (bytes: ArrayBuffer) => void;
      notifySharePrepStart: () => void;
      notifySharePrepCancel: () => void;
      onSharePrepStart: (callback: () => void) => () => void;
      onSharePrepCancel: (callback: () => void) => () => void;
      shareFailureOpen: (state: ShareFailureState) => Promise<void>;
      onShareFailureInit: (
        callback: (state: ShareFailureState) => void,
      ) => () => void;
      shareFailureClose: () => void;
      showCaptureGateDialog: (reason: UpgradeReason) => Promise<void>;
      toolbarSetHitRects: (
        rects: { x: number; y: number; width: number; height: number }[],
      ) => void;
      toolbarResizeForMode: (mode: "share" | "screenshot") => void;
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
      onSnapCaptured: (
        callback: (payload: {
          localPath: string;
          sourceTitle: string | null;
          width: number;
          height: number;
        }) => void,
      ) => () => void;
      onSnapUploadComplete: (
        callback: (payload: {
          id: string;
          viewUrl: string;
          editUrl: string;
        }) => void,
      ) => () => void;
      onSnapUploadFailed: (
        callback: (payload: { reason: string }) => void,
      ) => () => void;
      snapNotificationClose: () => void;
      snapOpenEdit: (editUrl: string) => void;
      snapCopyLink: (viewUrl: string) => void;
      snapDelete: (id: string) => void;
    };
  }
}
