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
