import { spawn, type ChildProcess } from "child_process";
import { ENGINE_OUTPUT } from "../contract";
import type { RecordingFrameEvent, WindowBounds } from "../types";
import { createRecordingWireParser } from "./recording-wire";
import { noopLogger, type EngineLogger } from "./logger";

export type StopResult = {
  path: string;
  systemAudioPath?: string | null;
  duration: number;
  width: number;
  height: number;
};

export type RecorderHealth = {
  videoFrames: number;
  audioFrames: number;
  dropped: number;
  duration: number;
};

// Contract defaults fill anything unset; ScreenCaptureKit downsamples the
// source to width×height, so these also govern encode detail.
export type StreamingConfig = {
  width?: number;
  height?: number;
  fps?: number;
  bitrate?: number;
};

export type ScreenRecorderConfig = {
  // "" skips the on-disk bundle entirely. A non-empty dir enables the
  // binary's file-writing mode (screen.mp4 / system.m4a) — a generic engine
  // capability no CaptureFlow app uses.
  outputDir: string;
  displayId?: number;
  windowId?: number;
  fps?: number;
  showsCursor?: boolean;
  captureAudio?: boolean;
  excludePid?: number;
  cropRect?: WindowBounds;
  // When set, pre-encoded records stream over an extra pipe as RecordingFrameEvents.
  streaming?: StreamingConfig;
};

export type StartResult = {
  windowBounds?: WindowBounds;
  wallClockMs?: number;
  cornerRadius?: number;
};

export type ScreenRecorder = {
  start(config: ScreenRecorderConfig): Promise<StartResult>;
  stop(): Promise<StopResult>;
  pause(): void;
  resume(): void;
  isActive(): boolean;
  getHealth(): RecorderHealth | null;
  setOnUnexpectedExit(cb: (() => void) | null): void;
  setOnRecordingEvent(cb: ((event: RecordingFrameEvent) => void) | null): void;
};

// fd the parent allocates for the binary recording-output pipe; the child opens
// FileHandle(fileDescriptor: 3) and writes length-prefixed records.
const RECORDING_FD = 3;

const MAX_START_RETRIES = 3;
const RETRY_DELAY_MS = 500;

