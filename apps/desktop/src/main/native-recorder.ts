import { spawn, ChildProcess } from "child_process";
import { join } from "path";
import { app } from "electron";
import { logInfo, logWarn, logError, logRaw } from "./lib/logger";
import type { RecordingFrameEvent } from "../shared/types";

export type StopResult = {
  path: string;
  systemAudioPath?: string | null;
  duration: number;
  width: number;
  height: number;
};

/*
 * ScreenCaptureKit downsamples the source to this cap, so it governs encode
 * detail. Bitrate matches the per-pixel budget 4 Mbps gave at 720p.
 * Keep in sync with ENCODE_BITRATE in `recording-compositing-encoder.ts`.
 */
const RECORDING_WIDTH = 1920;
const RECORDING_HEIGHT = 1080;
const RECORDING_FPS = 60;
const RECORDING_BITRATE = 8_000_000;

// fd the parent allocates for the binary recording-output pipe; the child opens
// FileHandle(fileDescriptor: 3) and writes length-prefixed records.
const RECORDING_FD = 3;

let proc: ChildProcess | null = null;
let onStopResolve: ((result: StopResult) => void | Promise<void>) | null = null;
let onUnexpectedExit: (() => void) | null = null;
let onRecordingEvent: ((event: RecordingFrameEvent) => void) | null = null;
let stdoutBuffer = "";
let stoppedCleanly = false;

type RecorderHealth = {
  videoFrames: number;
  audioFrames: number;
  dropped: number;
  duration: number;
};

let latestHealth: RecorderHealth | null = null;

export function setOnUnexpectedExit(cb: (() => void) | null): void {
  onUnexpectedExit = cb;
}

export function setOnRecordingEvent(
  cb: ((event: RecordingFrameEvent) => void) | null,
): void {
  onRecordingEvent = cb;
}

export function getRecorderHealth(): RecorderHealth | null {
  return latestHealth;
}

function getBinaryPath(): string {
  const base = app.isPackaged
    ? join(process.resourcesPath, "native", "screen-recorder", "bin")
    : join(__dirname, "../../native/screen-recorder/bin");
  return join(base, "screen-recorder");
}

import type { WindowBounds } from "../shared/types";

type RecorderConfig = {
  displayId?: number;
  windowId?: number;
  fps?: number;
  showsCursor?: boolean;
  captureAudio?: boolean;
  excludePid?: number;
  cropRect?: WindowBounds;
};

type StartResult = {
  windowBounds?: WindowBounds;
  wallClockMs?: number;
  cornerRadius?: number;
};

const MAX_START_RETRIES = 3;
const RETRY_DELAY_MS = 500;

