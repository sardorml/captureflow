import { EventEmitter } from 'events'
import type { ShareConnectivityState } from '../../../shared/types'
import { logInfo } from '../logger'

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
