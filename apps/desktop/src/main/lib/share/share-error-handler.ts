/**
 * Centralised side-effect handling for share-upload failures.
 *
 *  - `invalid_token`   → clear share-auth (the desktop lock flips back
 *                        to "sign in" without a restart)
 *  - `storage_limit`   → flip the cached usage state to cap-reached so
 *  - `active_limit`      the next overlay open paints the upgrade lock
 *  - network error     → mark connectivity offline so the SelectionOverlay
 *                        renders the existing offline lock
 *
 * Translates the error into a typed `ShareUploadFailure` for the
 * caller — the streamer turns this into a `ShareFinishResult` or a
 * failure-modal state, depending on whether a salvageable URL exists.
 */

import { clearShareAuth } from './share-auth'
import { setShareConnectivity } from './share-connectivity'
import { markShareUsageCapReached, refreshShareUsage } from './share-usage'
import { logWarn } from '../logger'
import { ShareApiHttpError } from './share-api-client'

export type ShareUploadFailure = {
  message: string
  code?: string
  status?: number
}

export function handleUploadError(
  err: unknown,
  ctx: { slug?: string; phase: string }
): ShareUploadFailure {
  if (err instanceof ShareApiHttpError) {
    logWarn(
      'share',
      `${ctx.phase} failed (${err.status}/${err.code ?? 'unknown'}): ${err.message}` +
        (ctx.slug ? ` [slug=${ctx.slug}]` : '')
    )
    if (err.code === 'invalid_token') {
      void clearShareAuth().catch((cleanupErr) =>
        logWarn('share', `clearShareAuth after invalid_token failed: ${String(cleanupErr)}`)
      )
    }
    if (err.code === 'storage_limit' || err.code === 'active_limit') {
      markShareUsageCapReached()
      void refreshShareUsage()
    }
    return { message: err.message, code: err.code, status: err.status }
  }
  const message = err instanceof Error ? err.message : String(err)
  logWarn(
    'share',
    `${ctx.phase} failed (network): ${message}` + (ctx.slug ? ` [slug=${ctx.slug}]` : '')
  )
  setShareConnectivity('offline')
  return { message: 'No internet connection. Check your network and try again.' }
}
