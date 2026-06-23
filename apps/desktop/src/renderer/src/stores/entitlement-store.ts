import { create } from 'zustand'
import type { ShareAuthState, ShareUsageState } from '../../../shared/types'

type EntitlementState = {
  isPro: boolean
  // True once Pro is definitive; gates actions that shouldn't fire on the indeterminate first paint.
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
    void window.electronAPI.getShareUsage().then((usage) => {
      useEntitlementStore.getState().setPro(proFromUsage(usage))
    })
  }
}

export function bootEntitlementStore(): () => void {
  let auth: ShareAuthState = { kind: 'signed_out' }
  let usage: ShareUsageState = { kind: 'unknown' }

  const recompute = (): void => {
    const store = useEntitlementStore.getState()
    store.setPro(proFromUsage(usage))
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

  // `storage` events fire in OTHER windows, so a dev-toggle flip propagates.
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
