/**
 * Renderer→main logger for share telemetry. Routes through
 * window.electronAPI.log so share messages land in the same `share`
 * stream as the main-process modules. Falls back to console.* when the
 * bridge isn't installed (tests, mounts before preload finishes).
 */

type LogLevel = 'info' | 'warn' | 'error'

function emit(level: LogLevel, message: string): void {
  const bridge = window.electronAPI?.log
  if (bridge) {
    bridge(level, 'share', message)
    return
  }
  if (level === 'error') console.error(`[share] ${message}`)
  else if (level === 'warn') console.warn(`[share] ${message}`)
  // Drop info-level when no bridge to avoid console.log noise in tests.
}

export function logRendererInfo(message: string): void {
  emit('info', message)
}

export function logRendererWarn(message: string): void {
  emit('warn', message)
}

export function logRendererError(message: string): void {
  emit('error', message)
}
