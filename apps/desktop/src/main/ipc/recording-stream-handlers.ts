/**
 * IPC handlers for the streaming-upload protocol.
 *
 *   RECORDING_START         → invoke; main reserves a slug via /api/init
 *                          and the renderer arms the pipeline.
 *   RECORDING_PART_SCREEN   → fire-and-forget; main buffers bytes per
 *   RECORDING_PART_WEBCAM     stream, pumps a part once ≥5 MiB.
 *   RECORDING_FINISH        → invoke; flushes both tails, calls
 *                          /api/finalize + /api/webcam-finalize, returns
 *                          the edit URL (or partial-URL failure).
 *   RECORDING_ABORT         → fire-and-forget; discards in-flight state.
 *
 * Recording visibility + deletion are managed on the web edit page, not in
 * the desktop app.
 */

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/types";
import type {
  RecordingFinishMeta,
  RecordingStartMeta,
} from "../../shared/types";
import {
  abortRecordingUpload,
  finishRecordingUpload,
  getActiveDeviceId,
  getActiveRecordingSlug,
  pushScreenBytes,
  pushWebcamBytes,
  startRecordingUpload,
} from "../lib/recording/recording-upload-streamer";
import { postPoster } from "../lib/recording/recording-api-client";
import { logInfo, logWarn } from "../lib/logger";

export function registerRecordingStreamHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.RECORDING_START,
    (_event, meta: RecordingStartMeta) => startRecordingUpload(meta),
  );
  ipcMain.on(
    IPC_CHANNELS.RECORDING_PART_SCREEN,
    (_event, bytes: ArrayBuffer) => {
      pushScreenBytes(bytes);
    },
  );
  ipcMain.on(
    IPC_CHANNELS.RECORDING_PART_WEBCAM,
    (_event, bytes: ArrayBuffer) => {
      pushWebcamBytes(bytes);
    },
  );
  ipcMain.handle(
    IPC_CHANNELS.RECORDING_FINISH,
    (_event, meta: RecordingFinishMeta) => finishRecordingUpload(meta),
  );
  ipcMain.on(IPC_CHANNELS.RECORDING_ABORT, () => {
    abortRecordingUpload();
  });
  // The worker accepts posters while the recording is `pending`, so this races finalize
  // harmlessly; failure is non-fatal (link works without the OG image).
  ipcMain.on(
    IPC_CHANNELS.RECORDING_UPLOAD_POSTER,
    async (_event, bytes: ArrayBuffer) => {
      const slug = getActiveRecordingSlug();
      const deviceId = getActiveDeviceId();
      if (!slug || !deviceId) {
        logWarn("recording", "poster upload: no active recording session");
        return;
      }
      try {
        await postPoster<{ posterKey: string; url: string }>(
          `/poster?slug=${encodeURIComponent(slug)}`,
          deviceId,
          new Uint8Array(bytes),
        );
        logInfo(
          "recording",
          `poster uploaded: slug=${slug}, ${bytes.byteLength}B`,
        );
      } catch (err) {
        logWarn(
          "recording",
          `poster upload failed for ${slug}: ${String(err)}`,
        );
      }
    },
  );
}
