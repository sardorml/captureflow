import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import type {
  CaptureSource,
  TrackingData,
  WindowBounds,
  SelectionOverlayMode,
  WindowAtPoint,
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
  UpgradeReason
} from '../shared/types'

const electronAPI = {
  getSources: (): Promise<CaptureSource[]> => ipcRenderer.invoke(IPC_CHANNELS.GET_SOURCES),

  getRecordingsDir: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.GET_RECORDINGS_DIR),

  showItemInFolder: (path: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHOW_ITEM_IN_FOLDER, path),

  resizeWindow: (opts: {
    width: number
    height: number
    minWidth?: number
    minHeight?: number
  }): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.RESIZE_WINDOW, opts),

  startCursorTracking: (
    displayId: string,
    windowBounds?: WindowBounds,
    wallClockMs?: number
  ): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.START_CURSOR_TRACKING, displayId, windowBounds, wallClockMs),

  stopCursorTracking: (): Promise<{ data: TrackingData }> =>
    ipcRenderer.invoke(IPC_CHANNELS.STOP_CURSOR_TRACKING),

  pauseCursorTracking: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.PAUSE_CURSOR_TRACKING),

  resumeCursorTracking: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.RESUME_CURSOR_TRACKING),

  deleteCurrentSession: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.DELETE_CURRENT_SESSION),

  onCursorPosition: (
    callback: (pos: import('../shared/types').CursorPosition) => void
  ): (() => void) => {
    const handler = (_: unknown, pos: import('../shared/types').CursorPosition): void =>
      callback(pos)
    ipcRenderer.on(IPC_CHANNELS.CURSOR_POSITION_EVENT, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CURSOR_POSITION_EVENT, handler)
  },

  fileExists: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_EXISTS, filePath),

  getPermissions: (): Promise<{ screen: string; microphone: string; camera: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_PERMISSIONS),

  requestMicPermission: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.REQUEST_MIC_PERMISSION),

  requestCameraPermission: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.REQUEST_CAMERA_PERMISSION),

  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.OPEN_EXTERNAL, url),

  playSound: (name: string): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.PLAY_SOUND, name),

  sendBugReport: (payload: BugReportPayload): Promise<BugReportResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.SEND_BUG_REPORT, payload),

  getUserPrefs: (): Promise<UserPrefs> => ipcRenderer.invoke(IPC_CHANNELS.GET_USER_PREFS),
  setUserPref: <K extends keyof UserPrefs>(key: K, value: UserPrefs[K]): Promise<UserPrefs> =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_USER_PREF, key, value),
  onUserPrefsChanged: (callback: (prefs: UserPrefs) => void): (() => void) => {
    const handler = (_: unknown, prefs: UserPrefs): void => callback(prefs)
    ipcRenderer.on(IPC_CHANNELS.USER_PREFS_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.USER_PREFS_CHANGED, handler)
  },

  onShareFrameEvent: (callback: (event: ShareFrameEvent) => void): (() => void) => {
    const handler = (_: unknown, event: ShareFrameEvent): void => callback(event)
    ipcRenderer.on(IPC_CHANNELS.SHARE_FRAME_EVENT, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHARE_FRAME_EVENT, handler)
  },

  shareReadyOpenLink: (url: string): void =>
    ipcRenderer.send(IPC_CHANNELS.SHARE_READY_OPEN_LINK, url),

  // Streaming-upload bridges. shareStart reserves a slug via /api/init at
  // record start. sharePartScreen/sharePartWebcam are fire-and-forget; main
  // buffers per stream and POSTs each 5+ MiB part. shareFinish flushes tail
  // bytes + finalizes, returning the edit URL. shareAbort discards in-flight
  // streamer state on cancel/restart/crash.
  shareStart: (meta: ShareStartMeta): Promise<ShareStartResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHARE_START, meta),
  sharePartScreen: (bytes: ArrayBuffer): void =>
    ipcRenderer.send(IPC_CHANNELS.SHARE_PART_SCREEN, bytes),
  sharePartWebcam: (bytes: ArrayBuffer): void =>
    ipcRenderer.send(IPC_CHANNELS.SHARE_PART_WEBCAM, bytes),
  shareFinish: (meta: ShareFinishMeta): Promise<ShareFinishResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHARE_FINISH, meta),
  shareAbort: (): void => ipcRenderer.send(IPC_CHANNELS.SHARE_ABORT),
  shareUploadPoster: (bytes: ArrayBuffer): void =>
    ipcRenderer.send(IPC_CHANNELS.SHARE_UPLOAD_POSTER, bytes),
  // Fired at countdown start so main can run shareStart + system-audio
  // acquisition in parallel with the visible 3 s countdown.
  notifySharePrepStart: (): void => ipcRenderer.send(IPC_CHANNELS.SHARE_PREP_START),
  notifySharePrepCancel: (): void => ipcRenderer.send(IPC_CHANNELS.SHARE_PREP_CANCEL),
  onSharePrepStart: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on(IPC_CHANNELS.SHARE_PREP_START, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHARE_PREP_START, handler)
  },
  onSharePrepCancel: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on(IPC_CHANNELS.SHARE_PREP_CANCEL, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHARE_PREP_CANCEL, handler)
  },
  shareFailureOpen: (state: ShareFailureState): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHARE_FAILURE_OPEN, state),
  onShareFailureInit: (callback: (state: ShareFailureState) => void): (() => void) => {
    const handler = (_: unknown, state: ShareFailureState): void => callback(state)
    ipcRenderer.on(IPC_CHANNELS.SHARE_FAILURE_INIT, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHARE_FAILURE_INIT, handler)
  },
  shareFailureClose: (): void => ipcRenderer.send(IPC_CHANNELS.SHARE_FAILURE_CLOSE),

  // Pro capture gate. Shows a native confirm dialog whose buttons main
  // picks from account state, routing the choice to sign-in / checkout /
  // dashboard.
  showCaptureGateDialog: (reason: UpgradeReason): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.CAPTURE_GATE_OPEN, reason),

  toolbarSetHitRects: (rects: { x: number; y: number; width: number; height: number }[]): void =>
    ipcRenderer.send(IPC_CHANNELS.TOOLBAR_SET_HIT_RECTS, rects),

  toolbarResizeForMode: (mode: 'share' | 'screenshot'): void =>
    ipcRenderer.send(IPC_CHANNELS.TOOLBAR_RESIZE_FOR_MODE, mode),

  captureScreenshot: (
    target:
      | { kind: 'display'; displayId: number }
      | { kind: 'window'; windowId: number }
      | {
          kind: 'area'
          displayId: number
          cropRect: { x: number; y: number; width: number; height: number }
        }
  ): Promise<
    | { ok: true; id: string; viewUrl: string; editUrl: string; localCopyPath: string | null }
    | { ok: false; error: string; code?: string }
  > => ipcRenderer.invoke(IPC_CHANNELS.CAPTURE_SCREENSHOT, target),

  // Snap-notification window bridge: main pushes capture + upload state to
  // the modal window, which sends back action intents (open editor, copy
  // link, close, delete).
  onSnapCaptured: (
    callback: (payload: {
      localPath: string
      sourceTitle: string | null
      width: number
      height: number
    }) => void
  ): (() => void) => {
    const handler = (
      _: unknown,
      payload: { localPath: string; sourceTitle: string | null; width: number; height: number }
    ): void => callback(payload)
    ipcRenderer.on(IPC_CHANNELS.SNAP_CAPTURED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SNAP_CAPTURED, handler)
  },
  onSnapUploadComplete: (
    callback: (payload: { id: string; viewUrl: string; editUrl: string }) => void
  ): (() => void) => {
    const handler = (_: unknown, payload: { id: string; viewUrl: string; editUrl: string }): void =>
      callback(payload)
    ipcRenderer.on(IPC_CHANNELS.SNAP_UPLOAD_COMPLETE, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SNAP_UPLOAD_COMPLETE, handler)
  },
  onSnapUploadFailed: (callback: (payload: { reason: string }) => void): (() => void) => {
    const handler = (_: unknown, payload: { reason: string }): void => callback(payload)
    ipcRenderer.on(IPC_CHANNELS.SNAP_UPLOAD_FAILED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SNAP_UPLOAD_FAILED, handler)
  },
  snapNotificationClose: (): void => ipcRenderer.send(IPC_CHANNELS.SNAP_NOTIFICATION_CLOSE),
  snapOpenEdit: (editUrl: string): void => ipcRenderer.send(IPC_CHANNELS.SNAP_OPEN_EDIT, editUrl),
  snapCopyLink: (viewUrl: string): void => ipcRenderer.send(IPC_CHANNELS.SNAP_COPY_LINK, viewUrl),
  snapDelete: (id: string): void => ipcRenderer.send(IPC_CHANNELS.SNAP_DELETE, id),

  permissionsGranted: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.PERMISSIONS_GRANTED),

  showWebcamBubble: (deviceId: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHOW_WEBCAM_BUBBLE, deviceId),
  hideWebcamBubble: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.HIDE_WEBCAM_BUBBLE),
  softHideWebcamBubble: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SOFT_HIDE_WEBCAM_BUBBLE),
  onWebcamBubbleInit: (callback: (deviceId: string) => void): (() => void) => {
    const handler = (_: unknown, deviceId: string): void => {
      callback(deviceId)
    }
    ipcRenderer.on(IPC_CHANNELS.WEBCAM_BUBBLE_INIT, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.WEBCAM_BUBBLE_INIT, handler)
  },
  onWebcamBubbleRelease: (callback: () => void): (() => void) => {
    const handler = (): void => {
      callback()
    }
    ipcRenderer.on(IPC_CHANNELS.WEBCAM_BUBBLE_RELEASE, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.WEBCAM_BUBBLE_RELEASE, handler)
  },
  onToolbarVisible: (callback: () => void): (() => void) => {
    const handler = (): void => {
      callback()
    }
    ipcRenderer.on('toolbar-visible', handler)
    return () => ipcRenderer.removeListener('toolbar-visible', handler)
  },
  onEditorCloseRequested: (callback: () => void): (() => void) => {
    const handler = (): void => {
      callback()
    }
    ipcRenderer.on('editor-close-requested', handler)
    return () => ipcRenderer.removeListener('editor-close-requested', handler)
  },
  onEditorSaveAndClose: (callback: () => void): (() => void) => {
    const handler = (): void => {
      callback()
    }
    ipcRenderer.on('editor-save-and-close', handler)
    return () => ipcRenderer.removeListener('editor-save-and-close', handler)
  },
  onEditorDeleteAndClose: (callback: () => void): (() => void) => {
    const handler = (): void => {
      callback()
    }
    ipcRenderer.on('editor-delete-and-close', handler)
    return () => ipcRenderer.removeListener('editor-delete-and-close', handler)
  },
  forceCloseEditor: (): void => {
    ipcRenderer.send('editor-force-close')
  },

  requestAccessibility: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.REQUEST_ACCESSIBILITY),

  probeScreenRecordingPermission: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROBE_SCREEN_RECORDING_PERMISSION),

  startNativeRecording: (config: {
    outputDir: string
    displayId?: number
    windowId?: number
    fps?: number
    captureAudio?: boolean
    includeSelfWindows?: boolean
    cropRect?: WindowBounds
    share?: boolean
  }): Promise<{ windowBounds?: WindowBounds; wallClockMs?: number; cornerRadius?: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.START_NATIVE_RECORDING, config),

  stopNativeRecording: (): Promise<{
    path: string
    systemAudioPath: string | null
    duration: number
    width: number
    height: number
  }> => ipcRenderer.invoke(IPC_CHANNELS.STOP_NATIVE_RECORDING),

  pauseNativeRecording: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.PAUSE_NATIVE_RECORDING),

  resumeNativeRecording: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.RESUME_NATIVE_RECORDING),

  isNativeRecordingActive: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.IS_NATIVE_RECORDING_ACTIVE),

  hideWindow: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.HIDE_WINDOW),

  showRecordingOverlay: (opts?: { startedAt?: number; capMs?: number }): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHOW_RECORDING_OVERLAY, opts),

  hideRecordingOverlay: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.HIDE_RECORDING_OVERLAY),

  showRecordingDim: (
    bounds: {
      x: number
      y: number
      width: number
      height: number
    },
    cornerRadius?: number
  ): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.SHOW_RECORDING_DIM, bounds, cornerRadius),

  hideRecordingDim: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.HIDE_RECORDING_DIM),

  onOverlayAction: (callback: (action: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string): void => {
      callback(action)
    }
    ipcRenderer.on('overlay-action', handler)
    return () => ipcRenderer.removeListener('overlay-action', handler)
  },

  onNativeRecorderCrashed: (callback: () => void): (() => void) => {
    const handler = (): void => {
      callback()
    }
    ipcRenderer.on(IPC_CHANNELS.NATIVE_RECORDER_CRASHED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NATIVE_RECORDER_CRASHED, handler)
  },

  showWindow: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.SHOW_WINDOW),

  getActiveWindowSource: (): Promise<CaptureSource | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_ACTIVE_WINDOW_SOURCE),

  onSourceSelected: (callback: (source: CaptureSource) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, source: CaptureSource): void =>
      callback(source)
    ipcRenderer.on(IPC_CHANNELS.SOURCE_SELECTED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SOURCE_SELECTED, handler)
  },

  log: (level: 'info' | 'warn' | 'error', component: string, message: string): void => {
    ipcRenderer.send(IPC_CHANNELS.LOG_FROM_RENDERER, { level, component, message })
  },

  showReleaseNotes: (opts: { force?: boolean } = {}): Promise<ReleaseNotesInitPayload | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHOW_RELEASE_NOTES, opts),

  releaseNotesPending: (): Promise<ReleaseNotesInitPayload | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.RELEASE_NOTES_PENDING),

  markReleaseNotesShown: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.RELEASE_NOTES_MARK_SHOWN),

  // Share-link account. The share-mode record button reads this to decide
  // whether to start recording or open the login modal. Sign-in opens the
  // browser; the captureflow:// deep link completes auth.
  getShareAuth: (): Promise<ShareAuthState> => ipcRenderer.invoke(IPC_CHANNELS.SHARE_AUTH_GET),

  signInShareAuth: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.SHARE_AUTH_SIGN_IN),

  signOutShareAuth: (): Promise<ShareAuthState> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHARE_AUTH_SIGN_OUT),

  onShareAuthChanged: (callback: (state: ShareAuthState) => void): (() => void) => {
    const handler = (_: unknown, state: ShareAuthState): void => callback(state)
    ipcRenderer.on(IPC_CHANNELS.SHARE_AUTH_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHARE_AUTH_CHANGED, handler)
  },

  getShareConnectivity: (): Promise<ShareConnectivityState> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHARE_CONNECTIVITY_GET),

  onShareConnectivityChanged: (callback: (state: ShareConnectivityState) => void): (() => void) => {
    const handler = (_: unknown, state: ShareConnectivityState): void => callback(state)
    ipcRenderer.on(IPC_CHANNELS.SHARE_CONNECTIVITY_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHARE_CONNECTIVITY_CHANGED, handler)
  },

  getShareUsage: (): Promise<ShareUsageState> => ipcRenderer.invoke(IPC_CHANNELS.SHARE_USAGE_GET),

  refreshShareUsage: (): Promise<ShareUsageState> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHARE_USAGE_REFRESH),

  openShareUpgradeCheckout: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHARE_USAGE_OPEN_UPGRADE),

  onShareUsageChanged: (callback: (state: ShareUsageState) => void): (() => void) => {
    const handler = (_: unknown, state: ShareUsageState): void => callback(state)
    ipcRenderer.on(IPC_CHANNELS.SHARE_USAGE_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHARE_USAGE_CHANGED, handler)
  },

  getWorkspaces: (): Promise<WorkspacesState> => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACES_GET),

  refreshWorkspaces: (): Promise<WorkspacesState> =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACES_REFRESH),

  selectWorkspace: (id: string): Promise<WorkspacesState> =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACES_SELECT, id),

  onWorkspacesChanged: (callback: (state: WorkspacesState) => void): (() => void) => {
    const handler = (_: unknown, state: WorkspacesState): void => callback(state)
    ipcRenderer.on(IPC_CHANNELS.WORKSPACES_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.WORKSPACES_CHANGED, handler)
  },

  fitWindowToContent: (opts: { width?: number; height: number }): void => {
    ipcRenderer.send(IPC_CHANNELS.FIT_WINDOW_TO_CONTENT, opts)
  },

  requestMediaPermission: (kind: 'camera' | 'microphone'): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.REQUEST_MEDIA_PERMISSION, kind),

  onPermissionDialogInit: (
    callback: (payload: import('../shared/types').PermissionDialogInitPayload) => void
  ): (() => void) => {
    const handler = (
      _: unknown,
      payload: import('../shared/types').PermissionDialogInitPayload
    ): void => {
      callback(payload)
    }
    ipcRenderer.on(IPC_CHANNELS.PERMISSION_DIALOG_INIT, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.PERMISSION_DIALOG_INIT, handler)
  },

  respondToPermissionDialog: (allow: boolean): void => {
    ipcRenderer.send(IPC_CHANNELS.PERMISSION_DIALOG_RESPOND, allow)
  },

  sendEditorReady: (): void => ipcRenderer.send('editor-ready'),

  openSelectionOverlay: (
    mode: SelectionOverlayMode,
    devices: { hasCamera: boolean; hasMic: boolean },
    includeSelf = false
  ): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_SELECTION_OVERLAY, mode, devices, includeSelf),

  closeSelectionOverlay: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.CLOSE_SELECTION_OVERLAY),

  getWindowAtPoint: (x: number, y: number): Promise<WindowAtPoint> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_WINDOW_AT_POINT, x, y),

  focusAppByPid: (pid?: number): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.FOCUS_APP_BY_PID, pid),

  applyRecordingDisplayMode: (opts: { hideDesktopIcons: boolean }): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.APPLY_RECORDING_DISPLAY_MODE, opts),

  restoreRecordingDisplayMode: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.RESTORE_RECORDING_DISPLAY_MODE),

  onSelectionOverlayInit: (
    callback: (data: {
      mode: SelectionOverlayMode
      displayName: string
      displayWidth: number
      displayHeight: number
      displayRefreshRate: number
      sources: CaptureSource[]
      hasCamera: boolean
      hasMic: boolean
    }) => void
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      data: {
        mode: SelectionOverlayMode
        displayName: string
        displayWidth: number
        displayHeight: number
        displayRefreshRate: number
        sources: CaptureSource[]
        hasCamera: boolean
        hasMic: boolean
      }
    ): void => callback(data)
    ipcRenderer.on(IPC_CHANNELS.SELECTION_OVERLAY_INIT, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SELECTION_OVERLAY_INIT, handler)
  },

  onSelectionOverlaySources: (callback: (sources: CaptureSource[]) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, sources: CaptureSource[]): void =>
      callback(sources)
    ipcRenderer.on(IPC_CHANNELS.SELECTION_OVERLAY_SOURCES, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SELECTION_OVERLAY_SOURCES, handler)
  },

  sendSelectionResult: (source: CaptureSource): void =>
    ipcRenderer.send(IPC_CHANNELS.SELECTION_OVERLAY_RESULT, source),

  onSelectionOverlayCancelled: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on(IPC_CHANNELS.SELECTION_OVERLAY_CANCELLED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SELECTION_OVERLAY_CANCELLED, handler)
  },

  onSelectionOverlayReset: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on(IPC_CHANNELS.SELECTION_OVERLAY_RESET, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SELECTION_OVERLAY_RESET, handler)
  },

  onAutoStartRecording: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on('auto-start-recording', handler)
    return () => ipcRenderer.removeListener('auto-start-recording', handler)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error — fallback assigns to Window when contextIsolation is off
  window.electronAPI = electronAPI
}
