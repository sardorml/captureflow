import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'
import { app } from 'electron'
import { createSessionDir, setCurrentSessionDir } from './storage'
import { logInfo, logWarn, logError, logRaw } from './lib/logger'
import { getUserPrefs } from './lib/user-prefs'
import type { ShareFrameEvent } from '../shared/types'

export type StopResult = {
  path: string
  systemAudioPath?: string | null
  duration: number
  width: number
  height: number
}

// Share-stream tuning. ScreenCaptureKit downsamples the source to this
// cap, so it directly governs detail in the encode. 1080p keeps small
// text legible after the renderer's cursor-composite re-encode while
// keeping upload + R2 storage reasonable; bitrate matches the per-pixel
// budget 4 Mbps gave us at 720p. Keep in sync with ENCODE_BITRATE in
// `share-compositing-encoder.ts`.
const SHARE_WIDTH = 1920
const SHARE_HEIGHT = 1080
const SHARE_FPS = 60
const SHARE_BITRATE = 8_000_000

// fd the parent allocates for the binary share-output pipe. The child
// opens FileHandle(fileDescriptor: 3) and writes length-prefixed
// records — see ShareWriter.swift for the on-wire layout.
const SHARE_FD = 3

let proc: ChildProcess | null = null
let onStopResolve: ((result: StopResult) => void | Promise<void>) | null = null
let onUnexpectedExit: (() => void) | null = null
let onShareEvent: ((event: ShareFrameEvent) => void) | null = null
let stdoutBuffer = ''
let stoppedCleanly = false

type RecorderHealth = {
  videoFrames: number
  audioFrames: number
  dropped: number
  duration: number
}

let latestHealth: RecorderHealth | null = null

export function setOnUnexpectedExit(cb: (() => void) | null): void {
  onUnexpectedExit = cb
}

// Subscribe to share-pipeline events forwarded from the native side.
// Set once at app boot; the renderer consumer must re-key its state
// across recording sessions.
export function setOnShareEvent(cb: ((event: ShareFrameEvent) => void) | null): void {
  onShareEvent = cb
}

export function getRecorderHealth(): RecorderHealth | null {
  return latestHealth
}

function getBinaryPath(): string {
  const base = app.isPackaged
    ? join(process.resourcesPath, 'native', 'screen-recorder', 'bin')
    : join(__dirname, '../../native/screen-recorder/bin')
  return join(base, 'screen-recorder')
}

import type { WindowBounds } from '../shared/types'

type RecorderConfig = {
  outputDir: string
  displayId?: number
  windowId?: number
  fps?: number
  showsCursor?: boolean
  captureAudio?: boolean
  excludePid?: number
  cropRect?: WindowBounds
  // Per-session override for the share-pipeline tap (toolbar Share /
  // Screenshot toggle); falls back to the persisted user pref if unset.
  share?: boolean
}

type StartResult = {
  windowBounds?: WindowBounds
  wallClockMs?: number
  cornerRadius?: number
}

const MAX_START_RETRIES = 3
const RETRY_DELAY_MS = 500

export async function startNativeRecording(config: RecorderConfig): Promise<StartResult> {
  if (proc) {
    // Self-heal: the previous stop didn't land cleanly (renderer
    // crashed mid-stop, IPC raced an editor-open path) and we still
    // hold a live `proc`. Without this the user is wedged — every Start
    // bounces off "already running" until the app restarts. Try a
    // graceful stop on a tight 1.5s budget, then SIGKILL the remainder
    // so the spawn below has a clean slate.
    logWarn('recorder', 'previous proc still resident; cleaning up before start')
    try {
      await Promise.race([
        stopNativeRecording().then(() => undefined),
        new Promise<void>((resolve) => setTimeout(resolve, 1500))
      ])
    } catch (err) {
      logWarn('recorder', `cleanup-stop failed: ${String(err)}`)
    }
    if (proc) {
      logWarn('recorder', 'force-killing stuck recorder')
      forceKillProc(proc, 'self-heal-start')
      proc = null
      onStopResolve = null
    }
  }

  // Retry with delay — the H.264 hardware encoder sometimes needs time
  // to reset after a previous recording's process exits
  for (let attempt = 1; attempt <= MAX_START_RETRIES; attempt++) {
    try {
      return await spawnNativeRecorder(config)
    } catch (err) {
      if (attempt < MAX_START_RETRIES) {
        logWarn(
          'recorder',
          `start attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms: ${err}`
        )
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
      } else {
        throw err
      }
    }
  }
  throw new Error('Native recorder failed to start')
}

