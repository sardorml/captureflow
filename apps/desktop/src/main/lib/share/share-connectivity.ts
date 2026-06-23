import { EventEmitter } from 'events'
import type { ShareConnectivityState } from '../../../shared/types'
import { logInfo } from '../logger'

// Tracks reachability of captureflow.xyz, distinct from share-auth state:
// a user can be signed in but offline, and the lock icon must flip on for
// either case. Updated by validateShareAuth (its fetch doubles as a probe)
// and by share-error-handler when a streaming upload TypeErrors mid-flow.
//
// Defaults to 'online' so the first paint doesn't flash a lock + modal
// while the startup probe is in flight; if the probe lands offline, the
// change event flips the UI a beat later. Better than the inverse
// (offline → online flash on a working network).

let current: ShareConnectivityState = 'online'
const events = new EventEmitter()

export function getShareConnectivity(): ShareConnectivityState {
  return current
}

export function setShareConnectivity(next: ShareConnectivityState): void {
  if (current === next) return
  const prev = current
  current = next
  logInfo('share-connectivity', `${prev} → ${next}`)
  events.emit('change', next)
}

export function onShareConnectivityChange(fn: (state: ShareConnectivityState) => void): () => void {
  events.on('change', fn)
  return () => {
    events.off('change', fn)
  }
}
