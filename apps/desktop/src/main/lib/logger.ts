import { app } from 'electron'
import { join } from 'path'
import { createWriteStream, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs'
import type { WriteStream } from 'fs'

let logStream: WriteStream | null = null
let logDir: string | null = null
let logFilePath: string | null = null

const MAX_LOG_FILES = 10
const MAX_LOG_SIZE = 10 * 1024 * 1024 // 10MB per file

// ── ANSI Colors ──

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  app: '\x1b[35m',
  recorder: '\x1b[34m',
  cursor: '\x1b[32m',
  writer: '\x1b[33m',
  capture: '\x1b[36m',
  clock: '\x1b[35m',
  session: '\x1b[34m',
  main: '\x1b[37m',
  export: '\x1b[91m',
  ffmpeg: '\x1b[93m'
} as const

function componentColor(name: string): string {
  return (c as Record<string, string>)[name] ?? '\x1b[37m'
}

const levelBadge: Record<string, string> = {
  INFO: `${c.info}${c.bold} INFO ${c.reset}`,
  WARN: `${c.warn}${c.bold} WARN ${c.reset}`,
  ERROR: `${c.error}${c.bold} ERR! ${c.reset}`
}

const levelIcon: Record<string, string> = {
  INFO: '\u25cf',
  WARN: '\u25b2',
  ERROR: '\u2718'
}

// ── File Setup ──

function getLogDir(): string {
  if (logDir) return logDir
  logDir = join(app.getPath('home'), 'Library', 'Logs', 'CaptureFlow')
  mkdirSync(logDir, { recursive: true })
  return logDir
}

function getStream(): WriteStream {
  if (logStream) return logStream

  const dir = getLogDir()
  const now = new Date()
  const name = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  logFilePath = join(dir, `${name}.log`)
  logStream = createWriteStream(logFilePath, { flags: 'a' })

  try {
    const files = readdirSync(dir)
      .filter((f) => f.endsWith('.log'))
      .map((f) => ({ name: f, path: join(dir, f), mtime: statSync(join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)

    for (const old of files.slice(MAX_LOG_FILES)) {
      unlinkSync(old.path)
    }
  } catch {
    // Non-critical
  }

  return logStream
}

// ── Formatting ──

function timestamp(): string {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

function fileLine(level: string, component: string, message: string): string {
  const ts = new Date().toISOString()
  return `[${ts}] [${level}] [${component}] ${message}\n`
}

function terminalLine(level: string, component: string, message: string): string {
  const ts = `${c.dim}${timestamp()}${c.reset}`
  const badge = levelBadge[level] ?? level
  const icon = levelIcon[level] ?? ' '
  const cc = componentColor(component)
  const comp = `${cc}${c.bold}${component.padEnd(9)}${c.reset}`
  const levelColor = level === 'ERROR' ? c.error : level === 'WARN' ? c.warn : ''
  const msg = `${levelColor}${message}${c.reset}`
  return `  ${ts} ${badge} ${icon} ${comp} ${msg}`
}

// ── Public API ──

export function logInfo(component: string, message: string): void {
  getStream().write(fileLine('INFO', component, message))
  console.log(terminalLine('INFO', component, message))
}

export function logWarn(component: string, message: string): void {
  getStream().write(fileLine('WARN', component, message))
  console.log(terminalLine('WARN', component, message))
}

export function logError(component: string, message: string): void {
  getStream().write(fileLine('ERROR', component, message))
  console.log(terminalLine('ERROR', component, message))
}

export function logRaw(data: string): void {
  const lines = data.split('\n')
  for (const raw of lines) {
    const trimmed = raw.trim()
    if (!trimmed) continue

    getStream().write(`${trimmed}\n`)

    // Parse Swift log format: [timestamp] [LEVEL] [component] message
    const match = trimmed.match(/^\[[\d.]+\]\s+\[(\w+)\]\s+\[(\w+)\]\s+(.+)$/)
    if (match) {
      const [, level, component, message] = match
      console.log(terminalLine(level, component, message))
    } else {
      console.log(`  ${c.dim}${trimmed}${c.reset}`)
    }
  }
}

export function getLogFilePath(): string | null {
  return logFilePath
}

export function getLogDirPath(): string {
  return getLogDir()
}

export function closeLog(): void {
  logStream?.end()
  logStream = null
}

export function rotateIfNeeded(): void {
  if (!logFilePath) return
  try {
    const stat = statSync(logFilePath)
    if (stat.size > MAX_LOG_SIZE) {
      closeLog()
    }
  } catch {
    // Ignore
  }
}
