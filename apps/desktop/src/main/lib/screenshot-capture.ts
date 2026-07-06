import { spawn } from "child_process";
import { existsSync } from "fs";
import { copyFile, mkdir, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { homedir } from "os";
import { join } from "path";
import { clipboard, nativeImage, shell } from "electron";
import {
  captureSnapshotPng,
  type SnapshotConfig,
} from "@captureflow/engine/main";
import { engineBinaryPath } from "./engine-paths";

import { logInfo, logWarn, logError } from "./logger";

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
  return engineBinaryPath("screen-recorder");
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
  const tempPath = join(tmpdir(), `captureflow-screenshot-${Date.now()}.png`);
  const config: SnapshotConfig = {
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

  const result = await captureSnapshotPng({
    binaryPath: getBinaryPath(),
    config,
    logger: { info: logInfo, warn: logWarn, error: logError },
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
