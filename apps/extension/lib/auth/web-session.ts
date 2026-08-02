import { WEB_BASE } from "../config";

export type WebSessionResult =
  | { kind: "signed-in"; userId: string }
  | { kind: "signed-out" }
  | { kind: "unknown" };

/*
 * Who this browser profile is signed in to the dashboard as, read with the
 * profile's own cookies. `credentials: "include"` is required — an extension
 * page defaults to "same-origin", which for chrome-extension:// sends nothing —
 * and host_permissions is what lets the request skip CORS.
 *
 * /api/verify-session answers 401 both for "no session" and for a lookup that
 * threw, so only the explicit no-session body counts as signed out; everything
 * else is inconclusive and must not cost the caller its token.
 */
export async function getWebSession(): Promise<WebSessionResult> {
  let res: Response;
  try {
    res = await fetch(`${WEB_BASE}/api/verify-session`, {
      credentials: "include",
    });
  } catch {
    return { kind: "unknown" };
  }

  const body = (await res.json().catch(() => null)) as {
    userId?: unknown;
    error?: unknown;
  } | null;

  if (res.ok) {
    return typeof body?.userId === "string" && body.userId.length > 0
      ? { kind: "signed-in", userId: body.userId }
      : { kind: "unknown" };
  }
  if (res.status === 401 && body?.error === "no-session") {
    return { kind: "signed-out" };
  }
  return { kind: "unknown" };
}
