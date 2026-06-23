import { app } from 'electron'
import { join } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { logInfo, logWarn } from '../logger'
import type { ReleaseNotesInitPayload } from '../../../shared/types'

// Two sources: bundled `welcome.md` (shown once on first editor open) and CDN
// `notes/<version>.md` (shown once per version; editable post-ship without a rebuild).
const RELEASE_NOTES_BASE = 'https://dl.captureflow.xyz/notes'

type ReleaseNote = {
  message: string
  detail: string
}

const noteFiles = import.meta.glob('./welcome.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

function parseNote(raw: string): ReleaseNote {
  const lines = raw.split('\n')
  const titleIdx = lines.findIndex((l) => /^#\s+/.test(l))
  if (titleIdx === -1) {
    return { message: 'Release notes', detail: raw.trim() }
  }
  const message = lines[titleIdx].replace(/^#\s+/, '').trim()
  let bodyStart = titleIdx + 1
  while (bodyStart < lines.length && lines[bodyStart].trim() === '') bodyStart++
  const detail = lines.slice(bodyStart).join('\n').trim()
  return { message, detail }
}

const WELCOME_NOTE: ReleaseNote | null = (() => {
  const raw = noteFiles['./welcome.md']
  return raw ? parseNote(raw) : null
})()

const versionNoteCache = new Map<string, ReleaseNote | null>()
const versionNoteInflight = new Map<string, Promise<ReleaseNote | null>>()

async function fetchVersionNote(version: string): Promise<ReleaseNote | null> {
  if (versionNoteCache.has(version)) return versionNoteCache.get(version) ?? null
  const inflight = versionNoteInflight.get(version)
  if (inflight) return inflight

  // A 404 (no note uploaded for this build) just means no modal.
  const url = `${RELEASE_NOTES_BASE}/${encodeURIComponent(version)}.md`
  const promise = (async (): Promise<ReleaseNote | null> => {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        logInfo('release-notes', `cdn fetch ${version} returned ${res.status}`)
        return null
      }
      const body = (await res.text()).trim()
      if (!body) return null
      return parseNote(body)
    } catch (err) {
      logWarn('release-notes', `cdn fetch failed: ${String(err)}`)
      return null
    }
  })()
  versionNoteInflight.set(version, promise)
  const result = await promise
  versionNoteInflight.delete(version)
  versionNoteCache.set(version, result)
  return result
}

const STORE_FILE = 'release-notes.json'

type Store = {
  welcomed: boolean
  shownFor: string[]
}

function storePath(): string {
  return join(app.getPath('userData'), STORE_FILE)
}

async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(storePath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<Store>
    return {
      welcomed: !!parsed.welcomed,
      shownFor: Array.isArray(parsed.shownFor) ? parsed.shownFor : []
    }
  } catch {
    return { welcomed: false, shownFor: [] }
  }
}

async function writeStore(store: Store): Promise<void> {
  await mkdir(app.getPath('userData'), { recursive: true })
  await writeFile(storePath(), JSON.stringify(store), 'utf-8')
}

type PickedNote = {
  kind: 'welcome' | 'version'
  version: string
  message: string
  detail: string
}

async function pickNote(store: Store, force: boolean): Promise<PickedNote | null> {
  const version = app.getVersion()

  // Force-show (dev toggle): prefer the CDN note, falling back to welcome.
  if (force) {
    const versionNote = await fetchVersionNote(version)
    if (versionNote) return { kind: 'version', version, ...versionNote }
    if (WELCOME_NOTE) return { kind: 'welcome', version, ...WELCOME_NOTE }
    return null
  }

  if (!store.welcomed && WELCOME_NOTE) {
    return { kind: 'welcome', version, ...WELCOME_NOTE }
  }

  // On fetch failure we return null without marking the version shown, so a later launch retries.
  if (!store.shownFor.includes(version)) {
    const versionNote = await fetchVersionNote(version)
    if (versionNote) return { kind: 'version', version, ...versionNote }
  }

  return null
}

// Returns the pending note (or null) with no side effects. `force` bypasses the seen-checks.
export async function getPendingReleaseNote(
  force = false
): Promise<ReleaseNotesInitPayload | null> {
  const store = await readStore()
  const picked = await pickNote(store, force)
  if (!picked) {
    logInfo(
      'release-notes',
      `nothing pending; welcomed=${store.welcomed} version=${app.getVersion()}`
    )
    return null
  }
  return { version: picked.version, message: picked.message, detail: picked.detail }
}

export async function markReleaseNotesShown(): Promise<void> {
  const store = await readStore()
  const version = app.getVersion()
  const shownFor = store.shownFor.includes(version) ? store.shownFor : [...store.shownFor, version]
  if (store.welcomed && shownFor === store.shownFor) return
  await writeStore({ welcomed: true, shownFor })
}
