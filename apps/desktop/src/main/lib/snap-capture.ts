import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { copyFile, mkdir, readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { homedir } from 'os'
import { join } from 'path'
import { app, clipboard, nativeImage, shell } from 'electron'

import { logInfo, logWarn } from './logger'

// snap-capture: spawns the native screen-recorder binary in
// `mode: 'snapshot'` to grab a single PNG of a display, window, or
// area, then:
//   1. copies the PNG to the system clipboard (paste-ready right away)
//   2. saves a local copy to ~/Pictures/CaptureFlow/Snaps/<ts>.png
//   3. plays the macOS shutter sound (Grab/Shot.aiff)
// Returns the local file path of the temp PNG so the caller can hand
// it to snap-upload.ts (which streams the bytes to the snap Worker).
// The temp PNG lives until the caller deletes it.

export type SnapTarget =
  | { kind: 'display'; displayId: number }
  | { kind: 'window'; windowId: number }
  | {
      kind: 'area'
      displayId: number
      cropRect: { x: number; y: number; width: number; height: number }
    }

export type CaptureResult = {
  tempPath: string
  localCopyPath: string | null
  width: number
  height: number
  bytes: number
}

function getBinaryPath(): string {
  const base = app.isPackaged
    ? join(process.resourcesPath, 'native', 'screen-recorder', 'bin')
    : join(__dirname, '../../native/screen-recorder/bin')
  return join(base, 'screen-recorder')
}

async function ensureSnapsDir(): Promise<string> {
  const dir = join(homedir(), 'Pictures', 'CaptureFlow', 'Snaps')
  await mkdir(dir, { recursive: true })
  return dir
}

function tsFileName(): string {
  // ISO-ish filename: 2026-05-13_14-32-08-123.png. Filesystem-safe,
  // sorts chronologically.
  const d = new Date()
  const pad = (n: number, w = 2): string => String(n).padStart(w, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}` +
    `-${pad(d.getMilliseconds(), 3)}.png`
  )
}

// Fire-and-forget macOS shutter sound. Best effort — failure is silent.
function playShutter(): void {
  // Grab.app shutter (used by Cmd-Shift-4); Tink.aiff as a fallback if
  // Grab.app isn't present.
  const candidates = [
    '/System/Library/Sounds/Grab.aiff',
    '/System/Library/Sounds/Tink.aiff',
    '/System/Library/Sounds/Glass.aiff'
  ]
  const found = candidates.find((p) => existsSync(p))
  if (!found) return
  try {
    spawn('/usr/bin/afplay', [found], { stdio: 'ignore', detached: true }).unref()
  } catch (err) {
    logWarn('snap-capture', `shutter sound failed: ${String(err)}`)
  }
}

export async function captureSnapshot(target: SnapTarget): Promise<CaptureResult> {
  const binPath = getBinaryPath()
  if (!existsSync(binPath)) {
    throw new Error(`screen-recorder binary not found at ${binPath}`)
  }

  const tempPath = join(tmpdir(), `captureflow-snap-${Date.now()}.png`)
  type SnapConfig = {
    mode: 'snapshot'
    outputPath: string
    displayId?: number
    windowId?: number
    cropRect?: { x: number; y: number; width: number; height: number }
    excludePid: number
    showsCursor: false
  }
  const config: SnapConfig = {
    mode: 'snapshot',
    outputPath: tempPath,
    excludePid: process.pid,
    showsCursor: false
  }
  if (target.kind === 'display') {
    config.displayId = target.displayId
  } else if (target.kind === 'window') {
    config.windowId = target.windowId
  } else {
    config.displayId = target.displayId
    config.cropRect = target.cropRect
  }

  logInfo('snap-capture', `spawning snapshot: target=${JSON.stringify(target)}`)

  const result = await new Promise<{
    path: string
    width: number
    height: number
    bytes: number
  }>((resolve, reject) => {
    const proc = spawn(binPath, [JSON.stringify(config)], {
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let stdout = ''
    let stderr = ''
    proc.stdout?.on('data', (b: Buffer) => {
      stdout += b.toString()
    })
    proc.stderr?.on('data', (b: Buffer) => {
      stderr += b.toString()
    })
    proc.on('error', (err) => reject(err))
    proc.on('close', (code) => {
      // The Swift binary emits a single JSON line on stdout. Take the
      // first non-empty trimmed line to be tolerant of trailing
      // newlines or interleaved log noise.
      const line = stdout
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l.startsWith('{'))
      if (!line) {
        reject(
          new Error(`snapshot produced no output (code=${code}, stderr=${stderr.slice(0, 400)})`)
        )
        return
      }
      try {
        const payload = JSON.parse(line) as {
          ok?: boolean
          error?: string
          path?: string
          width?: number
          height?: number
          bytes?: number
        }
        if (payload.error || !payload.ok || !payload.path) {
          reject(new Error(payload.error ?? 'snapshot failed'))
          return
        }
        resolve({
          path: payload.path,
          width: payload.width ?? 0,
          height: payload.height ?? 0,
          bytes: payload.bytes ?? 0
        })
      } catch (err) {
        reject(new Error(`failed to parse snapshot output: ${String(err)}`))
      }
    })
  })

  // Side effects: clipboard + local save + shutter. All best-effort so a
  // failure in any of these doesn't block the upload that follows.
  try {
    const buf = await readFile(result.path)
    const img = nativeImage.createFromBuffer(buf)
    clipboard.writeImage(img)
  } catch (err) {
    logWarn('snap-capture', `clipboard write failed: ${String(err)}`)
  }

  let localCopyPath: string | null = null
  try {
    const dir = await ensureSnapsDir()
    const dest = join(dir, tsFileName())
    await copyFile(result.path, dest)
    localCopyPath = dest
  } catch (err) {
    logWarn('snap-capture', `local save failed: ${String(err)}`)
  }

  playShutter()

  return {
    tempPath: result.path,
    localCopyPath,
    width: result.width,
    height: result.height,
    bytes: result.bytes
  }
}

// Reveal the local copy (if any) in Finder. Used by the notification
// modal's "Show in Finder" action.
export function revealLocalSnap(localPath: string): void {
  shell.showItemInFolder(localPath)
}

// Best-effort temp cleanup after the upload reads the bytes.
export async function deleteTempSnap(tempPath: string): Promise<void> {
  try {
    await unlink(tempPath)
  } catch (err) {
    // Already gone, or permissions; nothing to do.
    logWarn('snap-capture', `temp cleanup failed: ${String(err)}`)
  }
}