async function spawnNativeRecorder(config: RecorderConfig): Promise<StartResult> {
  const shareEnabled = config.share ?? getUserPrefs().shareEnabled
  // Share mode skips the on-disk .captureflow bundle entirely — no
  // screen.mp4, system.m4a, or tracking.json. The native binary gates
  // its FrameWriter + AudioWriter on share=true and never opens an
  // output file; the cursor tracker also writes nothing because
  // getCurrentSessionDir() returns null when createSessionDir is skipped.
  const sessionDir = shareEnabled ? '' : await createSessionDir()
  if (shareEnabled) setCurrentSessionDir(null)
  const { share: _shareOverride, ...rest } = config
  const finalConfig: Omit<RecorderConfig, 'share'> & {
    share?: {
      width: number
      height: number
      fps: number
      bitrate: number
      fd: number
    }
  } = { ...rest, outputDir: sessionDir }
  if (shareEnabled) {
    finalConfig.share = {
      width: SHARE_WIDTH,
      height: SHARE_HEIGHT,
      fps: SHARE_FPS,
      bitrate: SHARE_BITRATE,
      fd: SHARE_FD
    }
  }

  logInfo(
    'recorder',
    `starting native recording: sessionDir=${sessionDir}, share=${shareEnabled ? 'on' : 'off'}`
  )

  return new Promise((resolve, reject) => {
    stdoutBuffer = ''
    stoppedCleanly = false
    latestHealth = null
    const binPath = getBinaryPath()
    const jsonConfig = JSON.stringify(finalConfig)

    logInfo('recorder', `spawning: ${binPath}`)
    // When shareEnabled, allocate a 4th 'pipe' slot so the child's fd 3
    // is wired to a readable stream on this side. The native ShareWriter
    // opens FileHandle(fileDescriptor: 3) and emits length-prefixed
    // binary records there — see ShareWriter.swift.
    const stdio: ('pipe' | 'ignore')[] = shareEnabled
      ? ['pipe', 'pipe', 'pipe', 'pipe']
      : ['pipe', 'pipe', 'pipe']
    proc = spawn(binPath, [jsonConfig], {
      stdio,
      env: { ...process.env }
    })
    // Spike-only diagnostic for the share-tap fan-out (docs/spikes/share-tap.md).
    // Remove this block when the spike concludes.
    if (process.env.CAPTUREFLOW_SHARE_TAP_SPIKE === '1') {
      logInfo('recorder', 'share-tap spike: env flag forwarded to child')
    }
    if (shareEnabled) {
      const shareStream = proc.stdio[SHARE_FD] as NodeJS.ReadableStream | null
      if (shareStream) {
        attachShareReader(shareStream)
      } else {
        logWarn('recorder', `share enabled but stdio[${SHARE_FD}] not available`)
      }
    }
    logInfo('recorder', `process spawned: pid=${proc.pid}`)

    let started = false

    proc.stdout?.on('data', (data: Buffer) => {
      stdoutBuffer += data.toString()
      const lines = stdoutBuffer.split('\n')
      stdoutBuffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const msg = JSON.parse(line)

          if (msg.error && !started) {
            started = true
            logError('recorder', `start failed: ${msg.error}`)
            reject(new Error(msg.error))
          } else if (msg.status === 'recording' && !started) {
            started = true
            logInfo('recorder', `recording started: wallClockMs=${msg.wallClockMs}`)
            resolve({
              windowBounds: msg.windowBounds,
              wallClockMs: msg.wallClockMs,
              cornerRadius: typeof msg.cornerRadius === 'number' ? msg.cornerRadius : undefined
            })
          } else if (msg.status === 'stopped' && onStopResolve) {
            stoppedCleanly = true
            logInfo(
              'recorder',
              `stopped: path=${msg.path}, duration=${msg.duration}, systemAudioPath=${
                msg.systemAudioPath ?? 'none'
              }`
            )
            const cb = onStopResolve
            onStopResolve = null
            // Files are finalized but the native side doesn't always exit
            // voluntarily — especially when stop fires during
            // ScreenCaptureKit's initial frame-wait. Null the handle now,
            // then SIGKILL unconditionally so health/stdout can't keep
            // streaming into and colliding with the next session.
            const procToKill = proc
            proc = null
            cb({
              path: msg.path,
              systemAudioPath: msg.systemAudioPath ?? null,
              duration: msg.duration ?? 0,
              width: msg.width ?? 0,
              height: msg.height ?? 0
            })
            forceKillProc(procToKill, 'stopped-message')
          } else if (msg.type === 'health') {
            latestHealth = {
              videoFrames: msg.videoFrames ?? 0,
              audioFrames: msg.audioFrames ?? 0,
              dropped: msg.dropped ?? 0,
              duration: msg.duration ?? 0
            }
            logInfo(
              'recorder',
              `health: ${latestHealth.duration.toFixed(1)}s, video=${
                latestHealth.videoFrames
              }, audio=${latestHealth.audioFrames}, dropped=${latestHealth.dropped}`
            )
          } else if (msg.type === 'error') {
            logError('recorder', `${msg.source ?? 'unknown'}: ${msg.message}`)
            if (msg.fatal) {
              onUnexpectedExit?.()
            }
          }
        } catch {
          // ignore non-JSON output
        }
      }
    })

    proc.stderr?.on('data', (data: Buffer) => {
      logRaw(data.toString())
    })

    proc.on('error', (err) => {
      logError('recorder', `spawn error: ${err.message}`)
      proc = null
      if (!started) {
        started = true
        reject(err)
      }
    })

    proc.on('exit', (code, signal) => {
      logInfo('recorder', `process exited: code=${code}, signal=${signal}`)
      proc = null
      if (!started) {
        started = true
        reject(new Error(`Native recorder exited with code ${code}, signal ${signal}`))
      } else if (!stoppedCleanly && !onStopResolve) {
        logWarn('recorder', 'unexpected exit')
        onUnexpectedExit?.()
      }
    })
  })
}

