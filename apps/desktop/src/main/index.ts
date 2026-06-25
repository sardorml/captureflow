import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  protocol,
  nativeImage,
  screen,
  session,
  Tray,
  Menu,
  Notification,
} from "electron";
import { join } from "path";
import { createReadStream, statSync } from "fs";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import {
  IPC_CHANNELS,
  TOOLBAR_WIDTH,
  TOOLBAR_HEIGHT,
  TOOLBAR_BAR_BOTTOM_OFFSET,
  TOOLBAR_TOOLTIP_BELOW,
  type SelectionOverlayMode,
} from "../shared/types";
import iconDev from "../../resources/icon-dev.png?asset";
import trayIconPath from "../../resources/trayIcon.png?asset";
import { getSources, getAllPermissions } from "./capture";
import {
  focusAppByPid,
  focusTopmostApp,
  getWindowAtPoint,
  warmWindowDetector,
} from "./window-detector";
import { registerRecordingHandlers } from "./ipc/recording-handlers";
import { registerRecordingStreamHandlers } from "./ipc/recording-stream-handlers";
import {
  ensureOverlayWindow,
  registerWindowHandlers,
} from "./ipc/window-handlers";
import { registerSystemHandlers } from "./ipc/system-handlers";
import { registerRecordingAuthHandlers } from "./ipc/recording-auth-handlers";
import {
  loadRecordingAuth,
  validateRecordingAuth,
} from "./lib/recording/recording-auth";
import { refreshRecordingUsage } from "./lib/recording/recording-usage";
import {
  loadWorkspaces,
  refreshWorkspaces,
} from "./lib/recording/recording-workspaces";
import { handleDeepLinkUrl } from "./lib/recording/recording-auth-deeplink";
import {
  isNativeRecordingActive,
  stopNativeRecording,
} from "./native-recorder";
import {
  captureSnapshot,
  deleteTempScreenshot,
  type ScreenshotTarget,
} from "./lib/screenshot-capture";
import { uploadScreenshot } from "./lib/screenshot-upload";
import {
  closeScreenshotNotificationWindow,
  ensureScreenshotNotificationWindow,
  resizeScreenshotNotificationToAspect,
  sendScreenshotCaptured,
  sendScreenshotUploadComplete,
  sendScreenshotUploadFailed,
} from "./lib/screenshot-notification-window";
import { logInfo, logWarn, logError, getLogDirPath } from "./lib/logger";
import { loadUserPrefs } from "./lib/user-prefs";
import { loadDeviceId } from "./lib/device-id";
import { initAutoUpdater } from "./lib/auto-updater";
// Side-effect import: registers the recording-failure modal's IPC handler.
// The open call lives in recording-stream-handlers when an upload can't recover.
import "./lib/recording/recording-failure-window";
// Side-effect import: registers the CAPTURE_GATE_OPEN IPC handler.
import "./lib/capture-gate-dialog";
import {
  getPendingReleaseNote,
  markReleaseNotesShown,
} from "./lib/release-notes";
import {
  applyRecordingDisplayMode,
  hasActiveDisplayModeOverrides,
  restoreRecordingDisplayMode,
} from "./lib/macos-display-mode";

// Register custom protocol as privileged (must be before app.whenReady)
protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true,
    },
  },
]);

let appIsReady = false;

/*
 * Register the `captureflow://` custom URL scheme so macOS hands deep
 * links from the browser back to us. The actual `open-url` callback
 * (below) buffers early URLs until app.whenReady has finished.
 */
app.setAsDefaultProtocolClient("captureflow");

const pendingDeepLinks: string[] = [];
/*
 * Returns true for a `captureflow://record` link, having surfaced the
 * recording toolbar; anything else falls through to the auth deep-link
 * handler. Lives inline because it needs this file's module-scoped
 * recordingWindow reference and isNativeRecording guard.
 */
function tryHandleRecordDeepLink(rawUrl: string): boolean {
  if (typeof rawUrl !== "string") return false;
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  // macOS / Chromium parse custom-scheme URLs inconsistently as host vs.
  // path, so accept both `captureflow://record` and `captureflow:///record`.
  const key = `${parsed.host}${parsed.pathname}`.replace(/\/+/g, "/");
  if (key !== "record" && key !== "/record") return false;
  showRecordingWindowFromTray();
  return true;
}
app.on("open-url", (event, url) => {
  event.preventDefault();
  if (!appIsReady) {
    pendingDeepLinks.push(url);
    return;
  }
  if (tryHandleRecordDeepLink(url)) return;
  handleDeepLinkUrl(url).catch((err) =>
    logError("recording-auth", `open-url ${url.slice(0, 64)} failed: ${err}`),
  );
});

let recordingWindow: BrowserWindow | null = null;
let permissionsWindow: BrowserWindow | null = null;
let selectionOverlayWindow: BrowserWindow | null = null;
// Dev-only: when true, the window-picker's hover detector won't filter out
// CaptureFlow's own windows, so devs can pick the editor as a recording target.
let overlayIncludeSelfWindows = false;
let tray: Tray | null = null;

// Shared by the tray's "New Recording" item and the `captureflow://record`
// deep link: surface the recording toolbar. If a recording is already
// running, bail with a notification rather than yank the toolbar over it.
function showRecordingWindowFromTray(): void {
  if (isNativeRecordingActive()) {
    new Notification({
      title: "Recording in progress",
      body: "Stop the current recording before starting a new one.",
    }).show();
    return;
  }
  // The welcome gate must be accepted before anything else — surface it
  // instead of the toolbar if it's still open.
  if (permissionsWindow && !permissionsWindow.isDestroyed()) {
    permissionsWindow.focus();
    app.focus({ steal: true });
    return;
  }
  if (!recordingWindow || recordingWindow.isDestroyed()) {
    createWindow();
  } else {
    recordingWindow.show();
    recordingWindow.focus();
  }
  // show() alone doesn't activate the app on macOS when the request came
  // from open-url, so the toolbar would stay buried behind the browser.
  app.focus({ steal: true });
}

function refreshTrayMenu(): void {
  if (!tray) return;
  const trayMenu = Menu.buildFromTemplate([
    {
      label: "New Recording",
      click: showRecordingWindowFromTray,
    },
    {
      label: "Manage shareable links",
      click: () => {
        // The dashboard's own auth gate signs the user in and exposes
        // their recording list, so no per-device routing is needed here.
        const base =
          process.env.CAPTUREFLOW_APP_WEB_BASE ?? "https://captureflow.xyz";
        shell
          .openExternal(base)
          .catch((err) => logError("app", `failed to open dashboard: ${err}`));
      },
    },
    { type: "separator" },
    { label: "Quit CaptureFlow", click: () => app.quit() },
  ]);
  tray.setContextMenu(trayMenu);
}

let webcamBubbleWindow: BrowserWindow | null = null;

