import { autoUpdater } from 'electron-updater'
import { dialog, nativeImage } from 'electron'
import { is } from '@electron-toolkit/utils'
import captureflowIconPath from '../../../resources/icon.png?asset'
import { logInfo, logError } from './logger'

// Squirrel validates the Developer ID signature before swapping the bundle, so
// a tampered release asset can't ship a forged binary.
export function initAutoUpdater(): void {
  if (is.dev) return

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  let busy = false
  const ignored = new Set<string>()

  autoUpdater.on('checking-for-update', () => {
    logInfo('updater', 'checking for update')
  })

  autoUpdater.on('update-available', (info) => {
    logInfo('updater', `update available: ${info.version}`)
    if (busy || ignored.has(info.version)) return
    busy = true
    void dialog
      .showMessageBox({
        type: 'info',
        icon: nativeImage.createFromPath(captureflowIconPath),
        title: 'Update CaptureFlow',
        message: `Version ${info.version} of CaptureFlow is available, would you like to install it?`,
        detail: 'CaptureFlow will download the update and restart to install it.',
        buttons: ['Ignore', 'Update'],
        defaultId: 1,
        cancelId: 0,
        noLink: true
      })
      .then(({ response }) => {
        if (response === 1) {
          // Keep `busy` set through the download so a re-check can't re-prompt.
          autoUpdater.downloadUpdate().catch((err) => {
            busy = false
            logError('updater', `downloadUpdate threw: ${String(err)}`)
          })
        } else {
          ignored.add(info.version)
          busy = false
        }
      })
  })

  autoUpdater.on('update-not-available', () => {
    logInfo('updater', 'no update available')
  })

  autoUpdater.on('download-progress', (p) => {
    logInfo('updater', `download progress: ${Math.round(p.percent)}%`)
  })

  autoUpdater.on('update-downloaded', (info) => {
    logInfo('updater', `update downloaded: ${info.version} — quitting to install`)
    autoUpdater.quitAndInstall()
  })

  autoUpdater.on('error', (err) => {
    busy = false
    logError('updater', `error: ${String(err)}`)
  })

  void autoUpdater.checkForUpdates().catch((err) => {
    logError('updater', `checkForUpdates threw: ${String(err)}`)
  })
}
