import { spawn, type ChildProcess } from 'child_process'
import { join } from 'path'
import { existsSync } from 'fs'
import { app } from 'electron'
import type { CursorType } from '../shared/types'

let proc: ChildProcess | null = null
let currentType: CursorType = 'arrow'
let outputBuffer = ''
let stopping = false

const VALID_TYPES = new Set<CursorType>([
  'arrow',
  'pointer',
  'text',
  'crosshair',
  'open-hand',
  'closed-hand',
  'resize-ew',
  'resize-ns'
])

function getBinaryPath(): string {
  const base = app.isPackaged
    ? join(process.resourcesPath, 'native', 'cursor-monitor', 'bin')
    : join(__dirname, '../../native/cursor-monitor/bin')
  return join(base, 'cursor-monitor')
}

export function startCursorMonitor(): void {
  if (proc) return

  const binPath = getBinaryPath()
  if (!existsSync(binPath)) {
    console.warn('[cursor-monitor] Binary not found:', binPath)
    return
  }

  stopping = false
  currentType = 'arrow'

  try {
    proc = spawn(binPath, [], { stdio: ['pipe', 'pipe', 'pipe'], detached: true })
  } catch (err) {
    console.warn('[cursor-monitor] Failed to spawn:', err)
    proc = null
    return
  }

  proc.unref()

  proc.stdout?.on('data', (chunk: Buffer) => {
    outputBuffer += chunk.toString()
    const lines = outputBuffer.split('\n')
    outputBuffer = lines.pop() ?? ''

    for (const line of lines) {
      const match = line.match(/^STATE:(.+)$/)
      if (!match) continue
      const type = match[1].trim() as CursorType
      if (VALID_TYPES.has(type)) {
        currentType = type
      }
    }
  })

  proc.on('error', (err) => {
    console.warn('[cursor-monitor] Process error:', err.message)
    proc = null
  })

  proc.on('exit', (code) => {
    if (!stopping && code !== 0) {
      console.warn('[cursor-monitor] Exited unexpectedly with code:', code)
    }
    proc = null
    outputBuffer = ''
  })
}

export function stopCursorMonitor(): void {
  stopping = true
  if (proc) {
    proc.kill()
    proc = null
  }
  currentType = 'arrow'
  outputBuffer = ''
}

export function getCurrentCursorType(): CursorType {
  return currentType
}
