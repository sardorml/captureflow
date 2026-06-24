const EXTENSION_ID_KEY = "captureflow:extension-id";

// Mirrors EXTERNAL_LOGOUT_KIND in apps/extension's lib/auth/handoff.ts.
const SIGN_OUT_KIND = "captureflow-logout";

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

// Tell the extension that signed in here to drop its session, mirroring the
// login handshake. No-op if none signed in or it's no longer installed.
export function notifyExtensionSignOut(): void {
  let extId: string | null = null;
  try {
    extId = localStorage.getItem(EXTENSION_ID_KEY);
  } catch {
    return;
  }
  if (!extId) return;
  getRuntime()?.sendMessage?.(extId, { kind: SIGN_OUT_KIND });
}
