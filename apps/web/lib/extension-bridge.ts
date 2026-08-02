const EXTENSION_ID_KEY = "captureflow:extension-id";

// Mirror EXTERNAL_LOGOUT_KIND / EXTERNAL_SESSION_KIND in apps/extension's
// lib/auth/handoff.ts.
const SIGN_OUT_KIND = "captureflow-logout";
const SESSION_KIND = "captureflow-session";

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
 * Tell the extension who this browser is signed in as, so its device token — a
 * separate, far longer-lived credential — can follow an expiry or an account
 * switch instead of recording as whoever signed in first. The extension can't
 * read this for itself: our cookies aren't attached to extension-context
 * fetches, so the page has to volunteer it.
 */
export function notifyExtensionSession(userId: string | null): void {
  const extId = readExtensionId();
  if (!extId) return;
  getRuntime()?.sendMessage?.(extId, { kind: SESSION_KIND, userId });
}