// Kill the native subprocess for real. Node's `proc.kill('SIGKILL')`
// can silently misfire when stdio is mid-stream, so we also call
// `process.kill(pid, 'SIGKILL')` to hit the syscall directly — that's
// what reliably ends the rogue health stream when the Swift recorder
// traps SIGTERM. Detaches stdio listeners too so buffered pipe data
// can't leak into the next session's logs.
function forceKillProc(target: ChildProcess | null, reason: string): void {
  if (!target) return
  const pid = target.pid
  const alreadyExited = target.exitCode !== null || target.signalCode !== null
  logInfo(
    'recorder',
    `force-kill (${reason}): pid=${pid ?? '?'} exitCode=${target.exitCode} signalCode=${
      target.signalCode
    } killed=${target.killed}`
  )
  if (alreadyExited) return
  try {
    target.kill('SIGKILL')
  } catch (err) {
    logWarn('recorder', `node-side SIGKILL failed: ${String(err)}`)
  }
  if (typeof pid === 'number') {
    try {
      process.kill(pid, 'SIGKILL')
    } catch (err) {
      // ESRCH = already dead; that's fine. Anything else means the
      // OS rejected the signal — surface it so we can debug.
      const msg = err instanceof Error ? err.message : String(err)
      if (!msg.includes('ESRCH')) {
        logWarn('recorder', `os-level SIGKILL pid=${pid} failed: ${msg}`)
      }
    }
  }
  target.stdout?.removeAllListeners('data')
  target.stderr?.removeAllListeners('data')
}

export function stopNativeRecording(): Promise<StopResult> {
  logInfo('recorder', 'stop requested')
  return new Promise((resolve, reject) => {
    if (!proc) {
      reject(new Error('No native recorder running'))
      return
    }

    onStopResolve = (result) => {
      resolve({
        path: result.path,
        systemAudioPath: result.systemAudioPath ?? null,
        duration: result.duration,
        width: result.width,
        height: result.height
      })
    }
    proc.stdin?.write('stop\n')

    setTimeout(() => {
      if (onStopResolve) {
        onStopResolve = null
        // SIGKILL (not the default SIGTERM) — the native Swift process
        // sometimes ignores SIGTERM mid-startup and keeps streaming
        // health messages indefinitely.
        forceKillProc(proc, 'stop-timeout')
        proc = null
        reject(new Error('Native recorder stop timed out'))
      }
    }, 3000)
  })
}

export function pauseNativeRecording(): void {
  logInfo('recorder', 'pause requested')
  proc?.stdin?.write('pause\n')
}

export function isNativeRecordingActive(): boolean {
  return proc !== null
}

export function resumeNativeRecording(): void {
  logInfo('recorder', 'resume requested')
  proc?.stdin?.write('resume\n')
}

