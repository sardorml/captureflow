import { spawn, type ChildProcess } from "child_process";
import type { WindowAtPoint } from "../types";

type PendingResolver =
  | { kind: "window"; resolve: (r: WindowAtPoint) => void }
  | { kind: "focus"; resolve: (ok: boolean) => void };

export type WindowDetector = {
  /** Spawn the detector subprocess ahead of the first query so the initial
   *  hover in window-selection mode doesn't pay the cold-start cost. */
  warm(): void;
  getWindowAtPoint(
    x: number,
    y: number,
    excludePid?: number,
  ): Promise<WindowAtPoint>;
  /** Raise the app that owns the given pid via NSRunningApplication.activate. */
  focusAppByPid(pid: number): Promise<boolean>;
  /** Raise the topmost on-screen app not matching excludePid — the user's
   *  most-recently-used regular window as a sensible default. */
  focusTopmostApp(excludePid?: number): Promise<boolean>;
};

export function createWindowDetector(opts: {
  binaryPath: () => string;
}): WindowDetector {
  let proc: ChildProcess | null = null;
  let pendingResolve: PendingResolver | null = null;
  let buffer = "";

  function ensureProcess(): void {
    if (proc) return;

    proc = spawn(opts.binaryPath(), [], {
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
      flushPending();
    });

    proc.on("error", () => {
      proc = null;
    });
  }

  // Cancel any pending query — same protocol stream, only one in flight.
  function flushPending(): void {
    if (!pendingResolve) return;
    if (pendingResolve.kind === "focus") pendingResolve.resolve(false);
    else pendingResolve.resolve(null);
    pendingResolve = null;
  }

  return {
    warm() {
      ensureProcess();
    },
    getWindowAtPoint(x, y, excludePid) {
      return new Promise((resolve) => {
        ensureProcess();
        if (!proc?.stdin) {
          resolve(null);
          return;
        }
        flushPending();
        pendingResolve = { kind: "window", resolve };

        const parts = [Math.round(x), Math.round(y)];
        if (excludePid !== undefined) parts.push(excludePid);
        proc.stdin.write(parts.join(" ") + "\n");
      });
    },
    focusAppByPid(pid) {
      return new Promise((resolve) => {
        ensureProcess();
        if (!proc?.stdin) {
          resolve(false);
          return;
        }
        flushPending();
        pendingResolve = { kind: "focus", resolve };
        proc.stdin.write(`focus ${Math.round(pid)}\n`);
      });
    },
    focusTopmostApp(excludePid) {
      return new Promise((resolve) => {
        ensureProcess();
        if (!proc?.stdin) {
          resolve(false);
          return;
        }
        flushPending();
        pendingResolve = { kind: "focus", resolve };
        const cmd =
          excludePid !== undefined
            ? `focus-topmost ${Math.round(excludePid)}`
            : "focus-topmost";
        proc.stdin.write(cmd + "\n");
      });
    },
  };
}
