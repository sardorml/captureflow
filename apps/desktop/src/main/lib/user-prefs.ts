import { app, BrowserWindow } from "electron";
import { join } from "path";
import { readFile, writeFile, mkdir } from "fs/promises";
import { IPC_CHANNELS } from "../../shared/types";
import type { UserPrefs } from "../../shared/types";
import { logInfo, logWarn } from "./logger";

const FILE_NAME = "prefs.json";

const DEFAULTS: UserPrefs = {
  shareEnabled: false,
  analyticsEnabled: false,
  termsAccepted: false,
};

let cache: UserPrefs = { ...DEFAULTS };
let loaded = false;

function filePath(): string {
  return join(app.getPath("userData"), FILE_NAME);
}

export async function loadUserPrefs(): Promise<UserPrefs> {
  try {
    const raw = await readFile(filePath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<UserPrefs>;
    cache = { ...DEFAULTS, ...parsed };
    logInfo("prefs", `loaded: ${JSON.stringify(cache)}`);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      logWarn(
        "prefs",
        `failed to load (${code ?? String(err)}), using defaults`,
      );
    }
    cache = { ...DEFAULTS };
  }
  loaded = true;
  return cache;
}

export function getUserPrefs(): UserPrefs {
  if (!loaded) {
    logWarn("prefs", "getUserPrefs() called before loadUserPrefs() resolved");
  }
  return { ...cache };
}

export async function setUserPref<K extends keyof UserPrefs>(
  key: K,
  value: UserPrefs[K],
): Promise<UserPrefs> {
  cache = { ...cache, [key]: value };
  try {
    await mkdir(app.getPath("userData"), { recursive: true });
    await writeFile(filePath(), JSON.stringify(cache, null, 2), "utf-8");
    logInfo("prefs", `set ${key}=${JSON.stringify(value)}`);
  } catch (err) {
    logWarn("prefs", `failed to persist ${key}: ${String(err)}`);
  }
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.USER_PREFS_CHANGED, cache);
    }
  }
  return { ...cache };
}
