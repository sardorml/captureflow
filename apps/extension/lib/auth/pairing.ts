import { WEB_BASE } from "../config";
import { setAuthSession, type AuthSession } from "./session";

const DEVICE_LABEL = "Browser extension";

// Run sign-in from the service worker, not the popup: launchWebAuthFlow opens a
// focused window that closes the popup (unloading it mid-await). The SW persists
// for the whole flow.
export async function signIn(): Promise<AuthSession> {
  // https://<extension-id>.chromiumapp.org/ — Chrome resolves the flow when the
  // auth page redirects here. The callback allow-lists this exact shape.
  const redirectUri = chrome.identity.getRedirectURL();
  const authUrl = new URL(`${WEB_BASE}/auth/callback`);
  authUrl.searchParams.set("label", DEVICE_LABEL);
  authUrl.searchParams.set("return", redirectUri);

  const finalUrl = await chrome.identity.launchWebAuthFlow({
    url: authUrl.toString(),
    interactive: true,
  });
  if (!finalUrl) {
    throw new Error("Sign-in was cancelled");
  }

  const params = new URL(finalUrl).searchParams;
  const token = params.get("token") ?? "";
  const tokenId = params.get("id") ?? "";
  if (token.length < 32 || tokenId.length === 0) {
    throw new Error("Sign-in did not return a token");
  }

  const session: AuthSession = { token, tokenId };
  await setAuthSession(session);
  return session;
}

export async function signOut(): Promise<void> {
  await setAuthSession(null);
}
