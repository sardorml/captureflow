import { ipcMain, shell, type BrowserWindow } from "electron";
import { IPC_CHANNELS, type WindowBounds } from "../../shared/types";
import { getSources } from "../capture";
import {
  startNativeRecording,
  stopNativeRecording,
  pauseNativeRecording,
  resumeNativeRecording,
  isNativeRecordingActive,
  setOnUnexpectedExit,
  setOnRecordingEvent,
} from "../native-recorder";

export function registerRecordingHandlers(
  getRecordingWindow: () => BrowserWindow | null,
): void {
  ipcMain.handle(IPC_CHANNELS.GET_SOURCES, getSources);
  ipcMain.handle(IPC_CHANNELS.SHOW_ITEM_IN_FOLDER, (_event, path: string) => {
    shell.showItemInFolder(path);
  });

  setOnUnexpectedExit(() => {
    const recordingWindow = getRecordingWindow();
    if (recordingWindow && !recordingWindow.isDestroyed()) {
      recordingWindow.webContents.send(IPC_CHANNELS.NATIVE_RECORDER_CRASHED);
    }
  });

  setOnRecordingEvent((event) => {
    const recordingWindow = getRecordingWindow();
    if (recordingWindow && !recordingWindow.isDestroyed()) {
      recordingWindow.webContents.send(
        IPC_CHANNELS.RECORDING_FRAME_EVENT,
        event,
      );
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.START_NATIVE_RECORDING,
    (
      _event,
      config: {
        displayId?: number;
        windowId?: number;
        fps?: number;
        captureAudio?: boolean;
        includeSelfWindows?: boolean;
        cropRect?: WindowBounds;
      },
    ) =>
      // Recordings capture the native cursor in-frame; screenshots stay
      // cursor-free via their own snapshot config.
      startNativeRecording({
        ...config,
        showsCursor: true,
        excludePid: config.includeSelfWindows ? undefined : process.pid,
      }),
  );
  ipcMain.handle(IPC_CHANNELS.STOP_NATIVE_RECORDING, () =>
    stopNativeRecording(),
  );
  ipcMain.handle(IPC_CHANNELS.PAUSE_NATIVE_RECORDING, () =>
    pauseNativeRecording(),
  );
  ipcMain.handle(IPC_CHANNELS.RESUME_NATIVE_RECORDING, () =>
    resumeNativeRecording(),
  );
  ipcMain.handle(IPC_CHANNELS.IS_NATIVE_RECORDING_ACTIVE, () =>
    isNativeRecordingActive(),
  );
}
