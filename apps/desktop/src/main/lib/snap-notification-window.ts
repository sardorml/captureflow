import { BrowserWindow, screen, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { IPC_CHANNELS } from '../../shared/types'

// Bottom-right "snap ready" modal (mirrors Loom's post-capture
// receipt). Lives in its own frameless BrowserWindow so it can sit
// above the user's app stack regardless of macOS Space, and so the
// transparent corners don't leak the main editor's chrome.
//
// One window at a time — a fresh capture re-uses the same window
// and pushes a SNAP_CAPTURED event to reset its state.

const MODAL_WIDTH = 360
// Fallback height used before the captured image's aspect ratio
// resizes the window. Picked to fit a 16:9 preview comfortably; the
// real height is recomputed in `resizeSnapNotificationToAspect`.
const MODAL_HEIGHT = 360
const MODAL_EDGE_MARGIN = 16
// Pixel budget consumed by chrome that sits below the preview:
// 1px border-t + title row (h-7 icon inside py-3, ~52px) +
// action row (py-3 buttons + outer pb-3, ~58px). Updated whenever
// the renderer layout changes.
const MODAL_FOOTER_PX = 110
// Outer wrapper applies p-3 around the modal card, so 12px on every
// side. Total non-preview vertical = MODAL_FOOTER_PX + 2*12.
const MODAL_OUTER_PADDING = 12
// Cap the window's height so a very tall capture (e.g. a long Slack
// channel screenshot) doesn't run off the screen. Anything above
// this gets letterboxed by the renderer's `object-contain`.
const MODAL_MAX_HEIGHT = 720
const MODAL_MIN_HEIGHT = 280

let snapNotificationWindow: BrowserWindow | null = null
// True once the renderer has fired did-finish-load. `webContents.send`
// doesn't queue — sending a SNAP_CAPTURED before the React subscription
// mounted would silently drop it, leaving the modal stuck on the
// placeholder image. We hold the latest payloads and flush them as
// soon as the renderer signals ready.
let snapReady = false
let pendingCaptured: {
  localPath: string
  sourceTitle: string | null
  width: number
  height: number
} | null = null
let pendingUploadComplete: { id: string; viewUrl: string; editUrl: string } | null = null
let pendingUploadFailed: { reason: string } | null = null

// Position the modal flush against the bottom-right corner of the
// display the capture came from. Falls back to the cursor display
// when bounds are missing (e.g. a Window capture where we only have
// the captured window's screen rect — close enough).
type DisplayBounds = { x: number; y: number; width: number; height: number }
function pickDisplayWorkArea(captureBounds: DisplayBounds | null): {
  x: number
  y: number
  width: number
  height: number
} {
  if (captureBounds) {
    const display = screen.getDisplayMatching(captureBounds)
    return display.workArea
  }
  const cursor = screen.getCursorScreenPoint()
  return screen.getDisplayNearestPoint(cursor).workArea
}

export function ensureSnapNotificationWindow(captureBounds: DisplayBounds | null): BrowserWindow {
  if (snapNotificationWindow && !snapNotificationWindow.isDestroyed()) {
    snapNotificationWindow.showInactive()
    return snapNotificationWindow
  }

  const workArea = pickDisplayWorkArea(captureBounds)
  const win = new BrowserWindow({
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    x: workArea.x + workArea.width - MODAL_WIDTH - MODAL_EDGE_MARGIN,
    y: workArea.y + workArea.height - MODAL_HEIGHT - MODAL_EDGE_MARGIN,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    roundedCorners: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.setVisibleOnAllWorkspaces(true)
  win.setAlwaysOnTop(true, 'screen-saver', 2)

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  win.on('closed', () => {
    snapNotificationWindow = null
    snapReady = false
    pendingCaptured = null
    pendingUploadComplete = null
    pendingUploadFailed = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/snap-notification`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/snap-notification'
    })
  }

  win.once('ready-to-show', () => {
    win.showInactive()
  })

  // Flush any pre-load IPCs once the renderer is actually listening.
  // `webContents.send` doesn't queue — sending before did-finish-load
  // silently drops the message, so the modal would stay stuck on its
  // initial empty state otherwise.
  win.webContents.once('did-finish-load', () => {
    snapReady = true
    if (pendingCaptured) {
      win.webContents.send(IPC_CHANNELS.SNAP_CAPTURED, pendingCaptured)
      pendingCaptured = null
    }
    if (pendingUploadComplete) {
      win.webContents.send(IPC_CHANNELS.SNAP_UPLOAD_COMPLETE, pendingUploadComplete)
      pendingUploadComplete = null
    }
    if (pendingUploadFailed) {
      win.webContents.send(IPC_CHANNELS.SNAP_UPLOAD_FAILED, pendingUploadFailed)
      pendingUploadFailed = null
    }
  })

  snapNotificationWindow = win
  return win
}

export function getSnapNotificationWindow(): BrowserWindow | null {
  if (!snapNotificationWindow || snapNotificationWindow.isDestroyed()) return null
  return snapNotificationWindow
}

export function closeSnapNotificationWindow(): void {
  if (snapNotificationWindow && !snapNotificationWindow.isDestroyed()) {
    snapNotificationWindow.close()
  }
  snapNotificationWindow = null
}

// Resize the notification window so the preview pane matches the
// captured image's aspect ratio (width stays fixed, height adapts).
// Re-anchors to the bottom-right of the source display so the modal
// doesn't drift as it grows / shrinks between captures.
export function resizeSnapNotificationToAspect(
  imgWidth: number,
  imgHeight: number,
  captureBounds: DisplayBounds | null
): void {
  const win = getSnapNotificationWindow()
  if (!win) return
  if (!Number.isFinite(imgWidth) || !Number.isFinite(imgHeight)) return
  if (imgWidth <= 0 || imgHeight <= 0) return

  const previewWidth = MODAL_WIDTH - MODAL_OUTER_PADDING * 2
  const previewHeight = (previewWidth * imgHeight) / imgWidth
  const fixedChrome = MODAL_FOOTER_PX + MODAL_OUTER_PADDING * 2
  const ideal = Math.round(fixedChrome + previewHeight)

  const workArea = pickDisplayWorkArea(captureBounds)
  const cap = Math.min(MODAL_MAX_HEIGHT, Math.floor(workArea.height - MODAL_EDGE_MARGIN * 2))
  const newHeight = Math.max(MODAL_MIN_HEIGHT, Math.min(ideal, cap))

  win.setBounds({
    width: MODAL_WIDTH,
    height: newHeight,
    x: workArea.x + workArea.width - MODAL_WIDTH - MODAL_EDGE_MARGIN,
    y: workArea.y + workArea.height - newHeight - MODAL_EDGE_MARGIN
  })
}

// Convenience wrappers. Each one either forwards directly (renderer
// is ready) or buffers into the pending slot so the did-finish-load
// flush picks it up — webContents.send doesn't queue on its own.
export function sendSnapCaptured(payload: {
  localPath: string
  sourceTitle: string | null
  width: number
  height: number
}): void {
  const win = getSnapNotificationWindow()
  if (!win || !snapReady) {
    pendingCaptured = payload
    return
  }
  win.webContents.send(IPC_CHANNELS.SNAP_CAPTURED, payload)
}

export function sendSnapUploadComplete(payload: {
  id: string
  viewUrl: string
  editUrl: string
}): void {
  const win = getSnapNotificationWindow()
  if (!win || !snapReady) {
    pendingUploadComplete = payload
    return
  }
  win.webContents.send(IPC_CHANNELS.SNAP_UPLOAD_COMPLETE, payload)
}

export function sendSnapUploadFailed(payload: { reason: string }): void {
  const win = getSnapNotificationWindow()
  if (!win || !snapReady) {
    pendingUploadFailed = payload
    return
  }
  win.webContents.send(IPC_CHANNELS.SNAP_UPLOAD_FAILED, payload)
}
