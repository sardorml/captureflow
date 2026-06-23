import { ipcMain, BrowserWindow, dialog, nativeImage, screen } from "electron";
import { IPC_CHANNELS } from "../../shared/types";
import iconAsset from "../../../resources/icon.png?asset";

let overlayWindow: BrowserWindow | null = null;
let dimWindow: BrowserWindow | null = null;
const resizeTimers = new Map<number, ReturnType<typeof setInterval>>();

function showDimOverlay(
  bounds: { x: number; y: number; width: number; height: number },
  cornerRadius?: number,
): void {
  if (dimWindow && !dimWindow.isDestroyed()) dimWindow.close();

  const display = screen.getPrimaryDisplay();
  const sw = display.size.width;
  const sh = display.size.height;

  /*
   * `type: 'panel'` makes this an NSPanel — the same trick the selection
   * overlay uses to draw OVER the macOS menu bar. A plain BrowserWindow gets
   * pushed below the menu bar (which also clips the cutout), no matter what
   * alwaysOnTop level you give it.
   */
  dimWindow = new BrowserWindow({
    width: sw,
    height: sh,
    x: display.bounds.x,
    y: display.bounds.y,
    frame: false,
    transparent: true,
    resizable: false,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    enableLargerThanScreen: true,
    type: "panel",
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  dimWindow.setContentProtection(true);
  dimWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // screen-saver level + panel type is what draws over the menu bar.
  // Recording controls sit at relativeLevel +1, so the dim stays at +0.
  dimWindow.setAlwaysOnTop(true, "screen-saver");
  dimWindow.setIgnoreMouseEvents(true);

  /*
   * ScreenCaptureKit and screen.bounds both use top-left origin in
   * points/pixels, and the dim window now spans the full display, so
   * CSS coords map 1:1 to SCWindow.frame.
   */
  const bx = Math.round(bounds.x - display.bounds.x);
  const by = Math.round(bounds.y - display.bounds.y);
  const bw = Math.round(bounds.width);
  const bh = Math.round(bounds.height);
  /*
   * Native radius detected by the window detector via SCK alpha sampling.
   * Falls back to 10pt (the macOS standard window radius) when the source
   * didn't carry a value (display/area capture, or detection failure).
   */
  const radius = Math.max(0, Math.round(cornerRadius ?? 10));
  console.warn(
    "[dim] screen:",
    sw,
    "x",
    sh,
    "window:",
    bx,
    by,
    bw,
    bh,
    "radius:",
    radius,
  );
  /*
   * Single rounded cutout via box-shadow spread — paints the dim everywhere
   * *outside* the window rect, with rounded corners that hug the captured
   * window's actual chrome. Avoids the degenerate 0px-height top/bottom
   * quadrants that the four-rect approach produced when the window sat
   * flush against the work-area top or bottom.
   */
  const html = `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; }
body { background: transparent; overflow: hidden; }
.cutout {
  position: fixed;
  top: ${by}px;
  left: ${bx}px;
  width: ${bw}px;
  height: ${bh}px;
  border-radius: ${radius}px;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.35);
  pointer-events: none;
}
</style></head><body>
<div class="cutout"></div>
</body></html>`;

  dimWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

function hideDimOverlay(): void {
  if (dimWindow && !dimWindow.isDestroyed()) {
    dimWindow.close();
    dimWindow = null;
  }
}

function createOverlayWindow(): BrowserWindow {
  const display = screen.getPrimaryDisplay();
  const overlay = new BrowserWindow({
    width: 300,
    height: 48,
    x: Math.round((display.workAreaSize.width - 300) / 2),
    y: display.workArea.y + 12,
    // Pre-warmed at app startup and reused across recordings, so don't show
    // until the renderer asks for it. Showing on demand is what eliminates the
    // 6-7s prod lag where the overlay used to be constructed inside the
    // critical path between native-recorder start and the user expecting UI.
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    roundedCorners: false,
    type: "panel",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  overlay.setContentProtection(true);
  overlay.setVisibleOnAllWorkspaces(true);
  // Stay one level above the recording dim (also at 'screen-saver') so the
  // controls bar floats over the dim instead of being hidden by it.
  overlay.setAlwaysOnTop(true, "screen-saver", 1);

  const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; outline: none; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    background: transparent;
    -webkit-app-region: drag;
    user-select: none;
  }
  .bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    height: 48px;
    background: #262626;
    border-radius: 8px;
  }
  .dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #ef4444;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .time {
    color: white;
    font-size: 13px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    min-width: 42px;
  }
  button {
    -webkit-app-region: no-drag;
    background: none;
    border: none;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  button:hover { background: rgba(255,255,255,0.1); color: white; }
  .stop-btn {
    width: 24px; height: 24px;
    background: #ef4444;
    border-radius: 6px;
    color: white;
  }
  .stop-btn:hover { background: #dc2626; }
  .delete-btn:hover { color: #ef4444; }
  .icon { width: 16px; height: 16px; }
  .sep { width: 1px; height: 20px; background: rgba(255,255,255,0.12); }
  .grip {
    display: grid;
    grid-template-columns: repeat(2, 3px);
    gap: 3px;
    margin-left: auto;
    padding: 0 4px;
    cursor: grab;
  }
  .grip-dot {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
  }
</style>
</head>
<body>
<div class="bar">
  <div class="dot" id="dot"></div>
  <span class="time" id="time">00:00</span>
  <div class="sep"></div>
  <button id="deleteBtn" class="delete-btn" title="Cancel & Delete">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  </button>
  <button id="restartBtn" title="Restart">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
  </button>
  <div class="sep"></div>
  <button id="pauseBtn" title="Pause">
    <svg class="icon" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
  </button>
  <button id="stopBtn" title="Stop" class="stop-btn">
    <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><rect width="10" height="10" rx="1.5"/></svg>
  </button>
  <div class="grip"><div class="grip-dot"></div><div class="grip-dot"></div><div class="grip-dot"></div><div class="grip-dot"></div><div class="grip-dot"></div><div class="grip-dot"></div></div>
</div>
<script>
  const { ipcRenderer } = require('electron');
  // Anchor the displayed time to the native recorder's wall clock instead of
  // a local seconds++ counter. The overlay used to count from when its inline
  // script first executed; in prod that could lag the actual recording start
  // by several seconds, leaving the displayed time short of the file duration.
  // Now main sends startedAt (epoch ms) on each show, and we recompute from
  // Date.now() so any first-paint slip is invisible to the user.
  let startedAt = null;
  let capMs = null;       // share-mode countdown cap; null otherwise
  let autoStopFired = false;
  let paused = false;
  let pauseStartedAt = null;
  let accumulatedPauseMs = 0;
  const timeEl = document.getElementById('time');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const restartBtn = document.getElementById('restartBtn');
  const dot = document.getElementById('dot');

  const PAUSE_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  const PLAY_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>';

  function render() {
    if (startedAt == null) { timeEl.textContent = '00:00'; return; }
    const now = Date.now();
    const livePause = paused && pauseStartedAt != null ? (now - pauseStartedAt) : 0;
    const elapsedMs = Math.max(0, now - startedAt - accumulatedPauseMs - livePause);
    // Share mode: count DOWN from the cap. Once it hits zero, fire stop
    // exactly once (the recorder hook owns teardown). Recording continues
    // visually displayed at 00:00 until main hides the overlay.
    let displayMs = elapsedMs;
    if (capMs != null) {
      displayMs = Math.max(0, capMs - elapsedMs);
      if (displayMs <= 0 && !autoStopFired && !paused) {
        autoStopFired = true;
        ipcRenderer.send('overlay-action', 'stop');
      }
    }
    const seconds = Math.floor(displayMs / 1000);
    const m = String(Math.floor(seconds/60)).padStart(2,'0');
    const s = String(seconds%60).padStart(2,'0');
    timeEl.textContent = m+':'+s;
  }

  // 250ms tick keeps the second flip aligned to the wall clock without
  // burning CPU. The display jumps within ~250ms of the true second boundary
  // — close enough that no user notices.
  setInterval(render, 250);
  render();

  ipcRenderer.on('overlay-anchor', (_e, payload) => {
    startedAt = payload && typeof payload.startedAt === 'number' ? payload.startedAt : Date.now();
    capMs = payload && typeof payload.capMs === 'number' ? payload.capMs : null;
    autoStopFired = false;
    paused = false;
    pauseStartedAt = null;
    accumulatedPauseMs = 0;
    dot.style.animationPlayState = 'running';
    dot.style.background = '#ef4444';
    pauseBtn.innerHTML = PAUSE_ICON;
    render();
  });

  ipcRenderer.on('overlay-reset', () => {
    startedAt = null;
    capMs = null;
    autoStopFired = false;
    paused = false;
    pauseStartedAt = null;
    accumulatedPauseMs = 0;
    render();
  });

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    if (paused) {
      pauseStartedAt = Date.now();
    } else if (pauseStartedAt != null) {
      accumulatedPauseMs += Date.now() - pauseStartedAt;
      pauseStartedAt = null;
    }
    dot.style.animationPlayState = paused ? 'paused' : 'running';
    dot.style.background = paused ? '#eab308' : '#ef4444';
    pauseBtn.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
    ipcRenderer.send('overlay-action', paused ? 'pause' : 'resume');
  });

  stopBtn.addEventListener('click', () => {
    ipcRenderer.send('overlay-action', 'stop');
  });

  deleteBtn.addEventListener('click', () => {
    // Don't reset state here — main shows a confirm dialog first and the
    // overlay is hidden by main only if the user confirms. Cancelling would
    // otherwise freeze the displayed time while recording continues.
    ipcRenderer.send('overlay-action', 'delete');
  });

  restartBtn.addEventListener('click', () => {
    // Optimistically clear the display. The renderer will send a fresh
    // overlay-anchor a few hundred ms later when the new recording starts.
    startedAt = null;
    capMs = null;
    autoStopFired = false;
    paused = false;
    pauseStartedAt = null;
    accumulatedPauseMs = 0;
    dot.style.animationPlayState = 'running';
    dot.style.background = '#ef4444';
    pauseBtn.innerHTML = PAUSE_ICON;
    render();
    ipcRenderer.send('overlay-action', 'restart');
  });
</script>
</body>
</html>`;

  overlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  return overlay;
}

// Pre-create the overlay window so the BrowserWindow + transparent panel +
// data-URL load + JS init cost is paid at app startup, not at recording start.
// In prod that lag was 6-7s with the owning app no longer frontmost; with
// pre-warming it drops to a single show() call.
export function ensureOverlayWindow(): BrowserWindow {
  if (overlayWindow && !overlayWindow.isDestroyed()) return overlayWindow;
  overlayWindow = createOverlayWindow();
  return overlayWindow;
}

export function registerWindowHandlers(
  getRecordingWindow: () => BrowserWindow | null,
  hasEditorWindows: () => boolean,
): void {
  ipcMain.handle(
    IPC_CHANNELS.RESIZE_WINDOW,
    (
      event,
      opts: {
        width: number;
        height: number;
        minWidth?: number;
        minHeight?: number;
      },
    ) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return;
      if (opts.minWidth || opts.minHeight) {
        win.setMinimumSize(opts.minWidth || 520, opts.minHeight || 420);
      }

      // A new resize can arrive mid-animation; cancel the prior one first.
      const prevTimer = resizeTimers.get(win.id);
      if (prevTimer) clearInterval(prevTimer);

      const startBounds = win.getBounds();
      const endX = Math.round(
        startBounds.x + (startBounds.width - opts.width) / 2,
      );
      const endY = Math.round(
        startBounds.y + (startBounds.height - opts.height) / 2,
      );

      const steps = 20;
      const duration = 300;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const t = 1 - Math.pow(1 - step / steps, 3);
        const x = Math.round(startBounds.x + (endX - startBounds.x) * t);
        const y = Math.round(startBounds.y + (endY - startBounds.y) * t);
        const w = Math.round(
          startBounds.width + (opts.width - startBounds.width) * t,
        );
        const h = Math.round(
          startBounds.height + (opts.height - startBounds.height) * t,
        );
        win.setBounds({ x, y, width: w, height: h });

        if (step >= steps) {
          clearInterval(timer);
          resizeTimers.delete(win.id);
          win.setBounds({
            x: endX,
            y: endY,
            width: opts.width,
            height: opts.height,
          });
        }
      }, interval);
      resizeTimers.set(win.id, timer);
    },
  );

  ipcMain.handle(IPC_CHANNELS.HIDE_WINDOW, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.hide();
  });
  ipcMain.handle(IPC_CHANNELS.SHOW_WINDOW, (event) => {
    // Don't show the recording toolbar while an editor window is open
    if (hasEditorWindows()) return;
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.show();
      win.focus();
    }
  });
  ipcMain.handle(IPC_CHANNELS.GET_ACTIVE_WINDOW_SOURCE, async () => {
    const { desktopCapturer } = await import("electron");
    const sources = await desktopCapturer.getSources({
      types: ["window"],
      thumbnailSize: { width: 320, height: 180 },
    });
    const ownTitle =
      BrowserWindow.getAllWindows()[0]?.getTitle() || "CaptureFlow";
    const activeSource = sources.find(
      (s) => !s.name.includes(ownTitle) && !s.name.includes("Electron"),
    );
    if (activeSource) {
      return {
        id: activeSource.id,
        name: activeSource.name,
        thumbnailDataUrl: activeSource.thumbnail.toDataURL(),
        displayId: activeSource.display_id,
      };
    }
    return null;
  });
  ipcMain.handle(
    IPC_CHANNELS.SHOW_RECORDING_OVERLAY,
    (_event, opts?: { startedAt?: number; capMs?: number }) => {
      const overlay = ensureOverlayWindow();
      // Re-apply the alwaysOnTop level — panels can drop their level after
      // hide()/show() cycles, which would let the window slip behind the
      // recording dim.
      overlay.setAlwaysOnTop(true, "screen-saver", 1);
      // Two-call pattern: first call (no startedAt) just makes the overlay
      // visible while CaptureFlow is still frontmost — the WindowServer prioritizes
      // first paint for active apps. Second call (with startedAt) sets the
      // timer anchor once the native recorder has reported wallClockMs. Without
      // this split, the show() landed after hideWindow() + focusAppByPid() had
      // backgrounded CaptureFlow, and macOS deferred the panel's first composition
      // by several seconds in prod. capMs (when present) flips the timer to
      // count DOWN from the share cap and auto-fires stop at 0.
      if (typeof opts?.startedAt === "number") {
        overlay.webContents.send("overlay-anchor", {
          startedAt: opts.startedAt,
          capMs: opts.capMs,
        });
      }
      overlay.showInactive();
    },
  );
  ipcMain.handle(
    IPC_CHANNELS.SHOW_RECORDING_DIM,
    (
      _event,
      bounds: { x: number; y: number; width: number; height: number },
      cornerRadius?: number,
    ) => {
      showDimOverlay(bounds, cornerRadius);
    },
  );
  ipcMain.handle(IPC_CHANNELS.HIDE_RECORDING_DIM, () => {
    hideDimOverlay();
  });

  ipcMain.handle(IPC_CHANNELS.HIDE_RECORDING_OVERLAY, () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send("overlay-reset");
      overlayWindow.hide();
    }
  });

  // Forward overlay button actions to the recording renderer. The delete
  // action discards the in-progress recording — gate it behind a native
  // confirm dialog so an accidental click can't wipe the take.
  ipcMain.on("overlay-action", async (_event, action: string) => {
    if (action === "delete") {
      // On macOS, omitting `icon` (or passing an empty image) makes the dialog
      // fall back to the bundle icon — which is Electron's atom in dev. Pass
      // the CaptureFlow logo explicitly so the dialog matches the app identity.
      const { response } = await dialog.showMessageBox({
        type: "none",
        icon: nativeImage.createFromPath(iconAsset),
        buttons: ["Delete Recording", "Cancel"],
        defaultId: 1,
        cancelId: 1,
        message: "Delete this recording?",
        detail:
          "The recording in progress will be discarded. This cannot be undone.",
      });
      if (response !== 0) return;
    }

    const recordingWindow = getRecordingWindow();
    if (recordingWindow && !recordingWindow.isDestroyed()) {
      recordingWindow.webContents.send("overlay-action", action);
    }
    if (action === "stop" || action === "delete") {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send("overlay-reset");
        overlayWindow.hide();
      }
      hideDimOverlay();
    }
  });
}