// Bubble window geometry — also referenced by the toolbar so the start
// toolbar can spawn vertically centered with the bubble.
const WEBCAM_BUBBLE_SIZE = 240;
const WEBCAM_BUBBLE_EDGE_PADDING = 24;

// RESET clears the overlay renderer's mode-component state so hover/lock
// from the previous session can't flash on the next open. Sent before
// hide() while the renderer is still live.
//
// hide() is deferred ~80 ms so React commits the cleared state to the
// WebContents framebuffer first. Hidden BrowserWindows preserve their
// LAST paint, so without the delay re-opening the picker shows the stale
// countdown digit until React re-renders. (The countdown hook's own
// RAF-wait covers the success path; this covers cancel.)
function hideSelectionOverlay(): void {
  if (!selectionOverlayWindow || selectionOverlayWindow.isDestroyed()) return;
  selectionOverlayWindow.webContents.send(IPC_CHANNELS.SELECTION_OVERLAY_RESET);
  if (!selectionOverlayWindow.isVisible()) return;
  // Capture the ref locally — the window can be destroyed during the delay
  // (e.g. user quits CaptureFlow).
  const win = selectionOverlayWindow;
  setTimeout(() => {
    if (win && !win.isDestroyed() && win.isVisible()) win.hide();
  }, 80);
}

function cancelSelectionOverlay(): void {
  hideSelectionOverlay();
  if (recordingWindow && !recordingWindow.isDestroyed()) {
    recordingWindow.webContents.send(IPC_CHANNELS.SELECTION_OVERLAY_CANCELLED);
  }
}

function hasAllPermissions(): boolean {
  const perms = getAllPermissions();
  return perms.screen === "granted" && perms.accessibility;
}

export function openPermissionDialogWindow(
  owner: BrowserWindow,
  payload: import("../shared/types").PermissionDialogInitPayload,
): Promise<boolean> {
  return new Promise((resolve) => {
    const dialogWin = new BrowserWindow({
      // No parent/modal: macOS sheet-attaches modal child windows to the
      // parent's title region, which collides with our frameless toolbar.
      // Use alwaysOnTop instead so the dialog can't get lost behind it.
      movable: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      roundedCorners: true,
      hasShadow: true,
      vibrancy: "hud",
      visualEffectState: "active",
      transparent: true,
      backgroundColor: "#00000000",
      alwaysOnTop: true,
      skipTaskbar: true,
      center: true,
      width: 260,
      height: 260,
      show: false,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false,
      },
    });

    let settled = false;
    const settle = (allow: boolean): void => {
      if (settled) return;
      settled = true;
      ipcMain.removeListener(
        IPC_CHANNELS.PERMISSION_DIALOG_RESPOND,
        respondHandler,
      );
      if (!dialogWin.isDestroyed()) dialogWin.destroy();
      resolve(allow);
    };

    const respondHandler = (
      event: Electron.IpcMainEvent,
      allow: boolean,
    ): void => {
      if (BrowserWindow.fromWebContents(event.sender) !== dialogWin) return;
      settle(allow);
    };
    ipcMain.on(IPC_CHANNELS.PERMISSION_DIALOG_RESPOND, respondHandler);

    dialogWin.on("closed", () => settle(false));
    owner.once("closed", () => settle(false));

    dialogWin.webContents.once("did-finish-load", () => {
      dialogWin.webContents.send(IPC_CHANNELS.PERMISSION_DIALOG_INIT, payload);
      // Re-center on the display containing the owner window so the dialog
      // doesn't appear on a different monitor than the toolbar.
      const ownerBounds = owner.getBounds();
      const display = screen.getDisplayMatching(ownerBounds);
      const [w, h] = dialogWin.getSize();
      const x = Math.round(
        display.workArea.x + (display.workArea.width - w) / 2,
      );
      const y = Math.round(
        display.workArea.y + (display.workArea.height - h) / 2,
      );
      dialogWin.setBounds({ x, y, width: w, height: h });
      dialogWin.show();
      dialogWin.focus();
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      dialogWin.loadURL(
        `${process.env["ELECTRON_RENDERER_URL"]}?view=permission-dialog`,
      );
    } else {
      dialogWin.loadFile(join(__dirname, "../renderer/index.html"), {
        search: "view=permission-dialog",
      });
    }
  });
}

function createSelectionOverlayWindow(): void {
  if (selectionOverlayWindow && !selectionOverlayWindow.isDestroyed()) return;

  const display = screen.getPrimaryDisplay();

  selectionOverlayWindow = new BrowserWindow({
    width: display.size.width,
    height: display.size.height,
    x: display.bounds.x,
    y: display.bounds.y,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    enableLargerThanScreen: true,
    type: "panel",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  selectionOverlayWindow.setVisibleOnAllWorkspaces(true);
  selectionOverlayWindow.setAlwaysOnTop(true, "screen-saver", 2);

  selectionOverlayWindow.webContents.on(
    "before-input-event",
    (_event, input) => {
      if (
        input.key === "Escape" &&
        selectionOverlayWindow &&
        !selectionOverlayWindow.isDestroyed()
      ) {
        cancelSelectionOverlay();
      }
    },
  );

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    selectionOverlayWindow.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"]}#/selection-overlay`,
    );
  } else {
    selectionOverlayWindow.loadFile(join(__dirname, "../renderer/index.html"), {
      hash: "/selection-overlay",
    });
  }

  selectionOverlayWindow.on("closed", () => {
    selectionOverlayWindow = null;
  });
}

function openSelectionOverlay(
  mode: SelectionOverlayMode,
  devices: { hasCamera: boolean; hasMic: boolean } = {
    hasCamera: false,
    hasMic: false,
  },
  includeSelf = false,
): void {
  overlayIncludeSelfWindows = includeSelf;

  if (!selectionOverlayWindow || selectionOverlayWindow.isDestroyed()) {
    createSelectionOverlayWindow();
  }

  // Window mode queries getWindowAtPoint on every cursor move — spawn the
  // detector subprocess up front so the first hover query doesn't pay the
  // cold-start cost.
  if (mode === "window") {
    warmWindowDetector();
  }

  // Open the overlay on whichever display the user moved the toolbar to —
  // not blindly the primary display. Falls back to primary if the toolbar
  // hasn't been created yet.
  const display =
    recordingWindow && !recordingWindow.isDestroyed()
      ? screen.getDisplayMatching(recordingWindow.getBounds())
      : screen.getPrimaryDisplay();
  const win = selectionOverlayWindow!;

  // Reposition to match the current display in case the layout changed.
  win.setBounds({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.size.width,
    height: display.size.height,
  });

  // Init with an empty source list and show immediately — the dim
  // background must appear instantly for hover/click to feel responsive.
  // Sources arrive via a follow-up message because getSources can take
  // 150-300ms with thumbnails, which would otherwise delay the open.
  const initData = {
    mode,
    displayName: display.label || `Display ${display.id}`,
    displayWidth: display.size.width,
    displayHeight: display.size.height,
    displayRefreshRate: Math.round(display.displayFrequency || 60),
    sources: [] as Awaited<ReturnType<typeof getSources>>,
    hasCamera: devices.hasCamera,
    hasMic: devices.hasMic,
  };
  const sendInitAndShow = (): void => {
    win.webContents.send(IPC_CHANNELS.SELECTION_OVERLAY_INIT, initData);
    if (selectionOverlayWindow && !selectionOverlayWindow.isDestroyed()) {
      selectionOverlayWindow.show();
    }
  };
  if (!win.webContents.isLoading()) {
    sendInitAndShow();
  } else {
    win.webContents.once("did-finish-load", sendInitAndShow);
  }

  // Sources are needed when the user clicks "Start recording" to map their
  // selection back to a CaptureSource. Fetch in parallel and push when ready.
  void getSources().then((sources) => {
    if (!selectionOverlayWindow || selectionOverlayWindow.isDestroyed()) return;
    selectionOverlayWindow.webContents.send(
      IPC_CHANNELS.SELECTION_OVERLAY_SOURCES,
      sources,
    );
  });

  // Refresh storage-cap state while the user picks a source, so the lock
  // clears before Start if they freed up room on captureflow.xyz.
  void refreshRecordingUsage();
  // Refresh the workspace list so an invite accepted on the web while
  // CaptureFlow was open shows up in the chip without a restart.
  void refreshWorkspaces();
}

