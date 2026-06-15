export type CaptureSource = {
  id: string
  name: string
  thumbnailDataUrl: string
  displayId: string
  windowBounds?: WindowBounds
  // For window sources, the owning application name (e.g. "Google Chrome").
  // Populated by the SelectionOverlay via the native window detector — the
  // standard desktopCapturer API does not expose this.
  ownerName?: string
  // For window sources, the captured top-left corner radius in points.
  // Detected by the native window detector via SCScreenshotManager alpha
  // sampling. The recording dim and selection-overlay highlight both
  // mirror this value so their rounded edges hug the actual chrome.
  cornerRadius?: number
  // For window sources, the OS pid that owns the captured window. Used at
  // recording start to raise the target app so it gains focus when
  // CaptureFlow's toolbar hides (otherwise the dock auto-shows and the
  // previously-frontmost app keeps focus).
  pid?: number
  // Display-only toggle (set by the selection overlay's display picker).
  // When true, recording start hides desktop icons via Finder; recording
  // stop restores them. Other capture modes ignore this flag.
  hideDesktopIcons?: boolean
}

export type WindowBounds = {
  x: number
  y: number
  width: number
  height: number
}

export function isWindowSource(source: CaptureSource): boolean {
  return source.id.startsWith('window:')
}

export function getWindowId(source: CaptureSource): number | undefined {
  if (!isWindowSource(source)) return undefined
  return parseInt(source.id.split(':')[1], 10)
}

// Parses the numeric display id out of a CaptureSource. `source.displayId`
// is the canonical store (a string from desktopCapturer); we extract the
// integer for the native sidecar's snapshot mode. Returns undefined for
// window sources or malformed ids.
export function getDisplayId(source: CaptureSource): number | undefined {
  if (!source.displayId) return undefined
  const n = parseInt(source.displayId, 10)
  return Number.isFinite(n) ? n : undefined
}

// ── Toolbar Constants ──

export const TOOLBAR_WIDTH = 750
// Narrower toolbar variant used in Screenshot mode. The cam/mic/sound
// device cells are hidden (snapshot capture doesn't pipe audio or
// camera), so the bar shrinks to just the source picker + drag handle.
// Main resizes the BrowserWindow on mode change via RESIZE_TOOLBAR IPC,
// re-centring against the previous bounds so the bar doesn't jump
// horizontally during the animation. Sized to hug the visible content
// (close × + Display · Window · Area + grip handle) so the bar
// doesn't carry an obvious empty gap between Area and the drag dots.
export const TOOLBAR_WIDTH_SCREENSHOT = 320
export function toolbarWidthForMode(mode: RecordingMode): number {
  return mode === 'screenshot' ? TOOLBAR_WIDTH_SCREENSHOT : TOOLBAR_WIDTH
}
// Bar itself stays 50px; window is taller to fit the Share / Screenshot
// mode pill that floats above the bar's top-right corner.
export const TOOLBAR_BAR_HEIGHT = 50
// Reserved band BELOW the bar so the control tooltips (placement="bottom")
// have room to paint without clipping against the window's edge.
export const TOOLBAR_TOOLTIP_BELOW = 48
// Total renderer window height: top headroom (status / mode pills) + the
// 50px bar + the bottom tooltip band. Main pins the bar's visible position
// via TOOLBAR_BAR_BOTTOM_OFFSET + TOOLBAR_TOOLTIP_BELOW, so these values can
// grow without moving the bar on screen.
export const TOOLBAR_HEIGHT = 178
// Vertical distance from the bubble center to the bar's bottom edge —
// the historical anchor (half of the original 96-tall window) that
// keeps the bar pinned in place when TOOLBAR_HEIGHT changes.
export const TOOLBAR_BAR_BOTTOM_OFFSET = 48

export type RecordingMode = 'share' | 'screenshot'

// ── Cursor Tracking ──

