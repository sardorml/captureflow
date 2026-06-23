import { create } from 'zustand'
import type { ShareAuthState, ShareUsageState } from '../../../shared/types'

// App-wide Pro entitlement. Subscription-only: "Pro" means the signed-in
// account has an active subscription, surfaced as `proSubscriptionActive` on
// /api/usage. Main broadcasts usage changes to every window, so this store
// mirrors that signal; every Pro gate reads from it via `selectIsPro`.

type EntitlementState = {
  isPro: boolean
  // True once we have a definitive answer (signed out, dev toggle, or the usage
  // probe resolved). Gates actions that shouldn't fire on the indeterminate
  // first paint — e.g. bouncing a Pro user off a Pro-only capture mode.
  hydrated: boolean
  setPro: (isPro: boolean) => void
  setHydrated: (hydrated: boolean) => void
}

export const useEntitlementStore = create<EntitlementState>((set) => ({
  isPro: false,
  hydrated: false,
  setPro: (isPro) => set({ isPro }),
  setHydrated: (hydrated) => set({ hydrated })
}))

export const selectIsPro = (s: EntitlementState): boolean => s.isPro

// Dev-only Pro override: in dev builds the Dev Toggles modal can force Pro on
// to exercise Pro-gated features without a real subscription. Persisted in
// localStorage so it survives reloads; gated on `import.meta.env.DEV`, so it's
// inert in a packaged build. The key is shared across windows — the store
// listens for `storage` events so flipping it in the editor updates the toolbar
// window live.
const DEV_PRO_KEY = 'captureflow.dev.proMode'

export function isDevProEnabled(): boolean {
  return (
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    localStorage.getItem(DEV_PRO_KEY) === '1'
  )
}

function proFromUsage(usage: ShareUsageState): boolean {
  return isDevProEnabled() || (usage.kind === 'known' && usage.proSubscriptionActive)
}

/** Toggle the dev Pro override (dev builds only) and update the store now. */
export function setDevPro(enabled: boolean): void {
  if (typeof window === 'undefined') return
  if (enabled) {
    localStorage.setItem(DEV_PRO_KEY, '1')
    useEntitlementStore.getState().setPro(true)
  } else {
    localStorage.removeItem(DEV_PRO_KEY)
    // Fall back to the real subscription state.
    void window.electronAPI.getShareUsage().then((usage) => {
      useEntitlementStore.getState().setPro(proFromUsage(usage))
    })
  }
}

// Boot once per window (from main.tsx). Resolves Pro from the account's cloud
// usage + auth, kicks a fresh probe, and keeps the store in sync as main
// broadcasts changes. Returns an unsubscribe for symmetry (rarely used — the
// store lives for the window's lifetime).
export function bootEntitlementStore(): () => void {
  let auth: ShareAuthState = { kind: 'signed_out' }
  let usage: ShareUsageState = { kind: 'unknown' }

  const recompute = (): void => {
    const store = useEntitlementStore.getState()
    store.setPro(proFromUsage(usage))
    // Definitive once the dev toggle is on, the user is signed out (can't be
    // Pro), or the usage probe has actually resolved.
    if (isDevProEnabled() || auth.kind === 'signed_out' || usage.kind === 'known') {
      store.setHydrated(true)
    }
  }

  void window.electronAPI.getShareAuth().then((a) => {
    auth = a
    recompute()
  })
  void window.electronAPI.getShareUsage().then((u) => {
    usage = u
    recompute()
  })
  void window.electronAPI.refreshShareUsage()

  const offAuth = window.electronAPI.onShareAuthChanged((a) => {
    auth = a
    recompute()
  })
  const offUsage = window.electronAPI.onShareUsageChanged((u) => {
    usage = u
    recompute()
  })

  // Cross-window dev-toggle: localStorage `storage` events fire in OTHER
  // windows, so flipping Pro mode in the editor updates the toolbar live.
  const onStorage = (e: StorageEvent): void => {
    if (e.key === DEV_PRO_KEY) recompute()
  }
  window.addEventListener('storage', onStorage)

  return () => {
    offAuth()
    offUsage()
    window.removeEventListener('storage', onStorage)
  }
}
