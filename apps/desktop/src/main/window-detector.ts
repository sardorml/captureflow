import { spawn, type ChildProcess } from "child_process";
import { join } from "path";
import { app } from "electron";
import type { WindowAtPoint } from "../shared/types";

type PendingResolver =
  | { kind: "window"; resolve: (r: WindowAtPoint) => void }
  | { kind: "focus"; resolve: (ok: boolean) => void };

let proc: ChildProcess | null = null;
let pendingResolve: PendingResolver | null = null;
let buffer = "";

function getBinaryPath(): string {
  const base = app.isPackaged
    ? join(process.resourcesPath, "native", "window-detector", "bin")
    : join(__dirname, "../../native/window-detector/bin");
  return join(base, "window-detector");
}

function ensureProcess(): void {
  if (proc) return;

  proc = spawn(getBinaryPath(), [], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  proc.stdout?.on("data", (chunk: Buffer) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      if (pendingResolve) {
        const pending = pendingResolve;
        pendingResolve = null;
        const trimmed = line.trim();
        if (pending.kind === "focus") {
          pending.resolve(trimmed === "ok");
        } else {
          try {
            pending.resolve(trimmed === "null" ? null : JSON.parse(trimmed));
          } catch {
            pending.resolve(null);
          }
        }
      }
    }
  });

  proc.on("exit", () => {
    proc = null;
    if (pendingResolve) {
      if (pendingResolve.kind === "focus") pendingResolve.resolve(false);
      else pendingResolve.resolve(null);
      pendingResolve = null;
    }
  });

  proc.on("error", () => {
    proc = null;
  });
}

/**
 * Spawn the detector subprocess ahead of the first query so the initial
 * hover in window-selection mode doesn't pay the cold-start cost.
 */
export function warmWindowDetector(): void {
  ensureProcess();
}

export function getWindowAtPoint(
  x: number,
  y: number,
  excludePid?: number,
): Promise<WindowAtPoint> {
  return new Promise((resolve) => {
    ensureProcess();
    if (!proc?.stdin) {
      resolve(null);
      return;
    }

    // Cancel any pending query — same protocol stream, only one in flight.
    if (pendingResolve) {
      if (pendingResolve.kind === "focus") pendingResolve.resolve(false);
      else pendingResolve.resolve(null);
    }
    pendingResolve = { kind: "window", resolve };

    const parts = [Math.round(x), Math.round(y)];
    if (excludePid !== undefined) parts.push(excludePid);
    proc.stdin.write(parts.join(" ") + "\n");
  });
}

/**
 * Raise the app that owns the given pid via NSRunningApplication.activate.
 * Used at recording start so the captured window gains focus when CaptureFlow's
 * toolbar hides — otherwise the dock auto-shows and the previous frontmost
 * app keeps focus.
 */
export function focusAppByPid(pid: number): Promise<boolean> {
  return new Promise((resolve) => {
    ensureProcess();
    if (!proc?.stdin) {
      resolve(false);
      return;
    }
    if (pendingResolve) {
      if (pendingResolve.kind === "focus") pendingResolve.resolve(false);
      else pendingResolve.resolve(null);
    }
    pendingResolve = { kind: "focus", resolve };
    proc.stdin.write(`focus ${Math.round(pid)}\n`);
  });
}

/**
 * Raise the topmost on-screen non-CaptureFlow app. Display/area recordings
 * have no specific target pid, so without this the toolbar hide leaves
 * no app holding frontmost — the dock auto-shows. Picks the user's
 * most-recently-used regular window as a sensible default.
 */
export function focusTopmostApp(excludePid?: number): Promise<boolean> {
  return new Promise((resolve) => {
    ensureProcess();
    if (!proc?.stdin) {
      resolve(false);
      return;
    }
    if (pendingResolve) {
      if (pendingResolve.kind === "focus") pendingResolve.resolve(false);
      else pendingResolve.resolve(null);
    }
    pendingResolve = { kind: "focus", resolve };
    const cmd =
      excludePid !== undefined
        ? `focus-topmost ${Math.round(excludePid)}`
        : "focus-topmost";
    proc.stdin.write(cmd + "\n");
  });
}
