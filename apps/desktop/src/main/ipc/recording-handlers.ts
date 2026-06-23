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

  setOnUnexpectedExit(() => {
    const recordingWindow = getRecordingWindow()
    if (recordingWindow && !recordingWindow.isDestroyed()) {
      recordingWindow.webContents.send(IPC_CHANNELS.NATIVE_RECORDER_CRASHED)
    }
  })

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
        excludePid: config.includeSelfWindows ? undefined : process.pid
      })
  )
  ipcMain.handle(IPC_CHANNELS.STOP_NATIVE_RECORDING, () => stopNativeRecording())
  ipcMain.handle(IPC_CHANNELS.PAUSE_NATIVE_RECORDING, () => pauseNativeRecording())
  ipcMain.handle(IPC_CHANNELS.RESUME_NATIVE_RECORDING, () => resumeNativeRecording())
  ipcMain.handle(IPC_CHANNELS.IS_NATIVE_RECORDING_ACTIVE, () => isNativeRecordingActive())
}