function createPermissionsWindow(): void {
  if (permissionsWindow && !permissionsWindow.isDestroyed()) {
    permissionsWindow.focus();
    return;
  }

  permissionsWindow = new BrowserWindow({
    width: 560,
    // Tall enough for the header, three permission/usage rows, and the
    // ToS/Privacy agreement + "Accept and Continue" footer.
    height: 800,
    show: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 14, y: 14 },
    backgroundColor: "#080808",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  // The welcome gate owns the screen until the user accepts — never let the
  // recording toolbar show behind it.
  if (
    recordingWindow &&
    !recordingWindow.isDestroyed() &&
    recordingWindow.isVisible()
  ) {
    recordingWindow.hide();
  }

  permissionsWindow.once("ready-to-show", () => {
    permissionsWindow?.show();
  });

  permissionsWindow.on("closed", () => {
    permissionsWindow = null;
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    permissionsWindow.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"]}#/permissions`,
    );
  } else {
    permissionsWindow.loadFile(join(__dirname, "../renderer/index.html"), {
      hash: "/permissions",
    });
  }
}

function createWindow(): void {
  // Spawn on whichever display the cursor is currently on, so the toolbar
  // appears where the user is working — not blindly on the primary display.
  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const toolbarWidth = TOOLBAR_WIDTH;
  const toolbarHeight = TOOLBAR_HEIGHT;
  // Pin the bar's bottom edge a fixed distance below the bubble center
  // (TOOLBAR_BAR_BOTTOM_OFFSET). That keeps the visible bar in the same
  // place regardless of TOOLBAR_HEIGHT — the window height above the bar
  // hosts the status pills, and the TOOLBAR_TOOLTIP_BELOW band beneath the
  // bar hosts the (placement="bottom") control tooltips. Adding the bottom
  // band back in keeps the bar at the same screen position.
  const bubbleCenterY =
    display.workArea.y +
    display.workArea.height -
    WEBCAM_BUBBLE_EDGE_PADDING -
    WEBCAM_BUBBLE_SIZE / 2;
  const toolbarY = Math.round(
    bubbleCenterY +
      TOOLBAR_BAR_BOTTOM_OFFSET -
      toolbarHeight +
      TOOLBAR_TOOLTIP_BELOW,
  );

  // Window stays locked to the full toolbar width. The screenshot-mode
  // "shrink" is purely a CSS animation on the bar div inside the
  // renderer (see RecordingToolbar.tsx) — anchored to the right of
  // the window so the mode-toggle pill above it never has to move.
  // Doing it natively via setBounds caused a 1–2 frame jitter on
  // the pill because the renderer's repaint and the windowserver's
  // frame animation don't recording a clock.
  recordingWindow = new BrowserWindow({
    width: toolbarWidth,
    height: toolbarHeight,
    x: Math.round(
      display.workArea.x + (display.workArea.width - toolbarWidth) / 2,
    ),
    y: toolbarY,
    // Title surfaces in Mission Control / App Exposé / window-listing
    // gestures. Without it the OS reads the default electron-vite
    // <title>Electron</title> until the renderer paints, which leaves
    // the toolbar labeled "Electron" in the swipe-up view.
    title: "CaptureFlow",
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    minWidth: toolbarWidth,
    maxWidth: toolbarWidth,
    minHeight: toolbarHeight,
    maxHeight: toolbarHeight,
    roundedCorners: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  recordingWindow.setVisibleOnAllWorkspaces(true);
  recordingWindow.setAlwaysOnTop(true, "screen-saver", 3);
  recordingWindow.webContents.setBackgroundThrottling(false);
  // No window-level cornerRadius — the renderer paints two distinct pills
  // (mode toggle on top, toolbar bar on bottom) inside this transparent
  // window and rounds each via CSS. A single masksToBounds round here
  // would clip both pills to the window's outer rounded rect.

  recordingWindow.on("ready-to-show", () => {
    recordingWindow?.setBounds({
      width: toolbarWidth,
      height: toolbarHeight,
      x: Math.round(
        display.workArea.x + (display.workArea.width - toolbarWidth) / 2,
      ),
      y: toolbarY,
    });
    // The window is taller than the visible bar (mode-toggle pill +
    // tooltip headroom live above the bar) so its bounds include a
    // lot of transparent area that would otherwise eat clicks meant
    // for whatever app sits underneath. Start in ignore-mouse with
    // `forward: true`; the cursor-poll below flips it off whenever
    // the global cursor is inside the renderer-published hit rects.
    recordingWindow?.setIgnoreMouseEvents(true, { forward: true });
    recordingWindow?.show();
    startToolbarHitPoll();
  });

  recordingWindow.on("closed", () => {
    stopToolbarHitPoll();
    toolbarHitRects = [];
    hideSelectionOverlay();
    if (webcamBubbleWindow && !webcamBubbleWindow.isDestroyed()) {
      webcamBubbleWindow.close();
    }
    recordingWindow = null;
  });

  recordingWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    recordingWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    recordingWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// Toolbar click-through is driven by a main-side cursor poll, not by
// renderer mousemove. The renderer pushes the union of window-local
// rects that should capture input (the bar + the mode pill); main
// polls `screen.getCursorScreenPoint()` at ~60 Hz and flips
// `setIgnoreMouseEvents` only when the in/out state actually changes.
//
// Why this lives in main: on Dock-click / ⌘-Tab the toolbar window
// can regain focus before the renderer ever sees a mousemove, so a
// renderer-driven toggle leaves the window in ignore-mouse mode and
// the first click passes through to whatever sits underneath.
// Polling from main owns the cursor authoritatively — no IPC race.
type HitRect = { x: number; y: number; width: number; height: number };
let toolbarHitRects: HitRect[] = [];
let toolbarHitPollTimer: NodeJS.Timeout | null = null;
let toolbarLastIgnore: boolean | null = null;

function pointInRects(px: number, py: number, rects: HitRect[]): boolean {
  for (const r of rects) {
    if (px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height) {
      return true;
    }
  }
  return false;
}

function pollToolbarHit(): void {
  if (!recordingWindow || recordingWindow.isDestroyed()) return;
  if (!recordingWindow.isVisible()) return;
  const cursor = screen.getCursorScreenPoint();
  const bounds = recordingWindow.getBounds();
  const localX = cursor.x - bounds.x;
  const localY = cursor.y - bounds.y;
  const inside =
    localX >= 0 &&
    localY >= 0 &&
    localX <= bounds.width &&
    localY <= bounds.height &&
    pointInRects(localX, localY, toolbarHitRects);
  const ignore = !inside;
  if (ignore === toolbarLastIgnore) return;
  toolbarLastIgnore = ignore;
  recordingWindow.setIgnoreMouseEvents(
    ignore,
    ignore ? { forward: true } : undefined,
  );
}

function startToolbarHitPoll(): void {
  if (toolbarHitPollTimer) return;
  // ~60 Hz. Each tick is one cursor read + one rect check; the
  // setIgnoreMouseEvents call only fires on state transitions.
  toolbarHitPollTimer = setInterval(pollToolbarHit, 16);
}

function stopToolbarHitPoll(): void {
  if (toolbarHitPollTimer) {
    clearInterval(toolbarHitPollTimer);
    toolbarHitPollTimer = null;
  }
  toolbarLastIgnore = null;
}

ipcMain.on(IPC_CHANNELS.TOOLBAR_SET_HIT_RECTS, (_event, rects: HitRect[]) => {
  if (!Array.isArray(rects)) return;
  toolbarHitRects = rects
    .filter(
      (r) =>
        r &&
        typeof r.x === "number" &&
        typeof r.y === "number" &&
        typeof r.width === "number" &&
        typeof r.height === "number" &&
        r.width > 0 &&
        r.height > 0,
    )
    .map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height }));
  // Re-run the poll immediately so a layout change (mode flip, status
  // change) takes effect on the next frame rather than the next tick.
  pollToolbarHit();
});

// No-op kept for backwards compat with the preload bridge. The bar's
// visual width is now driven by a CSS animation in the renderer
// (RecordingToolbar.tsx), with the bar wrapped in a right-anchored
// flex container so the mode-toggle pill above never shifts.
ipcMain.on(IPC_CHANNELS.TOOLBAR_RESIZE_FOR_MODE, () => {
  // intentionally empty
});

// Screenshot capture pipeline. Fired from the SelectionOverlay when the
// user picks a Display/Window/Area in screenshot mode: spawns the native
// sidecar (mode='snapshot'), then uploads the PNG to captureflow.xyz in
// the background. Returns the upload result for the renderer to
// fire-and-forget; the user-facing notice is a native macOS notification.
export type CaptureScreenshotResult =
  | {
      ok: true;
      id: string;
      viewUrl: string;
      editUrl: string;
      localCopyPath: string | null;
    }
  | { ok: false; error: string; code?: string };

ipcMain.handle(
  IPC_CHANNELS.CAPTURE_SCREENSHOT,
  async (
    _event,
    target: ScreenshotTarget,
  ): Promise<CaptureScreenshotResult> => {
    try {
      // Resolve every UI detail we can up front — display bounds for
      // modal positioning, source title for the title row, and the
      // expected capture aspect ratio so the modal pre-sizes to its
      // final shape before the PNG ever arrives. The native filter
      // already excludes CaptureFlow's PID so the modal staying visible
      // during the capture isn't a problem.
      let captureBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      } | null = null;
      let estimatedWidth = 0;
      let estimatedHeight = 0;
      try {
        if (target.kind === "display" || target.kind === "area") {
          const d = screen
            .getAllDisplays()
            .find((dd) => dd.id === target.displayId);
          if (d) {
            captureBounds = d.workArea;
            if (target.kind === "display") {
              estimatedWidth = d.size.width;
              estimatedHeight = d.size.height;
            } else {
              estimatedWidth = target.cropRect.width;
              estimatedHeight = target.cropRect.height;
            }
          }
        }
      } catch {
        captureBounds = null;
      }
      let sourceTitle: string | null = null;
      try {
        if (target.kind === "display") {
          const d = screen
            .getAllDisplays()
            .find((dd) => dd.id === target.displayId);
          sourceTitle = d?.label ?? "Display";
        } else if (target.kind === "window") {
          sourceTitle = "Window";
        } else {
          sourceTitle = `Area · ${target.cropRect.width}×${target.cropRect.height}`;
        }
      } catch {
        sourceTitle = null;
      }

      // Open the modal before the capture round-trips. Its initial state
      // is `{ kind: 'capturing', localPath: null }`, so it paints the
      // spinner on first frame and the click feels instant. Pre-sizing
      // here means the preview doesn't jump when the real PNG lands.
      ensureScreenshotNotificationWindow(captureBounds);
      if (estimatedWidth > 0 && estimatedHeight > 0) {
        resizeScreenshotNotificationToAspect(
          estimatedWidth,
          estimatedHeight,
          captureBounds,
        );
      }

      // Hide the toolbar + selection overlay before firing the
      // capture so they don't end up baked into the PNG. The native
      // sidecar's excludePid=CaptureFlow's PID double-covers it, but the
      // hide is faster than the windowserver's exclude filter.
      //
      // Also tell the toolbar to reset its sub-mode selection
      // (Display / Window / Area) — the highlighted button would
      // otherwise stay sticky after the capture, making it look
      // like the picker is still armed for another shot.
      try {
        if (recordingWindow && !recordingWindow.isDestroyed()) {
          recordingWindow.webContents.send(
            IPC_CHANNELS.SELECTION_OVERLAY_CANCELLED,
          );
          recordingWindow.hide();
        }
        if (selectionOverlayWindow && !selectionOverlayWindow.isDestroyed()) {
          selectionOverlayWindow.webContents.send(
            IPC_CHANNELS.SELECTION_OVERLAY_RESET,
          );
          selectionOverlayWindow.hide();
        }
      } catch {
        // ignore
      }
      // When CaptureFlow's frontmost window disappears, macOS infers a
      // focus loss and slides up the autohidden Dock on every display.
      // Raising the topmost non-CaptureFlow app keeps focus stable so the
      // Dock stays hidden. Same trick the recording flow uses.
      try {
        focusTopmostApp(process.pid);
      } catch {
        // ignore — focus raise is best-effort
      }
      // Small breath so the window-server actually commits the hide
      // before SCScreenshotManager grabs the frame.
      await new Promise((r) => setTimeout(r, 80));

      const capture = await captureSnapshot(target);

      // Decide which file path the modal previews. Prefer the
      // persistent copy in ~/Pictures/CaptureFlow/Screenshots; fall back to
      // the temp file (which we'll keep alive while the modal is
      // open by skipping deleteTempScreenshot below).
      const previewPath = capture.localCopyPath ?? capture.tempPath;

      // Window captures didn't get a pre-size pass (we didn't know
      // their dims). Re-shape now so the preview pane matches the
      // captured aspect ratio. For display/area the dims usually
      // match the estimate; the call is cheap so re-running doesn't
      // matter.
      resizeScreenshotNotificationToAspect(
        capture.width,
        capture.height,
        captureBounds,
      );
      sendScreenshotCaptured({
        localPath: previewPath,
        sourceTitle,
        width: capture.width,
        height: capture.height,
      });

      const upload = await uploadScreenshot({
        tempPath: capture.tempPath,
        width: capture.width,
        height: capture.height,
        title: sourceTitle ?? undefined,
      });

      // Only safe to delete the temp file once the persistent copy
      // exists — otherwise the modal's preview img would break.
      if (capture.localCopyPath) {
        deleteTempScreenshot(capture.tempPath).catch(() => {});
      }

      if (!upload.ok) {
        logWarn("screenshot", `upload failed: ${upload.error}`);
        sendScreenshotUploadFailed({ reason: upload.error });
        return { ok: false, error: upload.error, code: upload.code };
      }

      sendScreenshotUploadComplete({
        id: upload.id,
        viewUrl: upload.viewUrl,
        editUrl: upload.editUrl,
      });

      // Drop the public view URL on the clipboard so "paste" in any
      // chat app delivers a working link without opening the editor.
      try {
        const { clipboard } = await import("electron");
        clipboard.writeText(upload.viewUrl);
      } catch {
        // ignore
      }

      return {
        ok: true,
        id: upload.id,
        viewUrl: upload.viewUrl,
        editUrl: upload.editUrl,
        localCopyPath: capture.localCopyPath,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("screenshot", `capture failed: ${msg}`);
      new Notification({
        title: "Screenshot capture failed",
        body: msg,
        silent: false,
      }).show();
      return { ok: false, error: msg };
    } finally {
      // Bring the toolbar back. The overlay stays hidden — selection
      // is "done" once the capture fires; the user can re-open it
      // for the next screenshot.
      try {
        recordingWindow?.show();
      } catch {
        // ignore
      }
    }
  },
);

// Screenshot notification modal action handlers. All fire-and-forget from the
// renderer; main owns the side-effects (open browser, write clipboard,
// delete row + R2 object, close window).
ipcMain.on(IPC_CHANNELS.SCREENSHOT_NOTIFICATION_CLOSE, () => {
  closeScreenshotNotificationWindow();
});

ipcMain.on(IPC_CHANNELS.SCREENSHOT_OPEN_EDIT, (_event, editUrl: string) => {
  if (typeof editUrl !== "string" || !editUrl) return;
  shell.openExternal(editUrl).catch(() => {});
  closeScreenshotNotificationWindow();
});

ipcMain.on(
  IPC_CHANNELS.SCREENSHOT_COPY_LINK,
  async (_event, viewUrl: string) => {
    if (typeof viewUrl !== "string" || !viewUrl) return;
    try {
      const { clipboard } = await import("electron");
      clipboard.writeText(viewUrl);
    } catch {
      // ignore
    }
  },
);

ipcMain.on(IPC_CHANNELS.SCREENSHOT_DELETE, async (_event, id: string) => {
  if (typeof id !== "string" || !id) return;
  // Best-effort DELETE through the screenshot Worker. The bearer token is
  // the same one screenshot-upload uses; recording-auth.ts owns it.
  try {
    const { deleteScreenshot } = await import("./lib/screenshot-upload");
    await deleteScreenshot(id);
  } catch (err) {
    logWarn("screenshot", `delete via modal failed: ${String(err)}`);
  }
  closeScreenshotNotificationWindow();
});

app.whenReady().then(async () => {
  logInfo(
    "app",
    `CaptureFlow started: version=${app.getVersion()}, pid=${process.pid}, logs=${getLogDirPath()}`,
  );

  // Without an explicit handler, Chromium silently denies `media` requests in
  // chromeless windows, so getUserMedia rejects before macOS TCC sees the call.
  // Approving our own renderers here lets the OS dialog drive the real grant
  // decision — TCC is the source of truth, not Chromium's permission UI.
  session.defaultSession.setPermissionRequestHandler(
    (_wc, permission, callback) => {
      if (permission === "media") return callback(true);
      callback(false);
    },
  );
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => {
    return permission === "media";
  });

  // No setDisplayMediaRequestHandler: Electron 39 returns an already-ended
  // audio track from the renderer's getDisplayMedia loopback, which produced
  // MP4s with only 6-byte silent AAC frames. System audio now comes from the
  // native Swift recorder, which AAC-encodes the ScreenCaptureKit audio tap
  // and emits packets on fd 3 alongside H.264 chunks (see RecordingWriter.swift).
  // The renderer mp4-muxer treats them as a regular audio track.

  // --reset-state: wipe web storage (localStorage, IndexedDB, etc.) before any
  // window opens, so the next launch behaves like a fresh install. Recordings
  // on disk are untouched.
  if (process.argv.includes("--reset-state")) {
    await session.defaultSession.clearStorageData({
      storages: [
        "localstorage",
        "indexdb",
        "cookies",
        "cachestorage",
        "serviceworkers",
      ],
    });
    logInfo("app", "--reset-state: cleared web storage");
  }

  electronApp.setAppUserModelId("com.electron");

  // Load persisted user prefs (Instant Recording toggle, etc.) before any
  // window opens — the tray menu reads the cached value to seed its
  // initial checkbox state.
  await loadUserPrefs();

  // Lazy-create the per-install device ID for recording API auth. First
  // boot writes a fresh ID; subsequent boots load the cached one.
  await loadDeviceId();

  // Restore the user's captureflow.xyz session from disk (if
  // any). The lock icon on the recording-mode record button reads this
  // through RECORDING_AUTH_GET on first paint.
  await loadRecordingAuth();
  // Fire-and-forget probe: a 401 from /api/auth/check means the dashboard
  // revoked this device while we were closed, so clearRecordingAuth() flips the
  // lock icon back on. The same fetch doubles as a connectivity probe (network
  // error → 'offline', showing the WifiOff lock). Backgrounded so a slow
  // network doesn't delay startup; results broadcast via RECORDING_*_CHANGED.
  void validateRecordingAuth();
  // Background poll for near-real-time revoke + connectivity detection
  // without a push channel. Runs even without a cached token — anonymous
  // flows still need the connectivity signal for the lock icon. Never
  // cleared; process exit reaps it.
  setInterval(() => {
    void validateRecordingAuth();
  }, 15_000);
  // Usage probe — paints the storage-cap lock on the record button if
  // the device is already at the per-device cap when the app comes up.
  // Cheap unauthenticated GET against captureflow.xyz.
  void refreshRecordingUsage();
  // Workspace list — load cached state first so the toolbar chip has
  // something to render immediately, then refresh from the server in
  // the background.
  void loadWorkspaces().then(() => refreshWorkspaces());

  // Dock icon, dev only: there's no .app bundle in `electron-vite dev`, so set
  // a PNG via setIcon. setIcon can't take a .icon yet (electron/electron#48476),
  // so the dev dock won't get the macOS 26 squircle — verify the real shape in
  // a packaged build. In production we deliberately DON'T override: setIcon
  // would clobber the system-shaped bundle icon (Assets.car + CFBundleIconName).
  if (process.platform === "darwin" && app.dock && is.dev) {
    app.dock.setIcon(iconDev);
  }

  // Thumbnail cache for wallpaper previews
  const thumbCache = new Map<string, Buffer>();

  // Handle media:// protocol to serve files with range support + thumbnail generation
  protocol.handle("media", (request) => {
    const url = new URL(request.url);
    const filePath = url.searchParams.get("path") || "";
    const thumbSize = parseInt(url.searchParams.get("thumb") || "0", 10);

    if (thumbSize > 0) {
      const cacheKey = `${filePath}:${thumbSize}`;
      const cached = thumbCache.get(cacheKey);
      if (cached) {
        return new Response(new Uint8Array(cached), {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "max-age=86400",
          },
        });
      }
      try {
        const img = nativeImage.createFromPath(filePath);
        const resized = img.resize({ height: thumbSize, quality: "good" });
        const jpeg = resized.toJPEG(80);
        const buf = new Uint8Array(jpeg);
        thumbCache.set(cacheKey, Buffer.from(jpeg));
        return new Response(buf, {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "max-age=86400",
          },
        });
      } catch {
        return new Response("Thumbnail failed", { status: 500 });
      }
    }

    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      webm: "video/webm",
      mp4: "video/mp4",
      m4a: "audio/mp4",
      aac: "audio/aac",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      gif: "image/gif",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    let stat: ReturnType<typeof statSync>;
    try {
      stat = statSync(filePath);
    } catch {
      return new Response("Not found", { status: 404 });
    }

    const total = stat.size;
    const rangeHeader = request.headers.get("Range");

    // Adapt a Node ReadStream to a web ReadableStream, propagating cancel.
    const toWebStream = (
      nodeStream: ReturnType<typeof createReadStream>,
    ): ReadableStream => {
      return new ReadableStream({
        start(controller) {
          nodeStream.on("data", (chunk: string | Buffer) => {
            try {
              const buf =
                typeof chunk === "string" ? Buffer.from(chunk) : chunk;
              controller.enqueue(new Uint8Array(buf));
            } catch {
              /* stream closed */
            }
          });
          nodeStream.on("end", () => {
            try {
              controller.close();
            } catch {
              /* already closed */
            }
          });
          nodeStream.on("error", () => {
            try {
              controller.close();
            } catch {
              /* already closed */
            }
          });
        },
        cancel() {
          nodeStream.destroy();
        },
      });
    };

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const rawStart = parseInt(match[1], 10);
        const rawEnd = match[2] ? parseInt(match[2], 10) : total - 1;

        // Clamp to valid range. An out-of-bounds Range must respond with
        // 416 per HTTP spec — Chromium sometimes asks for bytes past EOF
        // during seeks on long videos.
        if (rawStart >= total || rawStart < 0) {
          return new Response(null, {
            status: 416,
            headers: {
              "Content-Range": `bytes */${total}`,
              "Accept-Ranges": "bytes",
            },
          });
        }

        const start = rawStart;
        const end = Math.min(rawEnd, total - 1);
        if (end < start) {
          return new Response(null, {
            status: 416,
            headers: {
              "Content-Range": `bytes */${total}`,
              "Accept-Ranges": "bytes",
            },
          });
        }
        const chunkSize = end - start + 1;

        return new Response(
          toWebStream(createReadStream(filePath, { start, end })),
          {
            status: 206,
            headers: {
              "Content-Type": contentType,
              "Content-Range": `bytes ${start}-${end}/${total}`,
              "Content-Length": String(chunkSize),
              "Accept-Ranges": "bytes",
            },
          },
        );
      }
    }

    return new Response(toWebStream(createReadStream(filePath)), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(total),
        "Accept-Ranges": "bytes",
      },
    });
  });

  // Pre-warm wallpaper thumbnails so BackgroundPanel doesn't flash
  // placeholders. The ~18 requests fired on mount are served sequentially
  // (each nativeImage decode+resize+JPEG is CPU-bound), so without the cache
  // users see a top-to-bottom reveal. setImmediate between images yields the
  // loop so the prewarm doesn't stall startup.
  void (async () => {
    const { readdir } = await import("fs/promises");
    const wallpapersDir = join(app.getAppPath(), "resources", "wallpapers");
    try {
      const groupDirs = await readdir(wallpapersDir, { withFileTypes: true });
      for (const groupEntry of groupDirs) {
        if (!groupEntry.isDirectory()) continue;
        const dir = join(wallpapersDir, groupEntry.name);
        const files = await readdir(dir);
        for (const f of files) {
          if (!/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f)) continue;
          const filePath = join(dir, f);
          const cacheKey = `${filePath}:200`;
          if (thumbCache.has(cacheKey)) continue;
          try {
            const img = nativeImage.createFromPath(filePath);
            const resized = img.resize({ height: 200, quality: "good" });
            const jpeg = resized.toJPEG(80);
            thumbCache.set(cacheKey, Buffer.from(jpeg));
          } catch {
            /* skip; protocol handler will retry on demand */
          }
          await new Promise<void>((r) => setImmediate(r));
        }
      }
    } catch {
      /* no wallpapers dir — nothing to warm */
    }
  })();

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  registerRecordingHandlers(() => recordingWindow); // crash notifications route to recording window
  registerWindowHandlers(
    () => recordingWindow,
    () => permissionsWindow !== null && !permissionsWindow.isDestroyed(),
  );
  // Pre-warm the recording overlay so first-show is just a `show()`.
  // Constructing the window + transparent panel + data-URL load in the
  // critical path used to add 6-7s of lag in prod, where ScreenCaptureKit /
  // WindowServer deprioritize first paint for a non-frontmost owner.
  ensureOverlayWindow();
  registerSystemHandlers();
  registerRecordingAuthHandlers();
  registerRecordingStreamHandlers();
  initAutoUpdater();

  ipcMain.handle(
    IPC_CHANNELS.SHOW_RELEASE_NOTES,
    async (_event, opts: { force?: boolean } = {}) => {
      return await getPendingReleaseNote(!!opts.force);
    },
  );

  ipcMain.handle(IPC_CHANNELS.RELEASE_NOTES_PENDING, async () => {
    return await getPendingReleaseNote(false);
  });

  ipcMain.handle(IPC_CHANNELS.RELEASE_NOTES_MARK_SHOWN, async () => {
    await markReleaseNotesShown();
  });

  ipcMain.on(
    IPC_CHANNELS.LOG_FROM_RENDERER,
    (
      _event,
      payload: {
        level: "info" | "warn" | "error";
        component: string;
        message: string;
      },
    ) => {
      const { level, component, message } = payload;
      if (level === "error") logError(component, message);
      else if (level === "warn") logWarn(component, message);
      else logInfo(component, message);
    },
  );

  ipcMain.on(
    IPC_CHANNELS.FIT_WINDOW_TO_CONTENT,
    (event, opts: { width?: number; height: number }) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win || win.isDestroyed()) return;
      const wasHidden = !win.isVisible();
      const bounds = win.getBounds();
      const newWidth = opts.width ?? bounds.width;
      const newHeight = opts.height;
      // First reveal: center the window on its parent (recompute x/y so the
      // modal lands middle-of-screen at its measured size).
      // Subsequent resizes: anchor the top edge in place and grow downward.
      // Recentering on every measurement was making the title appear to float
      // upward as the window grew, breaking the illusion of fluid expansion.
      let newX = bounds.x;
      let newY = bounds.y;
      if (wasHidden) {
        newX = Math.round(bounds.x + (bounds.width - newWidth) / 2);
        newY = Math.round(bounds.y + (bounds.height - newHeight) / 2);
      } else {
        newX = Math.round(bounds.x + (bounds.width - newWidth) / 2);
      }
      win.setBounds(
        { x: newX, y: newY, width: newWidth, height: newHeight },
        false,
      );
      if (wasHidden) {
        win.show();
        win.focus();
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.OPEN_SELECTION_OVERLAY,
    (
      _event,
      mode: SelectionOverlayMode,
      devices?: { hasCamera: boolean; hasMic: boolean },
      includeSelf?: boolean,
    ) => {
      openSelectionOverlay(mode, devices, !!includeSelf);
    },
  );

  ipcMain.handle(IPC_CHANNELS.CLOSE_SELECTION_OVERLAY, () => {
    // Use cancel semantics so the toolbar's active-source pill resets
    // on the same tick the overlay disappears. Otherwise the next click
    // on the same source button toggles off (no-op against an already-
    // hidden overlay) and the user has to click twice to reopen — felt
    // broken from the LoginPromptModal handoff where the overlay closes
    // implicitly behind the browser tab.
    cancelSelectionOverlay();
  });

  ipcMain.handle(
    IPC_CHANNELS.GET_WINDOW_AT_POINT,
    (_event, x: number, y: number) => {
      // Dev "Record self" toggle drops the PID exclusion so the picker can
      // hover/select CaptureFlow's own windows for testing.
      return getWindowAtPoint(
        x,
        y,
        overlayIncludeSelfWindows ? undefined : process.pid,
      );
    },
  );

  // pid > 0: raise that specific app (window recordings).
  // pid <= 0 or undefined: raise the topmost non-CaptureFlow window so the
  // dock doesn't auto-show during display/area recordings.
  ipcMain.handle(IPC_CHANNELS.FOCUS_APP_BY_PID, (_event, pid?: number) =>
    pid && pid > 0 ? focusAppByPid(pid) : focusTopmostApp(process.pid),
  );

  // Display-only recording chrome toggle. Mutates global system state
  // (Finder relaunch) so we route through main and snapshot the prior
  // value so stop/restart can put it back.
  ipcMain.handle(
    IPC_CHANNELS.APPLY_RECORDING_DISPLAY_MODE,
    (_event, opts: { hideDesktopIcons?: boolean }) =>
      applyRecordingDisplayMode({
        hideDesktopIcons: !!opts?.hideDesktopIcons,
      }),
  );
  ipcMain.handle(IPC_CHANNELS.RESTORE_RECORDING_DISPLAY_MODE, () =>
    restoreRecordingDisplayMode(),
  );

  ipcMain.on(IPC_CHANNELS.SELECTION_OVERLAY_RESULT, (_event, source) => {
    if (recordingWindow && !recordingWindow.isDestroyed()) {
      recordingWindow.webContents.send(IPC_CHANNELS.SOURCE_SELECTED, source);
      // Auto-start recording after source selection from overlay
      recordingWindow.webContents.send("auto-start-recording");
    }
    hideSelectionOverlay();
  });

  // Forward "user clicked record, countdown begins" / "countdown
  // cancelled" from the SelectionOverlay window to the toolbar's
  // useRecorder hook, which runs recordingStart + system-audio acquisition
  // in parallel with the 3 s visible countdown.
  ipcMain.on(IPC_CHANNELS.RECORDING_PREP_START, () => {
    if (recordingWindow && !recordingWindow.isDestroyed()) {
      recordingWindow.webContents.send(IPC_CHANNELS.RECORDING_PREP_START);
    }
  });
  ipcMain.on(IPC_CHANNELS.RECORDING_PREP_CANCEL, () => {
    if (recordingWindow && !recordingWindow.isDestroyed()) {
      recordingWindow.webContents.send(IPC_CHANNELS.RECORDING_PREP_CANCEL);
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.SHOW_WEBCAM_BUBBLE,
    (_event, deviceId: string) => {
      // Anchor the bubble to whichever display the toolbar is on, so the
      // user sees their webcam preview on the same screen they're recording.
      const display =
        recordingWindow && !recordingWindow.isDestroyed()
          ? screen.getDisplayMatching(recordingWindow.getBounds())
          : screen.getPrimaryDisplay();
      const size = WEBCAM_BUBBLE_SIZE;

      if (!webcamBubbleWindow || webcamBubbleWindow.isDestroyed()) {
        webcamBubbleWindow = new BrowserWindow({
          width: size,
          height: size,
          x:
            display.workArea.x +
            display.workArea.width -
            size -
            WEBCAM_BUBBLE_EDGE_PADDING,
          y:
            display.workArea.y +
            display.workArea.height -
            size -
            WEBCAM_BUBBLE_EDGE_PADDING,
          frame: false,
          transparent: true,
          resizable: false,
          alwaysOnTop: true,
          skipTaskbar: true,
          hasShadow: false,
          focusable: false,
          roundedCorners: false,
          backgroundColor: "#00000000",
          webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            sandbox: false,
          },
        });

        webcamBubbleWindow.setVisibleOnAllWorkspaces(true);
        webcamBubbleWindow.setAlwaysOnTop(true, "screen-saver", 1);
        webcamBubbleWindow.setContentProtection(true);
        webcamBubbleWindow.setMovable(true);

        webcamBubbleWindow.on("closed", () => {
          webcamBubbleWindow = null;
        });

        webcamBubbleWindow.webContents.on("context-menu", () => {
          const menu = Menu.buildFromTemplate([
            {
              label: "Hide Camera Preview",
              click: () => {
                webcamBubbleWindow?.hide();
              },
            },
          ]);
          menu.popup({ window: webcamBubbleWindow! });
        });

        const sendInit = (): void => {
          webcamBubbleWindow?.webContents.send(
            IPC_CHANNELS.WEBCAM_BUBBLE_INIT,
            deviceId,
          );
          webcamBubbleWindow?.show();
        };

        if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
          webcamBubbleWindow.loadURL(
            `${process.env["ELECTRON_RENDERER_URL"]}#/webcam-bubble`,
          );
        } else {
          webcamBubbleWindow.loadFile(
            join(__dirname, "../renderer/index.html"),
            {
              hash: "/webcam-bubble",
            },
          );
        }

        webcamBubbleWindow.webContents.once("did-finish-load", sendInit);
      } else {
        webcamBubbleWindow.webContents.send(
          IPC_CHANNELS.WEBCAM_BUBBLE_INIT,
          deviceId,
        );
        webcamBubbleWindow.show();
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.SOFT_HIDE_WEBCAM_BUBBLE, () => {
    // Just hide the BrowserWindow — leaves the MediaStream alive in
    // the renderer so a subsequent SHOW is instantaneous. Camera LED
    // stays on. Use this when toggling modes during the idle toolbar
    // session; use HIDE_WEBCAM_BUBBLE proper for the recorder/recording
    // teardown paths that need the camera fully released.
    if (webcamBubbleWindow && !webcamBubbleWindow.isDestroyed()) {
      webcamBubbleWindow.hide();
    }
  });

  ipcMain.handle(IPC_CHANNELS.HIDE_WEBCAM_BUBBLE, () => {
    // Hide rather than close so a follow-up SHOW (e.g. after the user
    // deletes a recording and lands back on the toolbar) reuses the same
    // window. Closing here races the next show — the close is async, so
    // SHOW finds a non-null but mid-teardown window and posts init/show
    // to a doomed renderer.
    //
    // Tell the renderer to release its MediaStream before we hide.
    // BrowserWindow.hide() doesn't unmount React, so without this the
    // getUserMedia tracks stay live and the camera LED stays on (e.g.
    // while the recording-ready modal is up after recording stops).
    if (webcamBubbleWindow && !webcamBubbleWindow.isDestroyed()) {
      webcamBubbleWindow.webContents.send(IPC_CHANNELS.WEBCAM_BUBBLE_RELEASE);
      webcamBubbleWindow.hide();
    }
  });

  ipcMain.handle(IPC_CHANNELS.PERMISSIONS_GRANTED, () => {
    if (permissionsWindow && !permissionsWindow.isDestroyed()) {
      permissionsWindow.close();
      permissionsWindow = null;
    }
    if (!recordingWindow || recordingWindow.isDestroyed()) {
      createWindow();
    } else if (!recordingWindow.isVisible()) {
      // The toolbar was hidden while the gate was up — bring it back.
      recordingWindow.show();
      recordingWindow.webContents.send("toolbar-visible");
    }
  });

  // Menu bar tray icon. Rendered in colour (not a template image) so the
  // CaptureFlow mark keeps its blue across light and dark menu bars.
  const trayImage = nativeImage.createFromPath(trayIconPath);
  tray = new Tray(trayImage);
  tray.setToolTip("CaptureFlow");
  refreshTrayMenu();

  // Pre-create overlay window so it opens instantly on click
  createSelectionOverlayWindow();

  if (hasAllPermissions()) {
    createWindow();
  } else {
    // Show the welcome gate first if any required permission is missing.
    createPermissionsWindow();
  }

  appIsReady = true;
  // Flush any captureflow:// deep links that arrived before whenReady
  // resolved (cold-launch path: macOS double-clicks the URL, opens
  // the app, hands us the URL inside `open-url` synchronously after
  // launch). Record links surface the toolbar; everything else falls
  // through to the auth handler.
  for (const url of pendingDeepLinks.splice(0)) {
    if (tryHandleRecordDeepLink(url)) continue;
    handleDeepLinkUrl(url).catch((err) =>
      logError("recording-auth", `pending deep link failed: ${err}`),
    );
  }

  // Throttle recording-auth probes so a stream of activate events (which
  // macOS fires on every dock click + every cmd-tab back) doesn't hammer
  // /api/auth/check. 60s is enough to catch a revocation the user just
  // performed in the dashboard without being chatty.
  let lastRecordingAuthCheck = 0;
  app.on("activate", function () {
    const now = Date.now();
    if (now - lastRecordingAuthCheck > 60_000) {
      lastRecordingAuthCheck = now;
      void validateRecordingAuth();
    }
    // While a recording is in progress the source-picker toolbar is
    // intentionally hidden — clicking the dock icon must not bring it back.
    if (isNativeRecordingActive()) {
      return;
    }
    // If the welcome gate is open, keep focus on it — the toolbar must not
    // appear until the user accepts and continues.
    if (permissionsWindow && !permissionsWindow.isDestroyed()) {
      permissionsWindow.focus();
      return;
    }
    if (!hasAllPermissions()) {
      createPermissionsWindow();
      return;
    }
    if (!recordingWindow || recordingWindow.isDestroyed()) {
      createWindow();
    } else if (!recordingWindow.isVisible()) {
      recordingWindow.show();
      // Mirror the editor-close path: tell the toolbar it's back on
      // screen so it can re-show the webcam bubble (release was sent
      // when the previous recording stopped, so without this the
      // camera selector stays "selected" but the bubble never reacquires
      // the stream).
      recordingWindow.webContents.send("toolbar-visible");
    }
    // Dock re-activation: the main-side cursor poll (pollToolbarHit)
    // is already running and will toggle ignore-mouse to match the
    // current cursor position on the next tick — no IPC dance needed.
  });
});

