import { spawn } from "child_process";
import { existsSync } from "fs";
import { copyFile, mkdir, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { homedir } from "os";
import { join } from "path";
import { app, clipboard, nativeImage, shell } from "electron";

import { logInfo, logWarn } from "./logger";

export type ScreenshotTarget =
  | { kind: "display"; displayId: number }
  | { kind: "window"; windowId: number }
  | {
      kind: "area";
      displayId: number;
      cropRect: { x: number; y: number; width: number; height: number };
    };

export type CaptureResult = {
  tempPath: string;
  localCopyPath: string | null;
  width: number;
  height: number;
  bytes: number;
};

function getBinaryPath(): string {
  const base = app.isPackaged
    ? join(process.resourcesPath, "native", "screen-recorder", "bin")
    : join(__dirname, "../../native/screen-recorder/bin");
  return join(base, "screen-recorder");
}

async function ensureScreenshotsDir(): Promise<string> {
  const dir = join(homedir(), "Pictures", "CaptureFlow", "Screenshots");
  await mkdir(dir, { recursive: true });
  return dir;
}

function tsFileName(): string {
  const d = new Date();
  const pad = (n: number, w = 2): string => String(n).padStart(w, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}` +
    `-${pad(d.getMilliseconds(), 3)}.png`
  );
}

function playShutter(): void {
  const candidates = [
    "/System/Library/Sounds/Grab.aiff",
    "/System/Library/Sounds/Tink.aiff",
    "/System/Library/Sounds/Glass.aiff",
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) return;
  try {
    spawn("/usr/bin/afplay", [found], {
      stdio: "ignore",
      detached: true,
    }).unref();
  } catch (err) {
    logWarn("screenshot-capture", `shutter sound failed: ${String(err)}`);
  }
}

export async function captureSnapshot(
  target: ScreenshotTarget,
): Promise<CaptureResult> {
  const binPath = getBinaryPath();
  if (!existsSync(binPath)) {
    throw new Error(`screen-recorder binary not found at ${binPath}`);
  }

  const tempPath = join(tmpdir(), `captureflow-screenshot-${Date.now()}.png`);
  type ScreenshotConfig = {
    mode: "snapshot";
    outputPath: string;
    displayId?: number;
    windowId?: number;
    cropRect?: { x: number; y: number; width: number; height: number };
    excludePid: number;
    showsCursor: false;
  };
  const config: ScreenshotConfig = {
    mode: "snapshot",
    outputPath: tempPath,
    excludePid: process.pid,
    showsCursor: false,
  };
  if (target.kind === "display") {
    config.displayId = target.displayId;
  } else if (target.kind === "window") {
    config.windowId = target.windowId;
  } else {
    config.displayId = target.displayId;
    config.cropRect = target.cropRect;
  }

  logInfo(
    "screenshot-capture",
    `spawning snapshot: target=${JSON.stringify(target)}`,
  );

  const result = await new Promise<{
    path: string;
    width: number;
    height: number;
    bytes: number;
  }>((resolve, reject) => {
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
      const line = stdout
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith("{"));
      if (!line) {
        reject(
          new Error(
            `snapshot produced no output (code=${code}, stderr=${stderr.slice(0, 400)})`,
          ),
        );
        return;
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
          reject(new Error(payload.error ?? "snapshot failed"));
          return;
        }
        resolve({
          path: payload.path,
          width: payload.width ?? 0,
          height: payload.height ?? 0,
          bytes: payload.bytes ?? 0,
        });
      } catch (err) {
        reject(new Error(`failed to parse snapshot output: ${String(err)}`));
      }
    });
  });

  try {
    const buf = await readFile(result.path);
    const img = nativeImage.createFromBuffer(buf);
    clipboard.writeImage(img);
  } catch (err) {
    logWarn("screenshot-capture", `clipboard write failed: ${String(err)}`);
  }

  let localCopyPath: string | null = null;
  try {
    const dir = await ensureScreenshotsDir();
    const dest = join(dir, tsFileName());
    await copyFile(result.path, dest);
    localCopyPath = dest;
  } catch (err) {
    logWarn("screenshot-capture", `local save failed: ${String(err)}`);
  }

  playShutter();

  return {
    tempPath: result.path,
    localCopyPath,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}

export function revealLocalScreenshot(localPath: string): void {
  shell.showItemInFolder(localPath);
}

export async function deleteTempScreenshot(tempPath: string): Promise<void> {
  try {
    await unlink(tempPath);
  } catch (err) {
    logWarn("screenshot-capture", `temp cleanup failed: ${String(err)}`);
  }
}