export async function startNativeRecording(
  config: RecorderConfig,
): Promise<StartResult> {
  if (proc) {
    // Self-heal a previous stop that didn't land cleanly: graceful stop on a
    // 1.5s budget, then SIGKILL the remainder so the spawn below starts clean.
    logWarn(
      "recorder",
      "previous proc still resident; cleaning up before start",
    );
    try {
      await Promise.race([
        stopNativeRecording().then(() => undefined),
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch (err) {
      logWarn("recorder", `cleanup-stop failed: ${String(err)}`);
    }
    if (proc) {
      logWarn("recorder", "force-killing stuck recorder");
      forceKillProc(proc, "self-heal-start");
      proc = null;
      onStopResolve = null;
    }
  }

  // The H.264 hardware encoder sometimes needs time to reset after a
  // previous recording's process exits, so retry with delay.
  for (let attempt = 1; attempt <= MAX_START_RETRIES; attempt++) {
    try {
      return await spawnNativeRecorder(config);
    } catch (err) {
      if (attempt < MAX_START_RETRIES) {
        logWarn(
          "recorder",
          `start attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms: ${err}`,
        );
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Native recorder failed to start");
}

async function spawnNativeRecorder(
  config: RecorderConfig,
): Promise<StartResult> {
  // outputDir "" keeps the binary's on-disk writers off; encoded records
  // stream over fd 3 instead (the binary's file mode still exists but the
  // app is Loom-style only).
  const finalConfig = {
    ...config,
    outputDir: "",
    recording: {
      width: RECORDING_WIDTH,
      height: RECORDING_HEIGHT,
      fps: RECORDING_FPS,
      bitrate: RECORDING_BITRATE,
      fd: RECORDING_FD,
    },
  };

  logInfo("recorder", "starting native recording (streaming)");

  return new Promise((resolve, reject) => {
    stdoutBuffer = "";
    stoppedCleanly = false;
    latestHealth = null;
    const binPath = getBinaryPath();
    const jsonConfig = JSON.stringify(finalConfig);

    logInfo("recorder", `spawning: ${binPath}`);
    // Allocate a 4th 'pipe' slot so the child's fd 3 is readable here; the
    // native RecordingWriter writes length-prefixed records there (RecordingWriter.swift).
    proc = spawn(binPath, [jsonConfig], {
      stdio: ["pipe", "pipe", "pipe", "pipe"],
      env: { ...process.env },
    });
    // Spike-only diagnostic for the recording-tap fan-out (docs/spikes/recording-tap.md).
    // Remove this block when the spike concludes.
    if (process.env.CAPTUREFLOW_RECORDING_TAP_SPIKE === "1") {
      logInfo("recorder", "recording-tap spike: env flag forwarded to child");
    }
    const recordingStream = proc.stdio[
      RECORDING_FD
    ] as NodeJS.ReadableStream | null;
    if (recordingStream) {
      attachRecordingReader(recordingStream);
    } else {
      logWarn("recorder", `stdio[${RECORDING_FD}] not available`);
    }
    logInfo("recorder", `process spawned: pid=${proc.pid}`);

    let started = false;

    proc.stdout?.on("data", (data: Buffer) => {
      stdoutBuffer += data.toString();
      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);

          if (msg.error && !started) {
            started = true;
            logError("recorder", `start failed: ${msg.error}`);
            reject(new Error(msg.error));
          } else if (msg.status === "recording" && !started) {
            started = true;
            logInfo(
              "recorder",
              `recording started: wallClockMs=${msg.wallClockMs}`,
            );
            resolve({
              windowBounds: msg.windowBounds,
              wallClockMs: msg.wallClockMs,
              cornerRadius:
                typeof msg.cornerRadius === "number"
                  ? msg.cornerRadius
                  : undefined,
            });
          } else if (msg.status === "stopped" && onStopResolve) {
            stoppedCleanly = true;
            logInfo(
              "recorder",
              `stopped: path=${msg.path}, duration=${msg.duration}, systemAudioPath=${
                msg.systemAudioPath ?? "none"
              }`,
            );
            const cb = onStopResolve;
            onStopResolve = null;
            // Files are finalized but the native side doesn't always exit
            // voluntarily (notably mid ScreenCaptureKit frame-wait), so null the
            // handle and SIGKILL so its stdout can't collide with the next session.
            const procToKill = proc;
            proc = null;
            cb({
              path: msg.path,
              systemAudioPath: msg.systemAudioPath ?? null,
              duration: msg.duration ?? 0,
              width: msg.width ?? 0,
              height: msg.height ?? 0,
            });
            forceKillProc(procToKill, "stopped-message");
          } else if (msg.type === "health") {
            latestHealth = {
              videoFrames: msg.videoFrames ?? 0,
              audioFrames: msg.audioFrames ?? 0,
              dropped: msg.dropped ?? 0,
              duration: msg.duration ?? 0,
            };
            logInfo(
              "recorder",
              `health: ${latestHealth.duration.toFixed(1)}s, video=${
                latestHealth.videoFrames
              }, audio=${latestHealth.audioFrames}, dropped=${latestHealth.dropped}`,
            );
          } else if (msg.type === "error") {
            logError("recorder", `${msg.source ?? "unknown"}: ${msg.message}`);
            if (msg.fatal) {
              onUnexpectedExit?.();
            }
          }
        } catch {
          // ignore non-JSON output
        }
      }
    });

    proc.stderr?.on("data", (data: Buffer) => {
      logRaw(data.toString());
    });

    proc.on("error", (err) => {
      logError("recorder", `spawn error: ${err.message}`);
      proc = null;
      if (!started) {
        started = true;
        reject(err);
      }
    });

    proc.on("exit", (code, signal) => {
      logInfo("recorder", `process exited: code=${code}, signal=${signal}`);
      proc = null;
      if (!started) {
        started = true;
        reject(
          new Error(
            `Native recorder exited with code ${code}, signal ${signal}`,
          ),
        );
      } else if (!stoppedCleanly && !onStopResolve) {
        logWarn("recorder", "unexpected exit");
        onUnexpectedExit?.();
      }
    });
  });
}

// Node's `proc.kill('SIGKILL')` can silently misfire when stdio is mid-stream,
// so also call `process.kill(pid, 'SIGKILL')` to hit the syscall directly —
// that reliably ends the rogue health stream when the Swift recorder traps SIGTERM.
function forceKillProc(target: ChildProcess | null, reason: string): void {
  if (!target) return;
  const pid = target.pid;
  const alreadyExited = target.exitCode !== null || target.signalCode !== null;
  logInfo(
    "recorder",
    `force-kill (${reason}): pid=${pid ?? "?"} exitCode=${target.exitCode} signalCode=${
      target.signalCode
    } killed=${target.killed}`,
  );
  if (alreadyExited) return;
  try {
    target.kill("SIGKILL");
  } catch (err) {
    logWarn("recorder", `node-side SIGKILL failed: ${String(err)}`);
  }
  if (typeof pid === "number") {
    try {
      process.kill(pid, "SIGKILL");
    } catch (err) {
      // ESRCH = already dead (fine); anything else is an OS rejection worth surfacing.
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("ESRCH")) {
        logWarn("recorder", `os-level SIGKILL pid=${pid} failed: ${msg}`);
      }
    }
  }
  target.stdout?.removeAllListeners("data");
  target.stderr?.removeAllListeners("data");
}

export function stopNativeRecording(): Promise<StopResult> {
  logInfo("recorder", "stop requested");
  return new Promise((resolve, reject) => {
    if (!proc) {
      reject(new Error("No native recorder running"));
      return;
    }

    onStopResolve = (result) => {
      resolve({
        path: result.path,
        systemAudioPath: result.systemAudioPath ?? null,
        duration: result.duration,
        width: result.width,
        height: result.height,
      });
    };
    proc.stdin?.write("stop\n");

    setTimeout(() => {
      if (onStopResolve) {
        onStopResolve = null;
        // SIGKILL, not SIGTERM: the Swift process can ignore SIGTERM mid-startup
        // and keep streaming health messages indefinitely.
        forceKillProc(proc, "stop-timeout");
        proc = null;
        reject(new Error("Native recorder stop timed out"));
      }
    }, 3000);
  });
}

export function pauseNativeRecording(): void {
  logInfo("recorder", "pause requested");
  proc?.stdin?.write("pause\n");
}

export function isNativeRecordingActive(): boolean {
  return proc !== null;
}

export function resumeNativeRecording(): void {
  logInfo("recorder", "resume requested");
  proc?.stdin?.write("resume\n");
}

// On-wire layout of the binary records the native RecordingWriter emits on fd 3
// (all multi-byte ints little-endian):
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
function attachRecordingReader(stream: NodeJS.ReadableStream): void {
  // Plain Buffer (not an ArrayBuffer-backed alloc) to match the stream chunks'
  // looser ArrayBufferLike backing under TS strict mode.
  let buf: Buffer = Buffer.concat([]);
  let recordingFrameCount = 0;
  let recordingKeyCount = 0;
  let formatEmitted = false;

  stream.on("data", (chunk: Buffer) => {
    buf = buf.length === 0 ? chunk : Buffer.concat([buf, chunk]);
    while (buf.length > 0) {
      const tag = buf[0];
      if (tag === 0x01) {
        if (buf.length < 1 + 16) break;
        const width = buf.readUInt32LE(1);
        const height = buf.readUInt32LE(5);
        const fps = buf.readUInt32LE(9);
        const descLen = buf.readUInt32LE(13);
        const total = 1 + 16 + descLen;
        if (buf.length < total) break;
        const description = new Uint8Array(buf.slice(17, 17 + descLen));
        buf = buf.slice(total);
        formatEmitted = true;
        logInfo(
          "recording",
          `format: ${width}x${height}@${fps}fps, descLen=${descLen}`,
        );
        onRecordingEvent?.({
          kind: "format",
          codedWidth: width,
          codedHeight: height,
          fps,
          description,
        });
      } else if (tag === 0x02) {
        if (buf.length < 1 + 1 + 8 + 4 + 4) break;
        const flags = buf[1];
        const isKey = (flags & 0x01) !== 0;
        const ptsUs = Number(buf.readBigInt64LE(2));
        const durationUs = buf.readUInt32LE(10);
        const dataLen = buf.readUInt32LE(14);
        const total = 1 + 1 + 8 + 4 + 4 + dataLen;
        if (buf.length < total) break;
        const data = new Uint8Array(buf.slice(18, 18 + dataLen));
        buf = buf.slice(total);
        recordingFrameCount++;
        if (isKey) recordingKeyCount++;
        onRecordingEvent?.({
          kind: "chunk",
          type: isKey ? "key" : "delta",
          timestamp: ptsUs,
          duration: durationUs,
          data,
        });
      } else if (tag === 0x03) {
        if (buf.length < 1 + 12) break;
        const sampleRate = buf.readUInt32LE(1);
        const channelCount = buf.readUInt32LE(5);
        const descLen = buf.readUInt32LE(9);
        const total = 1 + 12 + descLen;
        if (buf.length < total) break;
        const description = new Uint8Array(buf.slice(13, 13 + descLen));
        buf = buf.slice(total);
        logInfo(
          "recording",
          `audio-format: ${sampleRate}Hz, ${channelCount}ch, descLen=${descLen}`,
        );
        onRecordingEvent?.({
          kind: "audio-format",
          sampleRate,
          numberOfChannels: channelCount,
          description,
        });
      } else if (tag === 0x04) {
        if (buf.length < 1 + 8 + 4 + 4) break;
        const ptsUs = Number(buf.readBigInt64LE(1));
        const durationUs = buf.readUInt32LE(9);
        const dataLen = buf.readUInt32LE(13);
        const total = 1 + 8 + 4 + 4 + dataLen;
        if (buf.length < total) break;
        const data = new Uint8Array(buf.slice(17, 17 + dataLen));
        buf = buf.slice(total);
        onRecordingEvent?.({
          kind: "audio-chunk",
          timestamp: ptsUs,
          duration: durationUs,
          data,
        });
      } else if (tag === 0xff) {
        buf = buf.slice(1);
        logInfo(
          "recording",
          `end-of-stream: frames=${recordingFrameCount}, keyframes=${recordingKeyCount}, formatEmitted=${formatEmitted}`,
        );
        onRecordingEvent?.({ kind: "end" });
      } else {
        // Unknown tag means the wire is desynced; drop the rest so payload
        // bytes aren't misread as headers.
        logError(
          "recorder",
          `recording-reader: unknown tag 0x${tag.toString(16)}, dropping ${buf.length}B`,
        );
        buf = Buffer.alloc(0);
        break;
      }
    }
  });

  stream.on("end", () => {
    if (buf.length > 0) {
      logWarn(
        "recorder",
        `recording-reader: ${buf.length}B unparsed at stream end`,
      );
    }
  });

  stream.on("error", (err) => {
    logError("recorder", `recording-reader: stream error: ${err.message}`);
  });
}
