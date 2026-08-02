import { checkAuth, type AuthCheckResult } from "../api/client";
import { getDeviceId } from "./device-id";
import {
  clearAuthSession,
  getAuthSession,
  type SignedOutReason,
} from "./session";

export type WebSession =
  | { kind: "signed-in"; userId: string }
  | { kind: "signed-out" };

export type AuthSyncVerdict =
  | "in-sync"
  | "unknown"
  | "revoked"
  | "signed-out"
  | "other-user";

/*
 * The extension's device token and the dashboard's cookie session are separate
 * credentials for the same browser profile, so they drift: the cookie expires,
 * or the browser signs out or signs in as someone else, while the long-lived
 * token keeps recording as its original owner — producing links that same
 * browser is then refused access to.
 *
 * The web app volunteers its half (the extension can't read its cookies); this
 * decides what that means for the token. A probe we couldn't complete leaves
 * the token alone, so a flaky network never signs anyone out.
 */
export function decideAuthSync(
  token: AuthCheckResult,
  web: WebSession,
): AuthSyncVerdict {
  if (token.kind === "invalid") return "revoked";
  if (token.kind === "unreachable") return "unknown";
  if (web.kind === "signed-out") return "signed-out";
  return web.userId === token.userId ? "in-sync" : "other-user";
}

export const isDesynced = (
  verdict: AuthSyncVerdict,
): verdict is SignedOutReason =>
  verdict === "revoked" || verdict === "signed-out" || verdict === "other-user";

// Drops the stored token when the web app reports a session it no longer
// matches, so the panel falls back to its gate instead of recording as an
// account this browser can't open the resulting links with.
export async function reconcileAuthSession(
  web: WebSession,
): Promise<AuthSyncVerdict> {
  const session = await getAuthSession();
  if (!session) return "in-sync";
  const deviceId = await getDeviceId();
  const verdict = decideAuthSync(await checkAuth(deviceId, session.token), web);
  if (isDesynced(verdict)) await clearAuthSession(verdict);
  return verdict;
}

// Revocation check for a panel open: catches a token killed server-side, which
// no web page would have told us about.
export async function probeAuthSession(): Promise<void> {
  const session = await getAuthSession();
  if (!session) return;
  const deviceId = await getDeviceId();
  const result = await checkAuth(deviceId, session.token);
  if (result.kind === "invalid") await clearAuthSession("revoked");
}