export type CursorType =
  | 'arrow'
  | 'pointer'
  | 'text'
  | 'crosshair'
  | 'open-hand'
  | 'closed-hand'
  | 'resize-ew'
  | 'resize-ns'

export type CursorPosition = {
  time: number // ms since recording start
  x: number // normalized 0-1
  y: number // normalized 0-1
  cursorType?: CursorType
}

export type ClickEvent = {
  time: number // ms since recording start
  x: number // normalized 0-1
  y: number // normalized 0-1
}

export type TrackingData = {
  cursor: CursorPosition[]
  clicks?: ClickEvent[]
}

export const IPC_CHANNELS = {
  GET_SOURCES: 'get-sources',
  GET_RECORDINGS_DIR: 'get-recordings-dir',
  SHOW_ITEM_IN_FOLDER: 'show-item-in-folder',
  HIDE_WINDOW: 'hide-window',
  SHOW_WINDOW: 'show-window',
  GET_ACTIVE_WINDOW_SOURCE: 'get-active-window-source',
  SHOW_RECORDING_OVERLAY: 'show-recording-overlay',
  HIDE_RECORDING_OVERLAY: 'hide-recording-overlay',
  RESIZE_WINDOW: 'resize-window',
  SHOW_RECORDING_DIM: 'show-recording-dim',
  HIDE_RECORDING_DIM: 'hide-recording-dim',
  START_CURSOR_TRACKING: 'start-cursor-tracking',
  // Pushed from main on every cursor-tracker tick (~120fps). Carries
  // a CursorPosition that's timestamped relative to the recording's
  // start clock, so the renderer's real-time share composite can
  // look up the position to draw at each frame timestamp without
  // waiting for stopCursorTracking to flush the full array.
  CURSOR_POSITION_EVENT: 'cursor-position-event',
  STOP_CURSOR_TRACKING: 'stop-cursor-tracking',
  PAUSE_CURSOR_TRACKING: 'pause-cursor-tracking',
  RESUME_CURSOR_TRACKING: 'resume-cursor-tracking',
  DELETE_CURRENT_SESSION: 'delete-current-session',
  FILE_EXISTS: 'file-exists',
  GET_PERMISSIONS: 'get-permissions',
  REQUEST_MIC_PERMISSION: 'request-mic-permission',
  REQUEST_CAMERA_PERMISSION: 'request-camera-permission',
  START_NATIVE_RECORDING: 'start-native-recording',
  STOP_NATIVE_RECORDING: 'stop-native-recording',
  PAUSE_NATIVE_RECORDING: 'pause-native-recording',
  RESUME_NATIVE_RECORDING: 'resume-native-recording',
  IS_NATIVE_RECORDING_ACTIVE: 'is-native-recording-active',
  NATIVE_RECORDER_CRASHED: 'native-recorder-crashed',
  OPEN_EXTERNAL: 'open-external',
  REQUEST_ACCESSIBILITY: 'request-accessibility',
  PROBE_SCREEN_RECORDING_PERMISSION: 'probe-screen-recording-permission',
  SOURCE_SELECTED: 'source-selected',
  OPEN_SELECTION_OVERLAY: 'open-selection-overlay',
  SELECTION_OVERLAY_INIT: 'selection-overlay-init',
  SELECTION_OVERLAY_SOURCES: 'selection-overlay-sources',
  SELECTION_OVERLAY_RESULT: 'selection-overlay-result',
  GET_WINDOW_AT_POINT: 'get-window-at-point',
  FOCUS_APP_BY_PID: 'focus-app-by-pid',
  CLOSE_SELECTION_OVERLAY: 'close-selection-overlay',
  SELECTION_OVERLAY_CANCELLED: 'selection-overlay-cancelled',
  SELECTION_OVERLAY_RESET: 'selection-overlay-reset',
  PLAY_SOUND: 'play-sound',
  PERMISSIONS_GRANTED: 'permissions-granted',
  SHOW_WEBCAM_BUBBLE: 'show-webcam-bubble',
  HIDE_WEBCAM_BUBBLE: 'hide-webcam-bubble',
  // Soft variant: just BrowserWindow.hide() without releasing the
  // MediaStream, so re-showing is instant (no getUserMedia restart).
  // Used when toggling between recording modes that don't want the
  // bubble visible (Screenshot) but where keeping the camera warm
  // avoids ~1s of camera-spin-up on toggle back.
  SOFT_HIDE_WEBCAM_BUBBLE: 'soft-hide-webcam-bubble',
  WEBCAM_BUBBLE_INIT: 'webcam-bubble-init',
  WEBCAM_BUBBLE_RELEASE: 'webcam-bubble-release',
  FIT_WINDOW_TO_CONTENT: 'fit-window-to-content',
  REQUEST_MEDIA_PERMISSION: 'request-media-permission',
  PERMISSION_DIALOG_INIT: 'permission-dialog-init',
  PERMISSION_DIALOG_RESPOND: 'permission-dialog-respond',
  LOG_FROM_RENDERER: 'log-from-renderer',
  APPLY_RECORDING_DISPLAY_MODE: 'apply-recording-display-mode',
  RESTORE_RECORDING_DISPLAY_MODE: 'restore-recording-display-mode',
  SHOW_RELEASE_NOTES: 'show-release-notes',
  RELEASE_NOTES_PENDING: 'release-notes-pending',
  RELEASE_NOTES_MARK_SHOWN: 'release-notes-mark-shown',
  SEND_BUG_REPORT: 'send-bug-report',
  GET_USER_PREFS: 'get-user-prefs',
  SET_USER_PREF: 'set-user-pref',
  USER_PREFS_CHANGED: 'user-prefs-changed',
  SHARE_FRAME_EVENT: 'share-frame-event',
  // Loom-style streaming-upload protocol. /api/init fires at record
  // START so the slug exists by stop. Screen (cursor + system audio
  // baked) and webcam (mic audio) stream in parallel as bytes mux.
  // SHARE_FINISH posts final tails + /api/finalize +
  // /api/webcam-finalize, returns the edit URL. SHARE_ABORT discards
  // in-flight state.
  SHARE_START: 'share-start',
  SHARE_PART_SCREEN: 'share-part-screen',
  SHARE_PART_WEBCAM: 'share-part-webcam',
  SHARE_FINISH: 'share-finish',
  SHARE_ABORT: 'share-abort',
  // First composited frame from the share encoder, captured as JPEG.
  // Main posts it to `/api/poster?slug=<active-slug>` so viewer links
  // get an OG/Twitter thumbnail. Fired from the renderer right after
  // SHARE_FINISH; uses the streamer's still-active slug.
  SHARE_UPLOAD_POSTER: 'share-upload-poster',
  // Fired by the SelectionOverlay the moment the user clicks record
  // (countdown begins). Main forwards to the main window's
  // useRecorder hook, which kicks off shareStart + system-audio
  // acquisition in parallel with the visible 3 s countdown so the
  // native recorder can start the instant the countdown ends.
  SHARE_PREP_START: 'share-prep-start',
  SHARE_PREP_CANCEL: 'share-prep-cancel',
  // Open the share edit URL in the user's default browser. Renamed
  // from SHARE_READY_OPEN_LINK; same shape.
  SHARE_READY_OPEN_LINK: 'share-ready-open-link',
  // Failure modal — only surviving in-app share surface. Opens when
  // finalize fails entirely or when a partial upload yields a
  // salvageable URL.
  SHARE_FAILURE_OPEN: 'share-failure-open',
  SHARE_FAILURE_INIT: 'share-failure-init',
  SHARE_FAILURE_CLOSE: 'share-failure-close',
  // Capture gate. Opened from the start toolbar when a capture action
  // needs the user to sign in (or be online) first. Main shows a
  // NATIVE confirm dialog whose buttons depend on account state and
  // routes the chosen button to sign-in / dashboard.
  CAPTURE_GATE_OPEN: 'capture-gate-open',
  // Web-account auth for share-link management. GET → current state.
  // SIGN_IN opens the default browser at the login URL (web returns
  // via the captureflow:// deep link). SIGN_OUT clears the local token.
  // CHANGED fan-outs to every window when the deep-link handler
  // captures a new token (or sign-out wipes one).
  SHARE_AUTH_GET: 'share-auth-get',
  SHARE_AUTH_SIGN_IN: 'share-auth-sign-in',
  SHARE_AUTH_SIGN_OUT: 'share-auth-sign-out',
  SHARE_AUTH_CHANGED: 'share-auth-changed',
  // Reachability of the share backend. Separate from auth state
  // because a signed-in user can still be offline — the lock icon
  // needs to appear in either case.
  SHARE_CONNECTIVITY_GET: 'share-connectivity-get',
  SHARE_CONNECTIVITY_CHANGED: 'share-connectivity-changed',
  // Per-device storage + active-share usage. Drives the storage chip
  // on the toolbar so a user near their cap sees it up front instead
  // of failing mid-recording.
  SHARE_USAGE_GET: 'share-usage-get',
  SHARE_USAGE_CHANGED: 'share-usage-changed',
  SHARE_USAGE_REFRESH: 'share-usage-refresh',
  SHARE_USAGE_OPEN_UPGRADE: 'share-usage-open-upgrade',
  // Workspaces the user belongs to (owner + invited team) — populates
  // the workspace switcher chip on the recording toolbar. GET returns
  // a snapshot, REFRESH re-fetches, SELECT changes the active target
  // (persisted in userData), CHANGED fans out whenever the list or
  // active id changes.
  WORKSPACES_GET: 'workspaces-get',
  WORKSPACES_REFRESH: 'workspaces-refresh',
  WORKSPACES_SELECT: 'workspaces-select',
  WORKSPACES_CHANGED: 'workspaces-changed',
  // Renderer → main: publish the union of window-local hit rects that
  // should capture mouse input on the toolbar BrowserWindow. The
  // window itself is much taller than the visible bar (mode-toggle
  // pill + tooltip headroom live above the bar), so its transparent
  // areas would otherwise eat clicks meant for whatever app sits
  // underneath. Main polls `screen.getCursorScreenPoint()` at ~60 Hz
  // against these rects and toggles `setIgnoreMouseEvents` directly —
  // no renderer mousemove, no IPC race on focus/activate. Renderer
  // re-publishes whenever layout changes (mount, status flip, mode
  // change).
  TOOLBAR_SET_HIT_RECTS: 'toolbar-set-hit-rects',
  // Renderer → main: resize the recording-toolbar BrowserWindow to a
  // new width. Used when the mode toggle flips to/from Screenshot, so
  // the bar visibly shrinks (mode === 'screenshot') or expands back
  // (share). Main re-centres the new bounds against the previous x
  // position so the bar doesn't jump horizontally.
  TOOLBAR_RESIZE_FOR_MODE: 'toolbar-resize-for-mode',
  // Screenshot capture pipeline. Renderer (selection overlay) →
  // main when the user clicks a Display / Window thumbnail or
  // finalises an Area drag while in screenshot mode. Main spawns
  // the native sidecar in snapshot mode, copies the PNG to the
  // clipboard, saves it to ~/Pictures/CaptureFlow/Snaps/, plays the
  // shutter sound, and uploads it. Replaces the recording-start path
  // entirely for this mode.
  CAPTURE_SCREENSHOT: 'capture-screenshot',
  // Main → snap-notification window. Fires after the native capture
  // finishes locally (modal appears with a thumbnail and "Uploading…"
  // state). A second message follows with the upload result.
  SNAP_CAPTURED: 'snap-captured',
  SNAP_UPLOAD_COMPLETE: 'snap-upload-complete',
  SNAP_UPLOAD_FAILED: 'snap-upload-failed',
  // Snap-notification window → main. User actions inside the bottom-
  // right modal.
  SNAP_NOTIFICATION_CLOSE: 'snap-notification-close',
  SNAP_OPEN_EDIT: 'snap-open-edit',
  SNAP_COPY_LINK: 'snap-copy-link',
  SNAP_DELETE: 'snap-delete'
} as const

