import { app, BrowserWindow, ipcMain, screen, shell } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { IPC_CHANNELS, type ShareFailureState } from "../../../shared/types";
import { logInfo, logWarn } from "../logger";

const WIDTH = 460;
const HEIGHT = 240;

let current: BrowserWindow | null = null;

export function openShareFailureWindow(state: ShareFailureState): void {
  if (current && !current.isDestroyed()) {
    sendState(current, state);
    activate(current);
    return;
  }

  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const wa = display.workArea;
  const x = Math.round(wa.x + (wa.width - WIDTH) / 2);
  const y = Math.round(wa.y + (wa.height - HEIGHT) / 2);

  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    x,
    y,
    show: false,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 14, y: 14 },
    transparent: false,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: true,
    skipTaskbar: true,
    roundedCorners: true,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });
  current = win;

  win.webContents.on("did-finish-load", () => {
    if (!win.isDestroyed()) sendState(win, state);
  });
  win.once("ready-to-show", () => {
    if (win.isDestroyed()) return;
    activate(win);
  });
  win.on("closed", () => {
    if (current === win) current = null;
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}?view=share-failure`);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"), {
      search: "view=share-failure",
    });
  }

  logInfo("share-failure", `opened: kind=${state.kind}`);
}

function sendState(win: BrowserWindow, state: ShareFailureState): void {
  win.webContents.send(IPC_CHANNELS.SHARE_FAILURE_INIT, state);
}

function activate(win: BrowserWindow): void {
  app.focus({ steal: true });
  app.dock?.show().catch(() => {});
  win.show();
  win.focus();
}

ipcMain.handle(
  IPC_CHANNELS.SHARE_FAILURE_OPEN,
  (_event, state: ShareFailureState) => {
    openShareFailureWindow(state);
  },
);
ipcMain.on(IPC_CHANNELS.SHARE_FAILURE_CLOSE, (event) => {
  const sender = BrowserWindow.fromWebContents(event.sender);
  if (sender && !sender.isDestroyed()) sender.destroy();
});
ipcMain.on(IPC_CHANNELS.SHARE_READY_OPEN_LINK, (_event, url: string) => {
  if (typeof url !== "string") return;
  // Allow http on localhost/127.0.0.1 for dev links; otherwise the dev share link is silently dropped.
  const ok =
    url.startsWith("https://") ||
    url.startsWith("http://localhost") ||
    url.startsWith("http://127.0.0.1");
  if (ok) {
    void shell.openExternal(url);
  } else {
    logWarn("share", `open-link dropped, unexpected scheme: ${url}`);
  }
});
