import { BrowserWindow, screen } from 'electron'
import { uIOhook, UiohookMouseEvent } from 'uiohook-napi'
import {
  IPC_CHANNELS,
  type CursorPosition,
  type ClickEvent,
  type TrackingData,
  type WindowBounds
} from '../shared/types'
import { startCursorMonitor, stopCursorMonitor, getCurrentCursorType } from './cursor-monitor'
import { logInfo, logWarn } from './lib/logger'

function broadcastCursorPosition(pos: CursorPosition): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.isDestroyed()) continue
    win.webContents.send(IPC_CHANNELS.CURSOR_POSITION_EVENT, pos)
  }
}

let positions: CursorPosition[] = []
let clicks: ClickEvent[] = []
let interval: ReturnType<typeof setInterval> | null = null
let startTime = 0
let paused = false
let pauseStart = 0
let totalPauseDuration = 0
let bounds = { x: 0, y: 0, width: 1920, height: 1080 }
let hookStarted = false

export function startTracking(
  displayId: string,
  windowBounds?: WindowBounds,
  externalStartTimeMs?: number
): void {
  if (windowBounds) {
    bounds = windowBounds
  } else {
    const displays = screen.getAllDisplays()
    const display = displays.find((d) => String(d.id) === displayId) ?? screen.getPrimaryDisplay()
    bounds = display.bounds
  }

  /*
   * Cursor normalization divides by width/height; a zero yields NaN/±Inf
   * coords that corrupt tracking.json. Substitute a fallback per-axis (don't
   * mutate Electron's display.bounds object).
   */
  if (!(bounds.width > 0) || !(bounds.height > 0)) {
    logWarn('cursor', `invalid capture bounds ${JSON.stringify(bounds)}; falling back to 1920x1080`)
    bounds = {
      ...bounds,
      width: bounds.width > 0 ? bounds.width : 1920,
      height: bounds.height > 0 ? bounds.height : 1080
    }
  }

  positions = []
  clicks = []
  startTime = externalStartTimeMs ?? Date.now()
  paused = false
  pauseStart = 0
  totalPauseDuration = 0
  logInfo(
    'cursor',
    `tracking started: bounds=${JSON.stringify(bounds)}, startTime=${startTime}${
      externalStartTimeMs ? ' (synced to video)' : ' (local clock)'
    }`
  )

  try {
    startCursorMonitor()
  } catch {
    console.warn('[cursor-tracker] Cursor monitor unavailable, falling back to arrow')
  }

  interval = setInterval(() => {
    if (paused) return
    const point = screen.getCursorScreenPoint()
    const x = Math.max(0, Math.min(1, (point.x - bounds.x) / bounds.width))
    const y = Math.max(0, Math.min(1, (point.y - bounds.y) / bounds.height))
    const cursorType = getCurrentCursorType()
    const pos: CursorPosition = {
      time: Date.now() - startTime - totalPauseDuration,
      x,
      y,
      cursorType
    }
    positions.push(pos)
    broadcastCursorPosition(pos)
  }, 8)

  const onMouseDown = (e: UiohookMouseEvent): void => {
    if (paused) return
    const x = Math.max(0, Math.min(1, (e.x - bounds.x) / bounds.width))
    const y = Math.max(0, Math.min(1, (e.y - bounds.y) / bounds.height))
    clicks.push({ time: Date.now() - startTime - totalPauseDuration, x, y })
  }

  uIOhook.on('mousedown', onMouseDown)
  if (!hookStarted) {
    uIOhook.start()
    hookStarted = true
  }
}

export function pauseTracking(): void {
  // Ignore a double-pause: overwriting pauseStart would undercount totalPauseDuration.
  if (paused) return
  paused = true
  pauseStart = Date.now()
}

export function resumeTracking(): void {
  // Ignore a resume when not paused (double-resume / out-of-order IPC) to avoid undercounting totalPauseDuration.
  if (!paused) return
  if (pauseStart > 0) {
    totalPauseDuration += Date.now() - pauseStart
  }
  pauseStart = 0
  paused = false
}

export function stopTracking(): TrackingData {
  if (interval) {
    clearInterval(interval)
    interval = null
  }

  uIOhook.removeAllListeners('mousedown')
  stopCursorMonitor()

  const data: TrackingData = { cursor: positions, clicks }
  logInfo(
    'cursor',
    `tracking stopped: positions=${positions.length}, clicks=${clicks.length}, totalPauseDuration=${totalPauseDuration}ms`
  )
  positions = []
  clicks = []
  return data
}
