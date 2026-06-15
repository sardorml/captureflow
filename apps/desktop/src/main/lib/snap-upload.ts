import { readFile } from 'fs/promises'

import { loadDeviceId } from './device-id'
import { logError, logInfo, logWarn } from './logger'
import { clearShareAuth, getShareAuthToken } from './share/share-auth'
import { markShareUsageCapReached, refreshShareUsage } from './share/share-usage'
import { getActiveWorkspaceId } from './share/share-workspaces'
import { bakeSnapWithDefaultBackground } from './snap-bake'

// snap-upload: POSTs a captured PNG to captureflow.xyz/api/s/upload
// and returns the {id, viewUrl, editUrl} the Worker hands back.
// Mirrors the share pipeline's bearer + device header convention so the
// shared `device_tokens` table resolves the upload to a user_id, and
// flips the share-usage cap flag on 429 so the desktop's QuotaReached
// modal picks up the same state shares use.

const SNAP_API_BASE = process.env.CAPTUREFLOW_SNAP_API_BASE ?? 'https://captureflow.xyz/api/s'

export type SnapUploadOk = {
  ok: true
  id: string
  viewUrl: string
  editUrl: string
}

export type SnapUploadErr = {
  ok: false
  error: string
  code?: string
  status?: number
}

export type SnapUploadResult = SnapUploadOk | SnapUploadErr

export type SnapUploadInput = {
  tempPath: string
  width: number
  height: number
  title?: string
}