let recorderShutdownInFlight = false;
app.on("before-quit", (event) => {
  // Best-effort restore of dock + desktop pref overrides if a recording was
  // in progress when the user quit. Fire-and-forget — Electron doesn't wait
  // for async work in `before-quit`, so the killall Finder may land after
  // we exit, but the defaults write itself is synchronous on disk and that
  // alone is enough for the next login to render correctly.
  if (hasActiveDisplayModeOverrides()) {
    void restoreRecordingDisplayMode();
  }

  // If a native recording is mid-flight, defer the quit long enough for the
  // Swift recorder to flush its moov atom. Killing it cold (SIGTERM via the
  // parent's exit, or electron-vite's restart in dev) leaves a half-finalized
  // mp4 with no `tracking.json` / `webcam.mp4` / `project.json` — the user
  // ends up with an unrecoverable broken session.
  if (isNativeRecordingActive() && !recorderShutdownInFlight) {
    recorderShutdownInFlight = true;
    event.preventDefault();
    logInfo("app", "before-quit: stopping native recorder before exit");
    stopNativeRecording()
      .catch((err) => logWarn("app", `recorder stop on quit failed: ${err}`))
      .finally(() => app.quit());
  }
});

app.on("window-all-closed", () => {
  // macOS convention: app stays open when all windows close
});
