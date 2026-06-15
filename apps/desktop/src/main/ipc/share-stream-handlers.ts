/**
 * IPC handlers for the streaming-upload protocol.
 *
 *   SHARE_START         → invoke; main reserves a slug via /api/init
 *                          and the renderer arms the pipeline.
 *   SHARE_PART_SCREEN   → fire-and-forget; main buffers bytes per
 *   SHARE_PART_WEBCAM     stream, pumps a part once ≥5 MiB.
 *   SHARE_FINISH        → invoke; flushes both tails, calls
 *                          /api/finalize + /api/webcam-finalize, returns
 *                          the edit URL (or partial-URL failure).
 *   SHARE_ABORT         → fire-and-forget; discards in-flight state.
 *
 * Share visibility + deletion are managed on the web edit page, not in
 * the desktop app.
 */

import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types'
import type { ShareFinishMeta, ShareStartMeta } from '../../shared/types'
import {
  abortShareUpload,
  finishShareUpload,
  getActiveDeviceId,
  getActiveShareSlug,
  pushScreenBytes,
  pushWebcamBytes,
  startShareUpload
} from '../lib/share/share-upload-streamer'
import { postPoster } from '../lib/share/share-api-client'
import { logInfo, logWarn } from '../lib/logger'

export function registerShareStreamHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SHARE_START, (_event, meta: ShareStartMeta) => startShareUpload(meta))
  ipcMain.on(IPC_CHANNELS.SHARE_PART_SCREEN, (_event, bytes: ArrayBuffer) => {
    pushScreenBytes(bytes)
  })
  ipcMain.on(IPC_CHANNELS.SHARE_PART_WEBCAM, (_event, bytes: ArrayBuffer) => {
    pushWebcamBytes(bytes)
  })
  ipcMain.handle(IPC_CHANNELS.SHARE_FINISH, (_event, meta: ShareFinishMeta) =>
    finishShareUpload(meta)
  )
  ipcMain.on(IPC_CHANNELS.SHARE_ABORT, () => {
    abortShareUpload()
  })
  // Poster upload — fire-and-forget. The worker accepts posters while
  // the share is still `pending`, so this races finalize harmlessly.
  // Failure here is non-fatal: the link still works without an OG image.
  ipcMain.on(IPC_CHANNELS.SHARE_UPLOAD_POSTER, async (_event, bytes: ArrayBuffer) => {
    const slug = getActiveShareSlug()
    const deviceId = getActiveDeviceId()
    if (!slug || !deviceId) {
      logWarn('share', 'poster upload: no active share session')
      return
    }
    try {
      await postPoster<{ posterKey: string; url: string }>(
        `/poster?slug=${encodeURIComponent(slug)}`,
        deviceId,
        new Uint8Array(bytes)
      )
      logInfo('share', `poster uploaded: slug=${slug}, ${bytes.byteLength}B`)
    } catch (err) {
      logWarn('share', `poster upload failed for ${slug}: ${String(err)}`)
    }
  })
}