export async function uploadSnap(input: SnapUploadInput): Promise<SnapUploadResult> {
  const token = getShareAuthToken()
  if (!token) {
    return {
      ok: false,
      error: 'Sign in to upload snaps.',
      code: 'missing_token',
      status: 401
    }
  }

  let composedBytes: Buffer
  let sourceBytes: Buffer
  let composedWidth: number
  let composedHeight: number
  let background: 'violet'
  try {
    const raw = await readFile(input.tempPath)
    // Bake the default violet gradient onto the captured PNG before
    // uploading. The composed bytes go to <id>.png (what the public
    // viewer serves); the source bytes go to <id>.source.png (what
    // the editor loads, so re-edits don't double-bake). Both are
    // palette-quantised — typical retina capture rides the wire at
    // ~500 KB instead of the 2-4 MB ScreenCaptureKit truecolor PNG.
    // The clipboard write + ~/Pictures/CaptureFlow/Snaps copy in
    // snap-capture already used the raw bytes; only what hits R2
    // here gets composited + compressed.
    const baked = bakeSnapWithDefaultBackground(raw)
    composedBytes = baked.composedBytes
    sourceBytes = baked.sourceBytes
    composedWidth = baked.composedWidth || input.width
    composedHeight = baked.composedHeight || input.height
    background = baked.background
  } catch (err) {
    logError('snap-upload', `failed to read PNG at ${input.tempPath}: ${String(err)}`)
    return { ok: false, error: 'Failed to read captured snap', code: 'read_failed' }
  }

  const deviceId = await loadDeviceId()
  const headers: Record<string, string> = {
    authorization: `Bearer ${token}`,
    'x-captureflow-device': deviceId,
    // D1 stores the dims the public viewer will use — that's the
    // composed canvas, not the captured screenshot.
    'x-captureflow-snap-width': String(composedWidth),
    'x-captureflow-snap-height': String(composedHeight)
  }
  if (input.title) {
    headers['x-captureflow-snap-title'] = input.title.slice(0, 200)
  }
  // Stamp the toolbar chip's current workspace selection. Server
  // validates membership and falls back to personal on mismatch.
  const activeWorkspaceId = getActiveWorkspaceId()
  if (activeWorkspaceId) {
    headers['x-captureflow-workspace'] = activeWorkspaceId
  }

  let res: Response
  try {
    // Multipart upload: `composed` (required) is what the public
    // viewer serves; `source` (optional) is the pristine pre-bake
    // PNG so the editor can re-edit without doubling the bg;
    // `state` (optional) is the editor sidecar JSON. The Worker
    // ignores missing optional fields, so a future client that
    // skipped baking would still post a valid `composed`-only body.
    const composedAb = composedBytes.buffer.slice(
      composedBytes.byteOffset,
      composedBytes.byteOffset + composedBytes.byteLength
    ) as ArrayBuffer
    const sourceAb = sourceBytes.buffer.slice(
      sourceBytes.byteOffset,
      sourceBytes.byteOffset + sourceBytes.byteLength
    ) as ArrayBuffer
    const stateJson = JSON.stringify({ background, annotations: [] })
    const form = new FormData()
    form.append('composed', new Blob([composedAb], { type: 'image/png' }), 'composed.png')
    form.append('source', new Blob([sourceAb], { type: 'image/png' }), 'source.png')
    form.append('state', new Blob([stateJson], { type: 'application/json' }), 'state.json')
    res = await fetch(`${SNAP_API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: form
    })
  } catch (err) {
    logWarn('snap-upload', `network error: ${String(err)}`)
    return {
      ok: false,
      error: 'Network error — check your connection and try again.',
      code: 'network_error'
    }
  }

  if (res.status === 401) {
    // Token revoked or expired — clear it so the lock state flips back
    // to the sign-in prompt on the next overlay open.
    clearShareAuth()
    return {
      ok: false,
      error: 'Sign-in expired. Sign in again to keep uploading snaps.',
      code: 'invalid_token',
      status: 401
    }
  }

  if (res.status === 429) {
    let code = 'storage_limit'
    try {
      const j = (await res.json()) as { code?: string }
      if (j.code) code = j.code
    } catch {
      // ignore
    }
    // Flip the desktop's cap flag so the Start button paints the
    // quota lock immediately — same path shares use.
    markShareUsageCapReached()
    return {
      ok: false,
      error: code === 'active_limit' ? 'Too many active snaps + shares.' : 'Storage cap reached.',
      code,
      status: 429
    }
  }

  if (!res.ok) {
    let errText = `Upload failed (${res.status})`
    let code: string | undefined
    try {
      const j = (await res.json()) as { error?: string; code?: string }
      errText = j.error ?? errText
      code = j.code
    } catch {
      // ignore
    }
    logWarn('snap-upload', `upload non-OK ${res.status}: ${errText}`)
    return { ok: false, error: errText, code, status: res.status }
  }

  const payload = (await res.json()) as {
    id?: string
    viewUrl?: string
    editUrl?: string
  }
  if (!payload.id || !payload.viewUrl || !payload.editUrl) {
    return { ok: false, error: 'Malformed upload response', code: 'bad_response' }
  }

  logInfo(
    'snap-upload',
    `uploaded ${payload.id} (composed ${composedWidth}×${composedHeight}, composed=${composedBytes.byteLength}B source=${sourceBytes.byteLength}B)`
  )

  // Snap counts against the same account-scoped quota as shares —
  // refresh the cached usage so the dashboard / next overlay open
  // reflects the new total.
  refreshShareUsage().catch(() => {})

  return {
    ok: true,
    id: payload.id,
    viewUrl: payload.viewUrl,
    editUrl: payload.editUrl
  }
}

// Soft-delete a snap from the modal's overflow menu. Best-effort —
// the modal closes regardless of the network result; if the row
// doesn't get deleted the user can still nuke it from the web app
// dashboard.
export async function deleteSnap(id: string): Promise<{ ok: boolean; error?: string }> {
  const token = getShareAuthToken()
  if (!token) return { ok: false, error: 'missing_token' }
  const deviceId = await loadDeviceId()
  try {
    const res = await fetch(`${SNAP_API_BASE}/snaps/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
        'x-captureflow-device': deviceId
      }
    })
    if (!res.ok) {
      logWarn('snap-upload', `delete ${id} returned ${res.status}`)
      return { ok: false, error: `status_${res.status}` }
    }
    // Freeing storage — refresh the cached usage so the next /init
    // sees the cap cleared if this was the row over the line.
    refreshShareUsage().catch(() => {})
    return { ok: true }
  } catch (err) {
    logWarn('snap-upload', `delete ${id} network error: ${String(err)}`)
    return { ok: false, error: 'network_error' }
  }
}