// Renderer-safe view of the local share account state. Never carries
// the raw bearer token — main keeps that for outbound /api/init calls.
export type ShareAuthState =
  | { kind: 'signed_out' }
  | {
      kind: 'signed_in'
      tokenId: string
      label: string | null
      email: string | null
    }

// Whether the share backend is currently reachable. Updated by
// validateShareAuth (its periodic /api/auth/check fetch doubles as a
// connectivity probe) and by share-error-handler when a streaming
// upload TypeErrors out mid-flow. The renderer combines this with
// auth state to decide whether the record button is locked.
export type ShareConnectivityState = 'online' | 'offline'

// Per-device storage + active-share usage snapshot. `kind: 'unknown'`
// is the boot state before the first /api/usage probe lands — the
// renderer treats it as "no lock yet" so a slow network doesn't flash
// the upgrade modal on every launch. Refreshed at app start, when
// share-auth changes, when /api/init succeeds or returns
// `storage_limit`, and whenever the selection overlay opens.
export type ShareUsageState =
  | { kind: 'unknown' }
  | {
      kind: 'known'
      usedBytes: number
      limitBytes: number
      activeCount: number
      activeLimit: number
      capReached: boolean
      isDev: boolean
      // Mirrors the boolean /api/usage returns — tells the toolbar to
      // paint a Pro pill next to the storage chip when the signed-in
      // account has an active subscription. False (or absent on legacy
      // cached state) means the account is on the free tier.
      proSubscriptionActive: boolean
      checkedAt: number
    }

