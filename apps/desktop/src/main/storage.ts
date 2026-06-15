import { app } from 'electron'
import { join } from 'path'
import { mkdir, writeFile } from 'fs/promises'

function getRecordingsDir(): string {
  // Sessions live in ~/Movies/CaptureFlow[ Dev] so the user has one place
  // for everything CaptureFlow produces. Dev split keeps test sessions out
  // of the production folder. `videos` resolves to NSMoviesDirectory on
  // macOS (~/Movies).
  const folder = app.isPackaged ? 'CaptureFlow' : 'CaptureFlow Dev'
  return join(app.getPath('videos'), folder)
}

export async function ensureRecordingsDir(): Promise<string> {
  const dir = getRecordingsDir()
  await mkdir(dir, { recursive: true })
  return dir
}

/** Create a session folder for a new recording and return its path.
 *  Folder name ends in `.captureflow` and contains an `Info.plist` so macOS
 *  Finder treats the directory as a single document (package bundle). */
let currentSessionDir: string | null = null

const PACKAGE_INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundlePackageType</key>
\t<string>FRML</string>
\t<key>CFBundleIdentifier</key>
\t<string>software.captureflow.project</string>
</dict>
</plist>
`

export async function createSessionDir(): Promise<string> {
  const base = await ensureRecordingsDir()
  const now = new Date()
  const stamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
  const sessionDir = join(base, `${stamp}.captureflow`)
  await mkdir(sessionDir, { recursive: true })
  await writeFile(join(sessionDir, 'Info.plist'), PACKAGE_INFO_PLIST, 'utf-8')
  currentSessionDir = sessionDir
  return sessionDir
}

export function getCurrentSessionDir(): string | null {
  return currentSessionDir
}

/** Adopt an existing session directory as the current one. */
export function setCurrentSessionDir(dir: string | null): void {
  currentSessionDir = dir
}

export async function deleteCurrentSession(): Promise<void> {
  if (currentSessionDir) {
    const { rm } = await import('fs/promises')
    await rm(currentSessionDir, { recursive: true, force: true }).catch(() => {})
    currentSessionDir = null
  }
}

export function getRecordingsDirPath(): string {
  return getRecordingsDir()
}
