const EXTENSION_ID_KEY = "captureflow:extension-id";

// Mirror EXTERNAL_LOGOUT_KIND / EXTERNAL_RECORD_KIND in apps/extension's
// lib/auth/handoff.ts.
const SIGN_OUT_KIND = "captureflow-logout";
const RECORD_KIND = "captureflow-record";

/*
 * Stamped on <html> by the extension's content script on this origin. Its
 * presence is the one reliable answer to "is the extension installed here":
 * an unpacked build's id comes from its path, so no id the web app could
 * hard-code would reach it. Mirrors PRESENCE_ATTRIBUTE in apps/extension's
 * entrypoints/web-session.content.ts.
 */
const PRESENCE_ATTRIBUTE = "data-captureflow-extension";

// Null when the extension isn't installed here — the caller sends the user to
// the store instead. Synchronous, so a click can act on it without an await.
export function installedExtensionId(): string | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.getAttribute(PRESENCE_ATTRIBUTE) || null;
}

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

// Ask the installed extension to open its recorder panel over the current tab.
export function openRecorder(extId: string): Promise<boolean> {
  const runtime = getRuntime();
  if (!runtime?.sendMessage) return Promise.resolve(false);
  return askToRecord(runtime, extId);
}
