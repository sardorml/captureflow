import { spawn } from "child_process";
import { existsSync } from "fs";
import type { WindowBounds } from "../types";
import { noopLogger, type EngineLogger } from "./logger";

export type SnapshotConfig = {
  outputPath: string;
  displayId?: number;
  windowId?: number;
  cropRect?: WindowBounds;
  excludePid?: number;
  showsCursor?: boolean;
};

export type SnapshotResult = {
  path: string;
  width: number;
  height: number;
  bytes: number;
};

/** Pull the snapshot payload out of the binary's stdout (JSON line among log noise). */
export function parseSnapshotOutput(
  stdout: string,
): { ok: true; result: SnapshotResult } | { ok: false; error: string } {
  const line = stdout
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("{"));
  if (!line) {
    return { ok: false, error: "snapshot produced no output" };
  }
  try {
    const payload = JSON.parse(line) as {
      ok?: boolean;
      error?: string;
      path?: string;
      width?: number;
      height?: number;
      bytes?: number;
    };
    if (payload.error || !payload.ok || !payload.path) {
      return { ok: false, error: payload.error ?? "snapshot failed" };
    }
    return {
      ok: true,
      result: {
        path: payload.path,
        width: payload.width ?? 0,
        height: payload.height ?? 0,
        bytes: payload.bytes ?? 0,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: `failed to parse snapshot output: ${String(err)}`,
    };
  }
}

/** One-shot PNG capture via the screen-recorder binary's snapshot mode. */
export function captureSnapshotPng(opts: {
  binaryPath: string;
  config: SnapshotConfig;
  logger?: EngineLogger;
}): Promise<SnapshotResult> {
  const log = opts.logger ?? noopLogger;
  const binPath = opts.binaryPath;
  if (!existsSync(binPath)) {
    return Promise.reject(
      new Error(`screen-recorder binary not found at ${binPath}`),
    );
  }

  const config = {
    mode: "snapshot",
    showsCursor: false,
    ...opts.config,
  };

  log.info("snapshot", `spawning snapshot: outputPath=${config.outputPath}`);

  return new Promise((resolve, reject) => {
    const proc = spawn(binPath, [JSON.stringify(config)], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    proc.stdout?.on("data", (b: Buffer) => {
      stdout += b.toString();
    });
    proc.stderr?.on("data", (b: Buffer) => {
      stderr += b.toString();
    });
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      const parsed = parseSnapshotOutput(stdout);
      if (!parsed.ok) {
        const context =
          parsed.error === "snapshot produced no output"
            ? ` (code=${code}, stderr=${stderr.slice(0, 400)})`
            : "";
        reject(new Error(`${parsed.error}${context}`));
        return;
      }
      resolve(parsed.result);
    });
  });
}
