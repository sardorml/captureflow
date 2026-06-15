import { shell } from 'electron'
import { hostname } from 'os'

// Shared captureflow.xyz account actions, routed through main because
// shell.openExternal lives in this process. Used by the share-auth IPC
// handlers and the capture-gate native dialog so both stay in sync.

// Public origin of captureflow.xyz — the consolidated single-domain app
// (dashboard + auth) after the cutover. Mints the device token and bounces
// back via the captureflow:// scheme. Override at dev time to point at a local
// Next.js server (`CAPTUREFLOW_APP_WEB_BASE=http://localhost:3032`).
const APP_WEB_BASE = process.env.CAPTUREFLOW_APP_WEB_BASE ?? 'https://captureflow.xyz'

/** Open the browser at the device-token sign-in page. */
export async function signInToShareAccount(): Promise<void> {
  // Hostname is best-effort device labelling so the user can tell their Macs
  // apart on the dashboard's "Connected devices" panel.
  let label = ''
  try {
    label = hostname()
  } catch {
    label = ''
  }
  const url = new URL(`${APP_WEB_BASE}/auth/callback`)
  if (label) url.searchParams.set('label', label)
  await shell.openExternal(url.toString())
}

/** Open the pricing page, where the user picks a plan and checks out. */
export async function openUpgrade(): Promise<void> {
  await shell.openExternal(`${APP_WEB_BASE}/plan`)
}

/** Open the captureflow.xyz dashboard (Shares is the signed-in home). */
export async function openAccountDashboard(): Promise<void> {
  await shell.openExternal(`${APP_WEB_BASE}/shares`)
}