// One workspace the bearer user owns or is a member of. Mirrors the
// /api/workspaces response shape on the web app.
export type WorkspaceSummary = {
  id: string
  name: string
  kind: 'personal' | 'team'
  role: 'owner' | 'member'
}

// Renderer-side view of the workspace store. `unknown` is the pre-
// probe state — the chip is hidden until we know what to render so
// a stale paint doesn't flash someone else's workspace name. Signed-
// out accounts collapse back to `unknown` so the chip disappears
// alongside the storage pill.
export type WorkspacesState =
  | { kind: 'unknown' }
  | {
      kind: 'known'
      workspaces: WorkspaceSummary[]
      activeId: string | null
    }

// Persisted user-facing toggles. Written by main process, read by
// renderer via IPC. See src/main/lib/user-prefs.ts for storage.
export type UserPrefs = {
  // Instant link sharing for recordings under the 1-minute cap.
  // Off by default while the feature is in beta.
  shareEnabled: boolean
  // Opt-in usage analytics (PostHog). Off by default — the welcome gate
  // surfaces the toggle so the choice is explicit. Never captures the
  // content of recordings, only anonymous product-usage events.
  analyticsEnabled: boolean
  // Whether the user accepted the Terms of Service + Privacy Policy on the
  // welcome gate. Gates "Accept and Continue"; remembered so a returning user
  // (e.g. after re-granting a revoked permission) isn't asked again.
  termsAccepted: boolean
}

