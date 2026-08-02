import { checkAuth, type AuthCheckResult } from "../api/client";
import { getDeviceId } from "./device-id";
import { getAuthSession, setAuthSession } from "./session";
import { getWebSession, type WebSessionResult } from "./web-session";

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
 * Only a definitive pair of answers costs the token. Anything inconclusive
 * (offline, 5xx, a body we can't read) keeps it, so a flaky network never signs
 * anyone out.
 */
export function decideAuthSync(
  token: AuthCheckResult,
  web: WebSessionResult,
): AuthSyncVerdict {
  if (token.kind === "invalid") return "revoked";
  if (token.kind === "unreachable") return "unknown";
  if (web.kind === "unknown") return "unknown";
  if (web.kind === "signed-out") return "signed-out";
  return web.userId === token.userId ? "in-sync" : "other-user";
}

export const isDesynced = (verdict: AuthSyncVerdict): boolean =>
  verdict === "revoked" || verdict === "signed-out" || verdict === "other-user";

// Drops the stored token when it no longer matches the browser, so the UI falls
// back to the sign-in gate rather than recording as the wrong account.
export async function reconcileAuthSession(): Promise<AuthSyncVerdict> {
  const session = await getAuthSession();
  if (!session) return "in-sync";
  const deviceId = await getDeviceId();
  const [token, web] = await Promise.all([
    checkAuth(deviceId, session.token),
    getWebSession(),
  ]);
  const verdict = decideAuthSync(token, web);
  if (isDesynced(verdict)) await setAuthSession(null);
  return verdict;
}
