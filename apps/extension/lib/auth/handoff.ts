import { WEB_BASE } from "../config";
import type { AuthSession } from "./session";

// Message kind the web sign-in page posts via chrome.runtime.sendMessage. Keep
// in sync with apps/web's /auth/callback ExtensionHandoff.
export const EXTERNAL_AUTH_KIND = "captureflow-auth";

const AUTH_CALLBACK_PATH = "/auth/callback";

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

// Validate an onMessageExternal payload from the web sign-in page. Untrusted
// input, so narrow defensively; the token must clear the API's 32-char minimum.
export function parseExternalAuth(message: unknown): AuthSession | null {
  if (typeof message !== "object" || message === null) return null;
  const m = message as Record<string, unknown>;
  if (m.kind !== EXTERNAL_AUTH_KIND) return null;
  const token = typeof m.token === "string" ? m.token : "";
  const tokenId = typeof m.id === "string" ? m.id : "";
  if (token.length < 32 || tokenId.length === 0) return null;
  return { token, tokenId };
}

// Open the web sign-in in a normal tab. Passing the extension's own id lets the
// callback post the token back to exactly this extension.
export async function openSignInTab(): Promise<void> {
  const url = new URL(`${WEB_BASE}/auth/callback`);
  url.searchParams.set("ext", chrome.runtime.id);
  url.searchParams.set("label", "Browser extension");
  await chrome.tabs.create({ url: url.toString() });
}
