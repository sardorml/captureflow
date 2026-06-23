import { EventEmitter } from 'events'
import { app } from 'electron'
import { join } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import type { WorkspacesState, WorkspaceSummary } from '../../../shared/types'
import { loadDeviceId } from '../device-id'
import { logInfo, logWarn } from '../logger'
import { getShareAuthToken } from './share-auth'

const APP_WEB_API_BASE = process.env.CAPTUREFLOW_APP_WEB_API_BASE ?? 'https://captureflow.xyz'
const FETCH_TIMEOUT_MS = 8_000
const FILE_NAME = 'workspaces.json'

type StoredState = {
  workspaces: WorkspaceSummary[]
  activeId: string | null
}

let current: WorkspacesState = { kind: 'unknown' }
let inflight: Promise<WorkspacesState> | null = null
const events = new EventEmitter()

function filePath(): string {
  return join(app.getPath('userData'), FILE_NAME)
}

export function getWorkspacesState(): WorkspacesState {
  return current
}

export function getActiveWorkspaceId(): string | null {
  if (current.kind !== 'known') return null
  return current.activeId
}

export function onWorkspacesChange(fn: (state: WorkspacesState) => void): () => void {
  events.on('change', fn)
  return () => {
    events.off('change', fn)
  }
}

function setState(next: WorkspacesState): void {
  current = next
  events.emit('change', next)
}

async function persist(state: StoredState): Promise<void> {
  try {
    await mkdir(app.getPath('userData'), { recursive: true })
    await writeFile(filePath(), JSON.stringify(state), 'utf-8')
  } catch (err) {
    logWarn('workspaces', `failed to persist: ${String(err)}`)
  }
}

export async function loadWorkspaces(): Promise<WorkspacesState> {
  try {
    const raw = await readFile(filePath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<StoredState>
    if (Array.isArray(parsed.workspaces)) {
      const workspaces = parsed.workspaces.filter(
        (w): w is WorkspaceSummary =>
          !!w &&
          typeof w.id === 'string' &&
          typeof w.name === 'string' &&
          (w.kind === 'personal' || w.kind === 'team') &&
          (w.role === 'owner' || w.role === 'member')
      )
      if (workspaces.length > 0) {
        const activeId =
          typeof parsed.activeId === 'string' && workspaces.some((w) => w.id === parsed.activeId)
            ? parsed.activeId
            : workspaces[0].id
        current = { kind: 'known', workspaces, activeId }
      }
    }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code && code !== 'ENOENT') {
      logWarn('workspaces', `failed to read cache (${code})`)
    }
  }
  return current
}

export async function clearWorkspaces(): Promise<void> {
  if (current.kind !== 'unknown') setState({ kind: 'unknown' })
}

type WorkspacesResponse = {
  workspaces: WorkspaceSummary[]
}

export async function refreshWorkspaces(): Promise<WorkspacesState> {
  if (inflight) return inflight
  const promise = (async (): Promise<WorkspacesState> => {
    const token = getShareAuthToken()
    if (!token) {
      if (current.kind !== 'unknown') setState({ kind: 'unknown' })
      return current
    }
    const deviceId = await loadDeviceId()
    try {
      const res = await fetch(`${APP_WEB_API_BASE}/api/workspaces`, {
        method: 'GET',
        headers: {
          'x-captureflow-device': deviceId,
          authorization: `Bearer ${token}`
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
      })
      if (res.status === 401) {
        // Leave state untouched; the /api/usage probe drives cleanup via share-auth.
        return current
      }
      if (!res.ok) {
        logWarn('workspaces', `refresh returned ${res.status}; keeping cached`)
        return current
      }
      const body = (await res.json()) as Partial<WorkspacesResponse>
      const fresh = Array.isArray(body.workspaces)
        ? body.workspaces.filter(
            (w): w is WorkspaceSummary =>
              !!w &&
              typeof w.id === 'string' &&
              typeof w.name === 'string' &&
              (w.kind === 'personal' || w.kind === 'team') &&
              (w.role === 'owner' || w.role === 'member')
          )
        : []
      if (fresh.length === 0) {
        // No memberships shouldn't happen (signup hook auto-creates one); keep cache.
        logWarn('workspaces', 'refresh: empty membership list, keeping cached')
        return current
      }
      const prevActive = current.kind === 'known' ? current.activeId : null
      const activeId =
        prevActive && fresh.some((w) => w.id === prevActive) ? prevActive : fresh[0].id
      const next: WorkspacesState = { kind: 'known', workspaces: fresh, activeId }
      const changed =
        current.kind !== 'known' ||
        current.activeId !== activeId ||
        current.workspaces.length !== fresh.length ||
        current.workspaces.some(
          (w, i) =>
            w.id !== fresh[i].id ||
            w.name !== fresh[i].name ||
            w.role !== fresh[i].role ||
            w.kind !== fresh[i].kind
        )
      if (changed) {
        logInfo('workspaces', `refreshed: ${fresh.length} workspace(s), active=${activeId}`)
        setState(next)
        await persist({ workspaces: fresh, activeId })
      }
      return next
    } catch (err) {
      logWarn('workspaces', `refresh failed: ${String(err)}`)
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

export async function selectWorkspace(id: string): Promise<WorkspacesState> {
  if (current.kind !== 'known') return current
  if (current.activeId === id) return current
  if (!current.workspaces.some((w) => w.id === id)) {
    logWarn('workspaces', `select: id ${id} not in cached list, ignoring`)
    return current
  }
  const next: WorkspacesState = {
    kind: 'known',
    workspaces: current.workspaces,
    activeId: id
  }
  setState(next)
  await persist({ workspaces: current.workspaces, activeId: id })
  return next
}