export function createScreenRecorder(opts: {
  binaryPath: () => string;
  logger?: EngineLogger;
}): ScreenRecorder {
  const log = opts.logger ?? noopLogger;

  let proc: ChildProcess | null = null;
  let onStopResolve: ((result: StopResult) => void | Promise<void>) | null =
    null;
  let onUnexpectedExit: (() => void) | null = null;
  let onRecordingEvent: ((event: RecordingFrameEvent) => void) | null = null;
  let stdoutBuffer = "";
  let stoppedCleanly = false;
  let latestHealth: RecorderHealth | null = null;

  async function start(config: ScreenRecorderConfig): Promise<StartResult> {
    if (proc) {
      // Self-heal a previous stop that didn't land cleanly: graceful stop on a
      // 1.5s budget, then SIGKILL the remainder so the spawn below starts clean.
      log.warn(
        "recorder",
        "previous proc still resident; cleaning up before start",
      );
      try {
        await Promise.race([
          stop().then(() => undefined),
          new Promise<void>((resolve) => setTimeout(resolve, 1500)),
        ]);
      } catch (err) {
        log.warn("recorder", `cleanup-stop failed: ${String(err)}`);
      }
      if (proc) {
        log.warn("recorder", "force-killing stuck recorder");
        forceKillProc(proc, "self-heal-start");
        proc = null;
        onStopResolve = null;
      }
    }

    // The H.264 hardware encoder sometimes needs time to reset after a
    // previous recording's process exits, so retry with delay.
    for (let attempt = 1; attempt <= MAX_START_RETRIES; attempt++) {
      try {
        return await spawnRecorder(config);
      } catch (err) {
        if (attempt < MAX_START_RETRIES) {
          log.warn(
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

  async function spawnRecorder(
    config: ScreenRecorderConfig,
  ): Promise<StartResult> {
    const { streaming, ...rest } = config;
    const finalConfig = {
      ...rest,
      recording: streaming
        ? {
            width: streaming.width ?? ENGINE_OUTPUT.screen.maxWidth,
            height: streaming.height ?? ENGINE_OUTPUT.screen.maxHeight,
            fps: streaming.fps ?? ENGINE_OUTPUT.screen.fps,
            bitrate: streaming.bitrate ?? ENGINE_OUTPUT.screen.bitrate,
            fd: RECORDING_FD,
          }
        : undefined,
    };

    log.info(
      "recorder",
      `starting native recording (${streaming ? "streaming" : `outputDir=${config.outputDir}`})`,
    );

    return new Promise((resolve, reject) => {
      stdoutBuffer = "";
      stoppedCleanly = false;
      latestHealth = null;
      const binPath = opts.binaryPath();
      const jsonConfig = JSON.stringify(finalConfig);

      log.info("recorder", `spawning: ${binPath}`);
      // Allocate a 4th 'pipe' slot so the child's fd 3 is readable here; the
      // native RecordingWriter writes length-prefixed records there (RecordingWriter.swift).
      const stdio: ("pipe" | "ignore")[] = streaming
        ? ["pipe", "pipe", "pipe", "pipe"]
        : ["pipe", "pipe", "pipe"];
      proc = spawn(binPath, [jsonConfig], {
        stdio,
        env: { ...process.env },
      });
      // Spike-only diagnostic for the recording-tap fan-out (docs/spikes/recording-tap.md).
      // Remove this block when the spike concludes.
      if (process.env.CAPTUREFLOW_RECORDING_TAP_SPIKE === "1") {
        log.info(
          "recorder",
          "recording-tap spike: env flag forwarded to child",
        );
      }
      if (streaming) {
        const recordingStream = proc.stdio[
          RECORDING_FD
        ] as NodeJS.ReadableStream | null;
        if (recordingStream) {
          attachRecordingReader(recordingStream);
        } else {
          log.warn("recorder", `stdio[${RECORDING_FD}] not available`);
        }
      }
      log.info("recorder", `process spawned: pid=${proc.pid}`);

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
              log.error("recorder", `start failed: ${msg.error}`);
              reject(new Error(msg.error));
            } else if (msg.status === "recording" && !started) {
              started = true;
              log.info(
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
              log.info(
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
              log.info(
                "recorder",
                `health: ${latestHealth.duration.toFixed(1)}s, video=${
                  latestHealth.videoFrames
                }, audio=${latestHealth.audioFrames}, dropped=${latestHealth.dropped}`,
              );
            } else if (msg.type === "error") {
              log.error(
                "recorder",
                `${msg.source ?? "unknown"}: ${msg.message}`,
              );
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
        log.raw?.(data.toString());
      });

      proc.on("error", (err) => {
        log.error("recorder", `spawn error: ${err.message}`);
        proc = null;
        if (!started) {
          started = true;
          reject(err);
        }
      });

      proc.on("exit", (code, signal) => {
        log.info("recorder", `process exited: code=${code}, signal=${signal}`);
        proc = null;
        if (!started) {
          started = true;
          reject(
            new Error(
              `Native recorder exited with code ${code}, signal ${signal}`,
            ),
          );
        } else if (!stoppedCleanly && !onStopResolve) {
          log.warn("recorder", "unexpected exit");
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
    const alreadyExited =
      target.exitCode !== null || target.signalCode !== null;
    log.info(
      "recorder",
      `force-kill (${reason}): pid=${pid ?? "?"} exitCode=${target.exitCode} signalCode=${
        target.signalCode
      } killed=${target.killed}`,
    );
    if (alreadyExited) return;
    try {
      target.kill("SIGKILL");
    } catch (err) {
      log.warn("recorder", `node-side SIGKILL failed: ${String(err)}`);
    }
    if (typeof pid === "number") {
      try {
        process.kill(pid, "SIGKILL");
      } catch (err) {
        // ESRCH = already dead (fine); anything else is an OS rejection worth surfacing.
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("ESRCH")) {
          log.warn("recorder", `os-level SIGKILL pid=${pid} failed: ${msg}`);
        }
      }
    }
    target.stdout?.removeAllListeners("data");
    target.stderr?.removeAllListeners("data");
  }

  function stop(): Promise<StopResult> {
    log.info("recorder", "stop requested");
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

  function attachRecordingReader(stream: NodeJS.ReadableStream): void {
    const parser = createRecordingWireParser(
      (event) => onRecordingEvent?.(event),
      log,
    );
    stream.on("data", (chunk: Buffer) => parser.push(chunk));
    stream.on("end", () => parser.end());
    stream.on("error", (err) => {
      log.error("recorder", `recording-reader: stream error: ${err.message}`);
    });
  }

  return {
    start,
    stop,
    pause() {
      log.info("recorder", "pause requested");
      proc?.stdin?.write("pause\n");
    },
    resume() {
      log.info("recorder", "resume requested");
      proc?.stdin?.write("resume\n");
    },
    isActive() {
      return proc !== null;
    },
    getHealth() {
      return latestHealth;
    },
    setOnUnexpectedExit(cb) {
      onUnexpectedExit = cb;
    },
    setOnRecordingEvent(cb) {
      onRecordingEvent = cb;
    },
  };
}
