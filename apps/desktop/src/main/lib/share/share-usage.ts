import { EventEmitter } from 'events'
import type { ShareUsageState } from '../../../shared/types'
import { loadDeviceId } from '../device-id'
import { logInfo, logWarn } from '../logger'
import { clearShareAuth, getShareAuthToken } from './share-auth'
import { setShareConnectivity } from './share-connectivity'

// Share-usage probe. Hits GET /api/usage on captureflow.xyz,
// caches the result, and fans the snapshot out to every
// BrowserWindow. The selection overlay reads this to decide whether
// to lock the record button with an "Upgrade to Pro" modal — locking
// up front is strictly better than letting /api/init fail mid-
// recording and stranding the user at the share-failed state.
//
// The cap is account-scoped and lives on app-web alongside auth +
// subscription state, so the probe targets the same domain that issues
// the device bearer. /api/usage requires a bearer, so the probe is a
// no-op when the user is signed out — the SelectionOverlay already
// paints the auth lock in that case and there's nothing to report.
// Once a token is cached the probe runs and surfaces account-wide
// usage (across every device the user has signed in on) along with
// `proSubscriptionActive` for the Pro pill in the toolbar.

const APP_WEB_API_BASE = process.env.CAPTUREFLOW_APP_WEB_API_BASE ?? 'https://captureflow.xyz'
const USAGE_TIMEOUT_MS = 8_000

// First-paint cap-reached fallback. These MUST mirror the canonical
// ACCOUNT_LIMITS.{totalStorageBytes, activeArtifactsPerAccount} on the web
// backend, which isn't a (bundled) dependency of the desktop app, so the two
// values the cap modal needs are duplicated here with the coupling documented.
// The real account numbers replace these on the next refreshShareUsage().
const ACCOUNT_STORAGE_LIMIT_BYTES = 500 * 1024 * 1024
const ACCOUNT_ACTIVE_LIMIT = 50

let current: ShareUsageState = { kind: 'unknown' }
let inflight: Promise<ShareUsageState> | null = null
const events = new EventEmitter()

export function getShareUsage(): ShareUsageState {
  return current
}

export function onShareUsageChange(fn: (state: ShareUsageState) => void): () => void {
  events.on('change', fn)
  return () => {
    events.off('change', fn)
  }
}

function setShareUsage(next: ShareUsageState): void {
  current = next
  events.emit('change', next)
}

// Optimistic flip: called from share-error-handler when /api/init or
// any part/finalize returns a 429 `storage_limit` / `active_limit`.
// We don't know the exact usage in that branch
// (the server only tells us the cap was reached), so we keep the
// previously cached numbers but force `capReached = true`. The next
// background refresh corrects the cached bytes once the user deletes
// a share to free up room.
export function markShareUsageCapReached(): void {
  if (current.kind === 'known') {
    if (current.capReached) return
    setShareUsage({ ...current, capReached: true, checkedAt: Date.now() })
    return
  }
  // First-paint case: we have no cached numbers, but we still know
  // the cap was hit. Use the documented limits as the limit fields
  // and assume the device is at exactly the cap. The real numbers
  // land on the next refreshShareUsage().
  setShareUsage({
    kind: 'known',
    usedBytes: ACCOUNT_STORAGE_LIMIT_BYTES,
    limitBytes: ACCOUNT_STORAGE_LIMIT_BYTES,
    activeCount: 0,
    activeLimit: ACCOUNT_ACTIVE_LIMIT,
    capReached: true,
    isDev: false,
    proSubscriptionActive: false,
    checkedAt: Date.now()
  })
}

type UsageResponse = {
  usedBytes: number
  limitBytes: number
  activeCount: number
  activeLimit: number
  capReached: boolean
  isDev: boolean
  // Optional for backward compat — older app-web deploys won't include
  // it. Treated as `false` when missing so the Pro pill only renders
  // when the server has explicitly told us the subscription is on.
  proSubscriptionActive?: boolean
}

export async function refreshShareUsage(): Promise<ShareUsageState> {
  if (inflight) return inflight
  const promise = (async (): Promise<ShareUsageState> => {
    const token = getShareAuthToken()
    if (!token) {
      // No account yet — quota lock isn't actionable until the user
      // signs in (the auth lock fires first). Drop any stale cached
      // numbers so the cap doesn't leak across sign-out boundaries.
      if (current.kind !== 'unknown') setShareUsage({ kind: 'unknown' })
      return current
    }
    const deviceId = await loadDeviceId()
    // Pill always shows the bearer's own storage — the cap they pay
    // for. Uploads they make into someone else's workspace draw down
    // that owner's cap (not theirs), so the owner manages that side.
    try {
      const res = await fetch(`${APP_WEB_API_BASE}/api/usage`, {
        method: 'GET',
        headers: {
          'x-captureflow-device': deviceId,
          authorization: `Bearer ${token}`
        },
        signal: AbortSignal.timeout(USAGE_TIMEOUT_MS)
      })
      // Any HTTP response means the host is reachable.
      setShareConnectivity('online')
      // 401 = the dashboard revoked this device. Clear the local
      // session so the lock icon flips back to "sign in" before the
      // next probe, matching how /api/init handles invalid_token.
      if (res.status === 401) {
        logInfo('share-usage', 'usage probe rejected token; clearing local session')
        void clearShareAuth().catch(() => {})
        return current
      }
      if (!res.ok) {
        logWarn('share-usage', `refresh returned ${res.status}; keeping cached`)
        return current
      }
      const body = (await res.json()) as Partial<UsageResponse>
      if (
        typeof body.usedBytes !== 'number' ||
        typeof body.limitBytes !== 'number' ||
        typeof body.capReached !== 'boolean'
      ) {
        logWarn('share-usage', 'refresh: malformed response')
        return current
      }
      const next: ShareUsageState = {
        kind: 'known',
        usedBytes: body.usedBytes,
        limitBytes: body.limitBytes,
        activeCount: body.activeCount ?? 0,
        activeLimit: body.activeLimit ?? 0,
        capReached: body.capReached,
        isDev: body.isDev ?? false,
        proSubscriptionActive: body.proSubscriptionActive ?? false,
        checkedAt: Date.now()
      }
      const changed =
        current.kind !== 'known' ||
        current.usedBytes !== next.usedBytes ||
        current.activeCount !== next.activeCount ||
        current.capReached !== next.capReached ||
        current.proSubscriptionActive !== next.proSubscriptionActive
      if (changed) {
        logInfo(
          'share-usage',
          `refreshed: ${next.usedBytes}B / ${next.limitBytes}B, ` +
            `${next.activeCount}/${next.activeLimit} shares, cap=${next.capReached}`
        )
        setShareUsage(next)
      } else {
        // Always update checkedAt even when nothing else moved so
        // callers can tell a recent probe ran.
        current = next
      }
      return next
    } catch (err) {
      logWarn('share-usage', `refresh failed (network): ${String(err)}`)
      setShareConnectivity('offline')
      return current
    }
  })()
  inflight = promise
  try {
    return await promise
  } finally {
    inflight = null
  }
}
