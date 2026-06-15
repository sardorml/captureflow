import { app } from 'electron'
import { join } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { logInfo, logWarn } from '../logger'
import type { ReleaseNotesInitPayload } from '../../../shared/types'

// Two sources of release notes:
//   - `welcome.md` (bundled)  — shown once, on the user's first-ever editor
//                                open. Doesn't depend on the network.
//   - CDN markdown (live)     — shown once per `app.getVersion()` per Mac. We
//                                author `notes/<version>.md` and upload it to
//                                the releases CDN alongside the build, so
//                                post-ship typo fixes go live without a
//                                rebuild.
// Both follow the same convention: the first `# heading` becomes the modal
// title, everything after is the body (see `parseNote`).
//
// Delivery is the renderer's job: this module only PICKS the pending note and
// returns its payload over IPC (getPendingReleaseNote) and records when it has
// been seen (markReleaseNotesShown). The editor renders it in an in-app
// BasicModal — there is no separate native window.
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

// Memoize the CDN fetch per version so we don't pay the network cost twice in
// the same session: once for the pending check, again on open. The cache is
// per-process and resets on quit, which is what we want — the user only sees
// notes once per version anyway.
const versionNoteCache = new Map<string, ReleaseNote | null>()
const versionNoteInflight = new Map<string, Promise<ReleaseNote | null>>()

async function fetchVersionNote(version: string): Promise<ReleaseNote | null> {
  if (versionNoteCache.has(version)) return versionNoteCache.get(version) ?? null
  const inflight = versionNoteInflight.get(version)
  if (inflight) return inflight

  // We author + upload `notes/<version>.md` to the releases CDN next to the
  // build (e.g. dl.captureflow.xyz/notes/0.9.0-beta.md). A 404 (notes not
  // uploaded for this version) just means no modal — handled as null.
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

  // Force-show (dev toggle): prefer the version note from the CDN when one
  // exists for the current build — that's the most relevant content to QA.
  // Fall back to welcome if the release isn't published or the fetch fails.
  if (force) {
    const versionNote = await fetchVersionNote(version)
    if (versionNote) return { kind: 'version', version, ...versionNote }
    if (WELCOME_NOTE) return { kind: 'welcome', version, ...WELCOME_NOTE }
    return null
  }

  // First-ever editor open on this install — greet the user. Bundled note,
  // works offline.
  if (!store.welcomed && WELCOME_NOTE) {
    return { kind: 'welcome', version, ...WELCOME_NOTE }
  }

  // Subsequent opens — surface the release body from the CDN once per version.
  // If the fetch fails (offline, draft release, 404) we return null without
  // marking the version shown, so we'll retry on the next launch.
  if (!store.shownFor.includes(version)) {
    const versionNote = await fetchVersionNote(version)
    if (versionNote) return { kind: 'version', version, ...versionNote }
  }

  return null
}

// Returns the pending note's payload (or null), with no side effects. `force`
// bypasses the seen-checks so the title-bar "What's new" button can re-open it
// in the same session. The renderer marks it seen via markReleaseNotesShown
// when the modal is dismissed.
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

// Records that the user has seen the notes: marks them welcomed and the current
// version shown, so neither the welcome note nor this version's note re-appears
// on the next launch.
export async function markReleaseNotesShown(): Promise<void> {
  const store = await readStore()
  const version = app.getVersion()
  const shownFor = store.shownFor.includes(version) ? store.shownFor : [...store.shownFor, version]
  if (store.welcomed && shownFor === store.shownFor) return
  await writeStore({ welcomed: true, shownFor })
}
