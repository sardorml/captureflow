import { BrowserWindow, screen, shell } from "electron";
import { is } from "@electron-toolkit/utils";
import { join } from "path";
import { IPC_CHANNELS } from "../../shared/types";

const MODAL_WIDTH = 360;
const MODAL_HEIGHT = 360;
const MODAL_EDGE_MARGIN = 16;
const MODAL_FOOTER_PX = 110;
const MODAL_OUTER_PADDING = 12;
const MODAL_MAX_HEIGHT = 720;
const MODAL_MIN_HEIGHT = 280;

let screenshotNotificationWindow: BrowserWindow | null = null;
// webContents.send doesn't queue: hold payloads and flush on did-finish-load.
let screenshotReady = false;
let pendingCaptured: {
  localPath: string;
  sourceTitle: string | null;
  width: number;
  height: number;
} | null = null;
let pendingUploadComplete: {
  id: string;
  viewUrl: string;
  editUrl: string;
} | null = null;
let pendingUploadFailed: { reason: string } | null = null;

type DisplayBounds = { x: number; y: number; width: number; height: number };
function pickDisplayWorkArea(captureBounds: DisplayBounds | null): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (captureBounds) {
    const display = screen.getDisplayMatching(captureBounds);
    return display.workArea;
  }
  const cursor = screen.getCursorScreenPoint();
  return screen.getDisplayNearestPoint(cursor).workArea;
}

export function ensureScreenshotNotificationWindow(
  captureBounds: DisplayBounds | null,
): BrowserWindow {
  if (
    screenshotNotificationWindow &&
    !screenshotNotificationWindow.isDestroyed()
  ) {
    screenshotNotificationWindow.showInactive();
    return screenshotNotificationWindow;
  }

  const workArea = pickDisplayWorkArea(captureBounds);
  const win = new BrowserWindow({
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    x: workArea.x + workArea.width - MODAL_WIDTH - MODAL_EDGE_MARGIN,
    y: workArea.y + workArea.height - MODAL_HEIGHT - MODAL_EDGE_MARGIN,
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
    roundedCorners: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  win.setVisibleOnAllWorkspaces(true);
  win.setAlwaysOnTop(true, "screen-saver", 2);

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  win.on("closed", () => {
    screenshotNotificationWindow = null;
    screenshotReady = false;
    pendingCaptured = null;
    pendingUploadComplete = null;
    pendingUploadFailed = null;
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(
      `${process.env["ELECTRON_RENDERER_URL"]}#/screenshot-notification`,
    );
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"), {
      hash: "/screenshot-notification",
    });
  }

  win.once("ready-to-show", () => {
    win.showInactive();
  });

  win.webContents.once("did-finish-load", () => {
    screenshotReady = true;
    if (pendingCaptured) {
      win.webContents.send(IPC_CHANNELS.SCREENSHOT_CAPTURED, pendingCaptured);
      pendingCaptured = null;
    }
    if (pendingUploadComplete) {
      win.webContents.send(
        IPC_CHANNELS.SCREENSHOT_UPLOAD_COMPLETE,
        pendingUploadComplete,
      );
      pendingUploadComplete = null;
    }
    if (pendingUploadFailed) {
      win.webContents.send(
        IPC_CHANNELS.SCREENSHOT_UPLOAD_FAILED,
        pendingUploadFailed,
      );
      pendingUploadFailed = null;
    }
  });

  screenshotNotificationWindow = win;
  return win;
}

export function getScreenshotNotificationWindow(): BrowserWindow | null {
  if (
    !screenshotNotificationWindow ||
    screenshotNotificationWindow.isDestroyed()
  )
    return null;
  return screenshotNotificationWindow;
}

export function closeScreenshotNotificationWindow(): void {
  if (
    screenshotNotificationWindow &&
    !screenshotNotificationWindow.isDestroyed()
  ) {
    screenshotNotificationWindow.close();
  }
  screenshotNotificationWindow = null;
}

export function resizeScreenshotNotificationToAspect(
  imgWidth: number,
  imgHeight: number,
  captureBounds: DisplayBounds | null,
): void {
  const win = getScreenshotNotificationWindow();
  if (!win) return;
  if (!Number.isFinite(imgWidth) || !Number.isFinite(imgHeight)) return;
  if (imgWidth <= 0 || imgHeight <= 0) return;

  const previewWidth = MODAL_WIDTH - MODAL_OUTER_PADDING * 2;
  const previewHeight = (previewWidth * imgHeight) / imgWidth;
  const fixedChrome = MODAL_FOOTER_PX + MODAL_OUTER_PADDING * 2;
  const ideal = Math.round(fixedChrome + previewHeight);

  const workArea = pickDisplayWorkArea(captureBounds);
  const cap = Math.min(
    MODAL_MAX_HEIGHT,
    Math.floor(workArea.height - MODAL_EDGE_MARGIN * 2),
  );
  const newHeight = Math.max(MODAL_MIN_HEIGHT, Math.min(ideal, cap));

  win.setBounds({
    width: MODAL_WIDTH,
    height: newHeight,
    x: workArea.x + workArea.width - MODAL_WIDTH - MODAL_EDGE_MARGIN,
    y: workArea.y + workArea.height - newHeight - MODAL_EDGE_MARGIN,
  });
}

export function sendScreenshotCaptured(payload: {
  localPath: string;
  sourceTitle: string | null;
  width: number;
  height: number;
}): void {
  const win = getScreenshotNotificationWindow();
  if (!win || !screenshotReady) {
    pendingCaptured = payload;
    return;
  }
  win.webContents.send(IPC_CHANNELS.SCREENSHOT_CAPTURED, payload);
}

export function sendScreenshotUploadComplete(payload: {
  id: string;
  viewUrl: string;
  editUrl: string;
}): void {
  const win = getScreenshotNotificationWindow();
  if (!win || !screenshotReady) {
    pendingUploadComplete = payload;
    return;
  }
  win.webContents.send(IPC_CHANNELS.SCREENSHOT_UPLOAD_COMPLETE, payload);
}

export function sendScreenshotUploadFailed(payload: { reason: string }): void {
  const win = getScreenshotNotificationWindow();
  if (!win || !screenshotReady) {
    pendingUploadFailed = payload;
    return;
  }
  win.webContents.send(IPC_CHANNELS.SCREENSHOT_UPLOAD_FAILED, payload);
}
