import { WEB_BASE } from "../config";
import type { AuthSession } from "./session";

// Message kinds the web app posts via chrome.runtime.sendMessage. Keep in sync
// with apps/web (ExtensionHandoff for auth, UserMenu for logout).
export const EXTERNAL_AUTH_KIND = "captureflow-auth";
export const EXTERNAL_LOGOUT_KIND = "captureflow-logout";

const AUTH_CALLBACK_PATH = "/auth/callback";

export type ExternalMessage =
  | { kind: "auth"; session: AuthSession }
  | { kind: "logout" };

/*
 * Defense-in-depth over externally_connectable: only the web app's own callback
 * page may hand us a token, not some other in-scope page or localhost port.
 * externally_connectable can't express a path, so check it here.
 */
export function isTrustedAuthSender(senderUrl: string | undefined): boolean {
  if (!senderUrl) return false;
  let url: URL;
  try {
    url = new URL(senderUrl);
  } catch {
    return false;
  }
  return (
    url.origin === new URL(WEB_BASE).origin &&
    url.pathname === AUTH_CALLBACK_PATH
  );
}

// Logout carries no token, so accept it from any page on the web origin — a
// hostile same-origin page could only force a re-login, not leak anything.
export function isTrustedWebOrigin(senderUrl: string | undefined): boolean {
  if (!senderUrl) return false;
  try {
    return new URL(senderUrl).origin === new URL(WEB_BASE).origin;
  } catch {
    return false;
  }
}

// Validate an onMessageExternal payload from the web app. Untrusted input, so
// narrow defensively; an auth token must clear the API's 32-char minimum.
export function parseExternalMessage(message: unknown): ExternalMessage | null {
  if (typeof message !== "object" || message === null) return null;
  const m = message as Record<string, unknown>;
  if (m.kind === EXTERNAL_LOGOUT_KIND) return { kind: "logout" };
  if (m.kind === EXTERNAL_AUTH_KIND) {
    const token = typeof m.token === "string" ? m.token : "";
    const tokenId = typeof m.id === "string" ? m.id : "";
    if (token.length >= 32 && tokenId.length > 0) {
      return { kind: "auth", session: { token, tokenId } };
    }
  }
  return null;
}

// Open the web sign-in in a normal tab. Passing the extension's own id lets the
// callback post the token back to exactly this extension.
export async function openSignInTab(): Promise<void> {
  const url = new URL(`${WEB_BASE}/auth/callback`);
  url.searchParams.set("ext", chrome.runtime.id);
  url.searchParams.set("label", "Browser extension");
  await chrome.tabs.create({ url: url.toString() });
}
