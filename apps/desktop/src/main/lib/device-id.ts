import { app } from 'electron'
import { join } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { randomBytes } from 'crypto'
import { logInfo, logWarn } from './logger'

// Per-install identifier sent as `x-captureflow-device` to the share API.
// Used by the worker to enforce per-device upload quotas, active-share
// limits, and storage caps. The ID is opaque, never shown to the user,
// and never tied to anything personal — losing it just means the next
// install gets a fresh quota.
//
// File: ~/Library/Application Support/CaptureFlow/device-id.txt (macOS)

const FILE_NAME = 'device-id.txt'

let cache: string | null = null

function filePath(): string {
  return join(app.getPath('userData'), FILE_NAME)
}

function generate(): string {
  // 24 bytes = 32 base64url chars — well inside the worker's
  // [8, 64] length constraint.
  return randomBytes(24).toString('base64url')
}

export async function loadDeviceId(): Promise<string> {
  if (cache) return cache
  try {
    const raw = (await readFile(filePath(), 'utf-8')).trim()
    if (raw.length >= 8 && raw.length <= 64) {
      cache = raw
      logInfo('device', `loaded id (${raw.length} chars)`)
      return raw
    }
    logWarn('device', `existing id has invalid length (${raw.length}), regenerating`)
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code !== 'ENOENT') {
      logWarn('device', `failed to read id (${code ?? String(err)}), regenerating`)
    }
  }
  const id = generate()
  try {
    await mkdir(app.getPath('userData'), { recursive: true })
    await writeFile(filePath(), id, 'utf-8')
    logInfo('device', `generated new id (${id.length} chars)`)
  } catch (err) {
    logWarn('device', `failed to persist id: ${String(err)}`)
  }
  cache = id
  return id
}

export function getDeviceId(): string | null {
  return cache
}