// Events emitted by main → recording window when the native share
// pipeline is active. The native side encodes a downscaled H.264 +
// AAC LC elementary stream and writes length-prefixed records on
// fd 3; main parses them and forwards as one of these events. See
// native/screen-recorder/ShareWriter.swift for the on-wire layout.
export type ShareFrameEvent =
  | {
      kind: 'format'
      codedWidth: number
      codedHeight: number
      fps: number
      // avcC box bytes (length-prefixed SPS/PPS), ready to hand to
      // mp4-muxer's per-chunk decoderConfig.description.
      description: Uint8Array
    }
  | {
      kind: 'chunk'
      type: 'key' | 'delta'
      // Microseconds since the first emitted chunk.
      timestamp: number
      duration: number
      // Length-prefixed NAL units (avc format), ready for
      // muxer.addVideoChunkRaw().
      data: Uint8Array
    }
  | {
      kind: 'audio-format'
      sampleRate: number
      numberOfChannels: number
      // AudioSpecificConfig bytes (the same 2-byte descriptor that
      // sits inside an MP4 esds box). mp4-muxer's audio decoderConfig
      // accepts these verbatim as `description`.
      description: Uint8Array
    }
  | {
      kind: 'audio-chunk'
      // Microseconds since the first audio packet — independent from
      // the video clock; the muxer reconciles them via PTS at write
      // time.
      timestamp: number
      duration: number
      // Raw AAC packet bytes (no ADTS header), ready for
      // muxer.addAudioChunkRaw().
      data: Uint8Array
    }
  | { kind: 'end' }

