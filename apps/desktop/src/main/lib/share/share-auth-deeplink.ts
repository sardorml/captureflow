import { setShareAuth } from './share-auth'
import { logInfo, logWarn } from '../logger'

// Parses captureflow:// URLs handed to the app by macOS (via `open-url`).
// Only `captureflow://auth/callback?token=…&id=…` is recognised; anything
// else is logged and ignored.
//
// The web UI builds these URLs at captureflow.xyz/auth/callback
// after the user signs in. They carry the freshly-minted device
// token (raw) and its database id. We persist both and emit a
// SHARE_AUTH_CHANGED event so the renderer's lock icon flips off
// without a restart.

export async function handleDeepLinkUrl(rawUrl: string): Promise<void> {
  if (typeof rawUrl !== 'string' || !rawUrl.startsWith('captureflow://')) {
    return
  }
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    logWarn('share-auth', `dropped malformed deep link: ${rawUrl.slice(0, 64)}…`)
    return
  }
  // Allow either `captureflow://auth/callback` (host=auth, path=/callback) or the
  // swapped `captureflow://callback/auth` shape — URL parsing of custom schemes is
  // browser/OS-dependent, so accept both normalised orderings (with or without a
  // leading slash from an empty host on the triple-slash form).
  const key = `${parsed.host}${parsed.pathname}`.replace(/\/+/g, '/').replace(/^\//, '')
  if (!key.startsWith('auth/callback') && !key.startsWith('callback/auth')) {
    logInfo('share-auth', `ignored non-auth deep link host=${parsed.host}`)
    return
  }
  const token = parsed.searchParams.get('token') ?? ''
  const tokenId = parsed.searchParams.get('id') ?? ''
  const label = parsed.searchParams.get('label') ?? null
  const email = parsed.searchParams.get('email') ?? null
  if (token.length < 32 || tokenId.length === 0) {
    logWarn('share-auth', 'deep link missing token or id; rejected')
    return
  }
  await setShareAuth({ token, tokenId, label, email })
  logInfo('share-auth', `accepted token from deep link (id=${tokenId})`)
}