// Share-pipe parser. Consumes the binary record stream the native
// ShareWriter emits on fd 3. Records can split across `data` events, so
// we keep a rolling Buffer and only emit once a full record is present.
//
// On-wire layout (all multi-byte ints little-endian):
//   tag 0x01 — video format desc, sent once after first encode:
//     u32 width | u32 height | u32 fps | u32 descLen | descLen bytes (avcC)
//   tag 0x02 — encoded video chunk, one per output frame:
//     u8 flags (bit0=key) | i64 ptsUs | u32 durationUs | u32 dataLen | dataLen bytes
//   tag 0x03 — audio format, sent once before the first audio chunk:
//     u32 sampleRate | u32 channelCount | u32 descLen |
//     descLen bytes (AudioSpecificConfig)
//   tag 0x04 — encoded audio chunk, one per AAC packet:
//     i64 ptsUs | u32 durationUs | u32 dataLen | dataLen bytes (raw AAC)
//   tag 0xFF — end of stream (1 byte total).
//
// Each parsed record is forwarded to the registered onShareEvent
// listener (set by recording-handlers at boot). Parser state is reset
// per spawn — old fragments must not survive into the next session.
function attachShareReader(stream: NodeJS.ReadableStream): void {
  // Plain Buffer for the rolling fragment — an ArrayBuffer-backed alloc
  // clashes with the stream chunks' looser ArrayBufferLike backing under
  // TS strict mode.
  let buf: Buffer = Buffer.concat([])
  let shareFrameCount = 0
  let shareKeyCount = 0
  let formatEmitted = false

  stream.on('data', (chunk: Buffer) => {
    buf = buf.length === 0 ? chunk : Buffer.concat([buf, chunk])
    while (buf.length > 0) {
      const tag = buf[0]
      if (tag === 0x01) {
        if (buf.length < 1 + 16) break
        const width = buf.readUInt32LE(1)
        const height = buf.readUInt32LE(5)
        const fps = buf.readUInt32LE(9)
        const descLen = buf.readUInt32LE(13)
        const total = 1 + 16 + descLen
        if (buf.length < total) break
        const description = new Uint8Array(buf.slice(17, 17 + descLen))
        buf = buf.slice(total)
        formatEmitted = true
        logInfo('share', `format: ${width}x${height}@${fps}fps, descLen=${descLen}`)
        onShareEvent?.({ kind: 'format', codedWidth: width, codedHeight: height, fps, description })
      } else if (tag === 0x02) {
        if (buf.length < 1 + 1 + 8 + 4 + 4) break
        const flags = buf[1]
        const isKey = (flags & 0x01) !== 0
        const ptsUs = Number(buf.readBigInt64LE(2))
        const durationUs = buf.readUInt32LE(10)
        const dataLen = buf.readUInt32LE(14)
        const total = 1 + 1 + 8 + 4 + 4 + dataLen
        if (buf.length < total) break
        const data = new Uint8Array(buf.slice(18, 18 + dataLen))
        buf = buf.slice(total)
        shareFrameCount++
        if (isKey) shareKeyCount++
        onShareEvent?.({
          kind: 'chunk',
          type: isKey ? 'key' : 'delta',
          timestamp: ptsUs,
          duration: durationUs,
          data
        })
      } else if (tag === 0x03) {
        // Audio format (tag 0x03 — see layout above).
        if (buf.length < 1 + 12) break
        const sampleRate = buf.readUInt32LE(1)
        const channelCount = buf.readUInt32LE(5)
        const descLen = buf.readUInt32LE(9)
        const total = 1 + 12 + descLen
        if (buf.length < total) break
        const description = new Uint8Array(buf.slice(13, 13 + descLen))
        buf = buf.slice(total)
        logInfo('share', `audio-format: ${sampleRate}Hz, ${channelCount}ch, descLen=${descLen}`)
        onShareEvent?.({
          kind: 'audio-format',
          sampleRate,
          numberOfChannels: channelCount,
          description
        })
      } else if (tag === 0x04) {
        // Audio chunk (tag 0x04 — one AAC packet, raw bytes, no ADTS).
        if (buf.length < 1 + 8 + 4 + 4) break
        const ptsUs = Number(buf.readBigInt64LE(1))
        const durationUs = buf.readUInt32LE(9)
        const dataLen = buf.readUInt32LE(13)
        const total = 1 + 8 + 4 + 4 + dataLen
        if (buf.length < total) break
        const data = new Uint8Array(buf.slice(17, 17 + dataLen))
        buf = buf.slice(total)
        onShareEvent?.({
          kind: 'audio-chunk',
          timestamp: ptsUs,
          duration: durationUs,
          data
        })
      } else if (tag === 0xff) {
        buf = buf.slice(1)
        logInfo(
          'share',
          `end-of-stream: frames=${shareFrameCount}, keyframes=${shareKeyCount}, formatEmitted=${formatEmitted}`
        )
        onShareEvent?.({ kind: 'end' })
      } else {
        // Unknown tag — wire is desynced. Drop the rest so payload bytes
        // aren't misread as headers; the next session parses fresh.
        logError(
          'recorder',
          `share-reader: unknown tag 0x${tag.toString(16)}, dropping ${buf.length}B`
        )
        buf = Buffer.alloc(0)
        break
      }
    }
  })

  stream.on('end', () => {
    if (buf.length > 0) {
      logWarn('recorder', `share-reader: ${buf.length}B unparsed at stream end`)
    }
  })

  stream.on('error', (err) => {
    logError('recorder', `share-reader: stream error: ${err.message}`)
  })
}