// ────────────────────────────────────────────────────────────────
// Streaming-upload types — used by the SHARE_START / SHARE_PART_* /
// SHARE_FINISH / SHARE_ABORT IPC surface. The desktop reserves a slug
// at record start, streams screen + webcam parts to /api/part +
// /api/webcam-part as bytes mux, and finalizes both at stop. No local
// share files are written; the web edit page owns everything post-
// upload at <app-web>/shares/<slug>/edit.

// Metadata passed at SHARE_START. width/height start at 0 (native
// hasn't reported yet); main fills them in when /api/init's response
// lands. `title` is the variable bit (window owner / display name);
// main composes the full headline before persisting.
export type ShareStartMeta = {
  title: string | null
  // True when the recording has a camera attached. Drives /api/init's
  // `hasWebcam` flag so the worker reserves a second multipart upload.
  hasWebcam: boolean
}

export type ShareStartResult =
  | { ok: true; slug: string; editUrl: string }
  | { ok: false; error: string; code?: string; status?: number }

// Metadata passed at SHARE_FINISH. totalBytes is the sum of screen
// parts so the worker can validate against the per-share size cap;
// `durationMs` updates the share row for the viewer's metadata.
// `webcamTotalBytes` is only meaningful when SHARE_START.hasWebcam
// was true.
export type ShareFinishMeta = {
  durationMs: number
  screenTotalBytes: number
  webcamTotalBytes?: number
}

// `url` is the app-web edit URL the renderer opens in the default
// browser on success. On partial failure, `partialUrl` is the URL
// that does exist (the worker finalized whatever parts landed); on
// total failure, no URL is present.
export type ShareFinishResult =
  | { ok: true; slug: string; url: string }
  | {
      ok: false
      error: string
      code?: string
      status?: number
      partialUrl?: string
    }

// Failure modal state. `kind` distinguishes whether we have a
// salvageable link to surface alongside the error.
export type ShareFailureKind = 'no-link' | 'partial' | 'init-failed'

export type ShareFailureState = {
  kind: ShareFailureKind
  message: string
  url?: string
}

// Which capability triggered the capture/upgrade gate — drives the
// dialog's headline/copy. 'cloud' is a generic catch-all.
export type UpgradeReason = 'share' | 'screenshot' | 'cloud'

export type BugReportPayload = {
  description: string
  email?: string
}

export type BugReportResult = { ok: true } | { ok: false; error: string }

export type SelectionOverlayMode = 'display' | 'window' | 'area'

export type WindowAtPoint = {
  id: number
  name: string
  owner: string
  pid: number
  bounds: WindowBounds
  cornerRadius?: number
  iconBase64?: string
} | null

export type ReleaseNotesInitPayload = {
  version: string
  message: string
  detail: string
}

export type PermissionDialogInitPayload = {
  kind: 'camera' | 'microphone'
  variant: 'first-time' | 'denied'
}
