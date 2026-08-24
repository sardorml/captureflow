import { CHROME_WEBSTORE_URL } from "./marketing/constants";

const EXTENSION_ID_KEY = "captureflow:extension-id";

// Mirror EXTERNAL_LOGOUT_KIND / EXTERNAL_RECORD_KIND in apps/extension's
// lib/auth/handoff.ts.
const SIGN_OUT_KIND = "captureflow-logout";
const RECORD_KIND = "captureflow-record";

/*
 * The published extension's id is the last segment of its store URL, so the
 * listing stays the one place it is written down. Needed because a browser can
 * have the extension installed without ever having signed in through the web,
 * which is the only way readExtensionId() learns an id.
 */
const PUBLISHED_EXTENSION_ID = CHROME_WEBSTORE_URL?.split("/").pop() ?? null;

// chrome.runtime is injected only on pages the extension lists in
// externally_connectable; @types/chrome isn't a web dep, so type what we use.
export type RuntimeBridge = {
  sendMessage: (
    extensionId: string,
    message: unknown,
    callback?: (response: unknown) => void,
  ) => void;
  lastError?: { message?: string };
};

export function getRuntime(): RuntimeBridge | null {
  const g = globalThis as { chrome?: { runtime?: RuntimeBridge } };
  return g.chrome?.runtime ?? null;
}

// Remember the extension that signed in here, so sign-out can notify it.
export function rememberExtensionId(extId: string): void {
  try {
    localStorage.setItem(EXTENSION_ID_KEY, extId);
  } catch {
    /* storage unavailable */
  }
}

function readExtensionId(): string | null {
  try {
    return localStorage.getItem(EXTENSION_ID_KEY);
  } catch {
    return null;
  }
}

// Tell the extension that signed in here to drop its session, mirroring the
// login handshake. No-op if none signed in or it's no longer installed.
export function notifyExtensionSignOut(): void {
  const extId = readExtensionId();
  if (!extId) return;
  getRuntime()?.sendMessage?.(extId, { kind: SIGN_OUT_KIND });
}

/*
 * Reading lastError is what suppresses chrome's "Unchecked runtime.lastError"
 * console noise, which every miss would otherwise log — and a miss is the
 * expected answer here, not a fault.
 */
function askToRecord(runtime: RuntimeBridge, extId: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      runtime.sendMessage(extId, { kind: RECORD_KIND }, (response) => {
        void runtime.lastError;
        resolve((response as { ok?: unknown } | undefined)?.ok === true);
      });
    } catch {
      resolve(false);
    }
  });
}

/*
 * Ask the installed extension to open its recorder panel. False means no
 * extension answered — the caller sends the user to the store instead.
 */
export async function openRecorder(): Promise<boolean> {
  const runtime = getRuntime();
  if (!runtime?.sendMessage) return false;
  const remembered = readExtensionId();
  const ids = [remembered, PUBLISHED_EXTENSION_ID].filter(
    (id, i, all): id is string => id !== null && all.indexOf(id) === i,
  );
  for (const id of ids) {
    if (await askToRecord(runtime, id)) return true;
  }
  return false;
}
