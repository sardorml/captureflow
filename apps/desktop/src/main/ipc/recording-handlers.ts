import { ipcMain, shell, type BrowserWindow } from 'electron'
import { IPC_CHANNELS, type WindowBounds } from '../../shared/types'
import { getSources } from '../capture'
import { getRecordingsDirPath, deleteCurrentSession } from '../storage'
import { startTracking, stopTracking, pauseTracking, resumeTracking } from '../cursor-tracker'
import {
  startNativeRecording,
  stopNativeRecording,
  pauseNativeRecording,
  resumeNativeRecording,
  isNativeRecordingActive,
  setOnUnexpectedExit,
  setOnShareEvent
} from '../native-recorder'

export function registerRecordingHandlers(getRecordingWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IPC_CHANNELS.GET_SOURCES, getSources)
  ipcMain.handle(IPC_CHANNELS.GET_RECORDINGS_DIR, getRecordingsDirPath)
  ipcMain.handle(IPC_CHANNELS.SHOW_ITEM_IN_FOLDER, (_event, path: string) => {
    shell.showItemInFolder(path)
  })

  // Cursor tracking. The live CURSOR_POSITION_EVENT stream (broadcast on
  // every tick) feeds the share compositing encoder; stopTracking returns
  // the full sample set for finalize. No on-disk persistence — share
  // streams everything to the backend.
  ipcMain.handle(
    IPC_CHANNELS.START_CURSOR_TRACKING,
    (_event, displayId: string, windowBounds?: WindowBounds, wallClockMs?: number) => {
      startTracking(displayId, windowBounds, wallClockMs)
    }
  )
  ipcMain.handle(IPC_CHANNELS.STOP_CURSOR_TRACKING, () => {
    return { data: stopTracking() }
  })
  ipcMain.handle(IPC_CHANNELS.PAUSE_CURSOR_TRACKING, () => pauseTracking())
  ipcMain.handle(IPC_CHANNELS.RESUME_CURSOR_TRACKING, () => resumeTracking())
  ipcMain.handle(IPC_CHANNELS.DELETE_CURRENT_SESSION, () => deleteCurrentSession())

  // Native screen recorder (ScreenCaptureKit on macOS)
  setOnUnexpectedExit(() => {
    const recordingWindow = getRecordingWindow()
    if (recordingWindow && !recordingWindow.isDestroyed()) {
      recordingWindow.webContents.send(IPC_CHANNELS.NATIVE_RECORDER_CRASHED)
    }
  })

  // Forward share-pipeline events from the native recorder to the
  // recording window, where ShareEncoder consumes them. The
  // RecordingToolbar owns the encoder lifecycle since it persists
  // across recording sessions.
  setOnShareEvent((event) => {
    const recordingWindow = getRecordingWindow()
    if (recordingWindow && !recordingWindow.isDestroyed()) {
      recordingWindow.webContents.send(IPC_CHANNELS.SHARE_FRAME_EVENT, event)
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.START_NATIVE_RECORDING,
    (
      _event,
      config: {
        outputDir: string
        displayId?: number
        windowId?: number
        fps?: number
        captureAudio?: boolean
        includeSelfWindows?: boolean
        cropRect?: WindowBounds
        share?: boolean
      }
    ) =>
      startNativeRecording({
        ...config,
        showsCursor: false,
        // Dev-only: when includeSelfWindows is true, don't filter CaptureFlow's
        // own windows out of the capture — lets the editor record itself
        // for testing.
        excludePid: config.includeSelfWindows ? undefined : process.pid
      })
  )
  ipcMain.handle(IPC_CHANNELS.STOP_NATIVE_RECORDING, () => stopNativeRecording())
  ipcMain.handle(IPC_CHANNELS.PAUSE_NATIVE_RECORDING, () => pauseNativeRecording())
  ipcMain.handle(IPC_CHANNELS.RESUME_NATIVE_RECORDING, () => resumeNativeRecording())
  ipcMain.handle(IPC_CHANNELS.IS_NATIVE_RECORDING_ACTIVE, () => isNativeRecordingActive())

  // Share IPC lives in share-stream-handlers.ts — the streaming upload
  // protocol (SHARE_START / SHARE_PART_* / SHARE_FINISH / SHARE_ABORT).
  // Share visibility + deletion are managed on the web edit page, not here.
}
