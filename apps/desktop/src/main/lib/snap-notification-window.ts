import { BrowserWindow, screen, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { IPC_CHANNELS } from '../../shared/types'

const MODAL_WIDTH = 360
const MODAL_HEIGHT = 360
const MODAL_EDGE_MARGIN = 16
const MODAL_FOOTER_PX = 110
const MODAL_OUTER_PADDING = 12
const MODAL_MAX_HEIGHT = 720
const MODAL_MIN_HEIGHT = 280

let snapNotificationWindow: BrowserWindow | null = null
// webContents.send doesn't queue: hold payloads and flush on did-finish-load.
let snapReady = false
let pendingCaptured: {
  localPath: string
  sourceTitle: string | null
  width: number
  height: number
} | null = null
let pendingUploadComplete: { id: string; viewUrl: string; editUrl: string } | null = null
let pendingUploadFailed: { reason: string } | null = null

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
