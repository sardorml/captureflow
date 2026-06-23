import { app, BrowserWindow, ipcMain, shell, systemPreferences } from 'electron'
import { access } from 'fs/promises'
import { execFile } from 'child_process'
import { release } from 'os'
import { IPC_CHANNELS } from '../../shared/types'
import type { BugReportPayload, BugReportResult, UserPrefs } from '../../shared/types'
import { getUserPrefs, setUserPref } from '../lib/user-prefs'
import {
  getAllPermissions,
  requestMicPermission,
  requestCameraPermission,
  requestAccessibility,
  probeScreenRecordingPermission
} from '../capture'
import { openPermissionDialogWindow } from '../index'

type MediaPermissionKind = 'camera' | 'microphone'

const PRIVACY_PANE: Record<MediaPermissionKind, string> = {
  camera: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Camera',
  microphone: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone'
}

export function registerSystemHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GET_USER_PREFS, () => getUserPrefs())

  ipcMain.handle(
    IPC_CHANNELS.SET_USER_PREF,
    (_evt, key: keyof UserPrefs, value: UserPrefs[keyof UserPrefs]) => {
      return setUserPref(key, value)
    }
  )

  ipcMain.handle(IPC_CHANNELS.GET_PERMISSIONS, () => getAllPermissions())
  ipcMain.handle(IPC_CHANNELS.REQUEST_MIC_PERMISSION, () => requestMicPermission())
  ipcMain.handle(IPC_CHANNELS.REQUEST_CAMERA_PERMISSION, () => requestCameraPermission())

  ipcMain.handle(
    IPC_CHANNELS.REQUEST_MEDIA_PERMISSION,
    async (event, kind: MediaPermissionKind): Promise<boolean> => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win) return false
      const status = systemPreferences.getMediaAccessStatus(kind)
      if (status === 'granted') return true

      // askForMediaAccess only ever prompts once per app, so call it only while 'not-determined'.
      if (status === 'not-determined') {
        return systemPreferences.askForMediaAccess(kind)
      }

      // Previously denied — TCC won't reprompt, so deep-link to System Settings instead.
      const allow = await openPermissionDialogWindow(win, { kind, variant: 'denied' })
      if (allow) {
        await shell.openExternal(PRIVACY_PANE[kind])
      }
      return false
    }
  )

  ipcMain.handle(IPC_CHANNELS.REQUEST_ACCESSIBILITY, () => requestAccessibility())

  ipcMain.handle(IPC_CHANNELS.PROBE_SCREEN_RECORDING_PERMISSION, () =>
    probeScreenRecordingPermission()
  )

  ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL, async (_event, url: string) => {
    await shell.openExternal(url)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_EXISTS, async (_event, filePath: string) => {
    try {
      await access(filePath)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle(IPC_CHANNELS.PLAY_SOUND, (_event, name: string) => {
    const soundPath = `/System/Library/Sounds/${name}.aiff`
    execFile('afplay', [soundPath], (err) => {
      if (err) console.warn('[sound] failed to play', name, err.message)
    })
  })

  // Routed through main because the renderer's CSP (`default-src 'self'`) blocks outbound HTTP.
  // FormSubmit's `/ajax/` path soft-rejects a missing `Origin` (returns 200 + `{success:"false"}`,
  // not 4xx), so mirror the landing origin and parse `success` from the body — checking only
  // `res.ok` produced false-positive "Report sent" toasts with no email sent.
  ipcMain.handle(
    IPC_CHANNELS.SEND_BUG_REPORT,
    async (_event, payload: BugReportPayload): Promise<BugReportResult> => {
      const description = payload.description?.trim() ?? ''
      if (!description) return { ok: false, error: 'Description is required' }

      const formikKey = process.env.FORMIK_KEY
      if (!formikKey) {
        console.error('[bug-report] FORMIK_KEY missing from build')
        return { ok: false, error: 'Bug reporting is not configured in this build' }
      }

      const email = payload.email?.trim() || ''
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15_000)
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${formikKey}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Origin: 'https://captureflow.xyz',
            Referer: 'https://captureflow.xyz/'
          },
          body: JSON.stringify({
            description,
            email: email || '(not provided)',
            appVersion: app.getVersion(),
            platform: `${process.platform} ${process.arch}`,
            osRelease: release(),
            _subject: `CaptureFlow bug report${email ? ` from ${email}` : ''}`,
            _template: 'table',
            _captcha: 'false'
          }),
          signal: controller.signal
        })

        const raw = await res.text()
        let parsed: { success?: string | boolean; message?: string } | null = null
        try {
          parsed = JSON.parse(raw) as { success?: string | boolean; message?: string }
        } catch {
          parsed = null
        }

        const succeeded = res.ok && (parsed?.success === true || parsed?.success === 'true')

        if (!succeeded) {
          console.error('[bug-report] FormSubmit rejected', {
            status: res.status,
            body: raw.slice(0, 400)
          })
          return {
            ok: false,
            error: parsed?.message ?? `Send failed (HTTP ${res.status})`
          }
        }
        return { ok: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Network error'
        console.error('[bug-report] send threw', message)
        return { ok: false, error: message }
      } finally {
        clearTimeout(timeout)
      }
    }
  )
}
