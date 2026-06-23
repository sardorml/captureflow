/**
 * Native confirm dialog shown when a user taps a Pro-only capture mode
 * (Share / Screenshot) they can't use yet. Buttons depend on account state:
 *
 *   - signed out       → "Sign in" + "Upgrade to Pro"
 *   - signed in (free) → "Open dashboard" + "Upgrade to Pro"
 *
 * Pro requires a signed-in captureflow.xyz subscription, so a signed-out user
 * is offered sign-in (the precondition) alongside the upgrade path; a free
 * signed-in user is steered to the dashboard or checkout.
 *
 * Registered at module load (imported for side effects from main/index.ts).
 */

import { dialog, ipcMain, nativeImage } from 'electron'
import captureflowIconPath from '../../../resources/icon.png?asset'
import { IPC_CHANNELS, type UpgradeReason } from '../../shared/types'
import {
  openAccountDashboard,
  openUpgrade,
  signInToShareAccount
} from './share/share-account-actions'
import { getShareAuthState } from './share/share-auth'
import { logInfo } from './logger'

const REASON_MESSAGE: Record<UpgradeReason, string> = {
  share: 'Sign in to share',
  screenshot: 'Sign in to share screenshots',
  cloud: 'Sign in to use cloud sharing'
}

ipcMain.handle(IPC_CHANNELS.CAPTURE_GATE_OPEN, async (_event, reason: UpgradeReason) => {
  const signedIn = getShareAuthState().kind === 'signed_in'
  const message = REASON_MESSAGE[reason] ?? REASON_MESSAGE.cloud

  // Button index 0 = Upgrade (primary), 1 = secondary (sign-in or dashboard),
  // 2 = Cancel. Keep the order in sync with the response routing below.
  const secondary = signedIn ? 'Open dashboard' : 'Sign in'
  const detail = signedIn
    ? 'Upgrade to Pro to unlock this, or open your dashboard to manage your account.'
    : 'Sign in to your CaptureFlow account and upgrade to Pro to unlock this feature.'

  const options = {
    type: 'info' as const,
    icon: nativeImage.createFromPath(captureflowIconPath),
    title: 'CaptureFlow Pro',
    message,
    detail,
    buttons: ['Upgrade to Pro', secondary, 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    noLink: true
  }
  // Freestanding (no parent window): attaching it as a sheet to the
  // transparent, click-through toolbar window dims that window into a weird
  // band and makes the sheet undraggable. App-modal shows a clean centered alert.
  const { response } = await dialog.showMessageBox(options)

  logInfo('capture-gate', `reason=${reason} signedIn=${signedIn} response=${response}`)

  if (response === 0) {
    await openUpgrade()
  } else if (response === 1) {
    if (signedIn) await openAccountDashboard()
    else await signInToShareAccount()
  }
})
