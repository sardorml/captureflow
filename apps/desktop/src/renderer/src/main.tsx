/* eslint-disable react-refresh/only-export-components */
import './assets/main.css'
import 'material-symbols/rounded.css'
import './stores/theme-store'
import { bootEntitlementStore } from './stores/entitlement-store'
import { initAnalytics, setAnalyticsEnabled, setAnalyticsIdentity, track } from './lib/analytics'
import type { ShareAuthState } from '../../shared/types'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { PermissionDialogWindow } from './components/permissions/PermissionDialogWindow'
import { ShareFailureModal } from './components/share/ShareFailureModal'

bootEntitlementStore()

const params = new URLSearchParams(window.location.search)
const view = params.get('view')

// Boot opt-in usage analytics. Every window runs this so track() works
// wherever it's called, but `app_opened` fires only from the main toolbar
// window (no `view`, base hash) to avoid one event per BrowserWindow. Stays
// fully dormant unless a PostHog key is configured and the user opted in.
const isMainToolbar = !view && (window.location.hash === '' || window.location.hash === '#/')
void (async (): Promise<void> => {
  try {
    let latestAuth: ShareAuthState = { kind: 'signed_out' }
    const [prefs, auth] = await Promise.all([
      window.electronAPI.getUserPrefs(),
      window.electronAPI.getShareAuth()
    ])
    latestAuth = auth
    initAnalytics({ enabled: prefs.analyticsEnabled, auth })
    window.electronAPI.onUserPrefsChanged((p) =>
      setAnalyticsEnabled(p.analyticsEnabled, latestAuth)
    )
    window.electronAPI.onShareAuthChanged((s) => {
      latestAuth = s
      setAnalyticsIdentity(s)
    })
    if (isMainToolbar) track('app_opened')
  } catch {
    // Analytics must never block the app — swallow and stay dormant.
  }
})()

// Transparent BrowserWindows still inherit body's `bg-background` from
// main.css, so on cold-mount the first paint is dark and `ready-to-show`
// reveals a black rectangle for a frame before per-component effects can
// repaint body transparent. Strip the background synchronously here so
// the first paint is already transparent. Per-component effects become
// no-ops on these views.
const TRANSPARENT_VIEWS = new Set(['share-failure'])
// Hash-routed entries inside App.tsx that also live in transparent
// BrowserWindows. The default route (no hash) is the recording
// toolbar — the biggest source of the cold-mount black flash, since
// the toolbar window is mostly transparent and the bar is a small
// dark pill inside it.
const TRANSPARENT_HASHES = new Set([
  '',
  '#/',
  '#/selection-overlay',
  '#/webcam-bubble',
  '#/snap-notification'
])
const isTransparent =
  (view && TRANSPARENT_VIEWS.has(view)) || (!view && TRANSPARENT_HASHES.has(window.location.hash))
if (isTransparent) {
  document.documentElement.style.background = 'transparent'
  document.body.style.background = 'transparent'
}

function RootApp(): React.JSX.Element {
  if (view === 'permission-dialog') return <PermissionDialogWindow />
  if (view === 'share-failure') return <ShareFailureModal />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
)
