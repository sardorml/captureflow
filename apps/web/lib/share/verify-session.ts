/// <reference types="@cloudflare/workers-types" />

// In-process session verification for the share viewer. The viewer lives
// under `/r` on the same app as better-auth, so this runs the lookup
// in-process rather than fetching app-web's /api/verify-session across
// origins (no CORS dance):
//   1. `auth.api.getSession({ headers })`  (reads the cookie),
//   2. `listWorkspacesForUser(DB, userId)` for workspace memberships,
//   3. a `users.image` read for the viewer's avatar.
//
// Return contract:
//   - VerifiedSession: a valid session was found.
//   - null:            definitely no session (no cookie, or no session
//                      for it). Render RequestAccess.
//   - 'unknown':       transient backend failure (D1 hiccup, auth lookup
//                      throwing). Render a neutral loading shell so a
//                      cold-start blip isn't mistaken for "logged out".

import { listWorkspacesForUser } from '@captureflow/quota';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';

export type VerifiedSession = {
  userId: string;
  email: string;
  name: string | null;
  // Avatar URL from better-auth `users.image`, so the viewer's own chip +
  // composer avatar reflect uploads done on app-web.
  image: string | null;
  workspaceIds: string[];
};

export type VerifySessionResult = VerifiedSession | null | 'unknown';

// Wrap the raw cookie header in a Headers object so better-auth can read
// the session cookie out of it. Callers pass `(await headers()).get('cookie')`.
function headersFromCookie(cookieHeader: string): Headers {
  const h = new Headers();
  h.set('cookie', cookieHeader);
  return h;
}

export async function verifySession(
  cookieHeader: string | null
): Promise<VerifySessionResult> {
  if (!cookieHeader) return null;

  let session: Awaited<
    ReturnType<Awaited<ReturnType<typeof getAuth>>['api']['getSession']>
  >;
  try {
    const auth = await getAuth();
    // Reads the session cookie out of `headers`. Cross-subdomain cookies
    // are enabled, so the visitor's cookie is present here.
    session = await auth.api.getSession({
      headers: headersFromCookie(cookieHeader),
    });
  } catch (err) {
    // Treat a thrown lookup as transient (cold start, D1 blip) → 'unknown'
    // so the page shows a loading shell instead of a hard "logged out".
    console.error('verify-session: getSession threw', err);
    return 'unknown';
  }
  if (!session) return null;

  const env = await getAppWebEnv();
  if (!env?.DB) {
    // No DB binding → can't resolve workspace memberships. Treat as
    // transient, not "no session", so a misconfigured/cold request
    // doesn't downgrade a logged-in viewer to RequestAccess.
    return 'unknown';
  }

  try {
    const [memberships, userRow] = await Promise.all([
      listWorkspacesForUser(env.DB, session.user.id),
      env.DB.prepare(`SELECT image FROM users WHERE id = ?1 LIMIT 1`)
        .bind(session.user.id)
        .first<{ image: string | null }>(),
    ]);
    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: userRow?.image ?? null,
      workspaceIds: memberships.map((m) => m.workspace_id),
    };
  } catch (err) {
    console.error('verify-session: membership lookup threw', err);
    return 'unknown';
  }
}

// Wrapper for callers that don't distinguish "no session" from
// "transient failure" — e.g. API route mutations that fail closed (401)
// either way. The page-level viewer keeps the distinction so it can show
// a loading shell instead of RequestAccess.
export async function verifySessionOrNull(
  cookieHeader: string | null
): Promise<VerifiedSession | null> {
  const r = await verifySession(cookieHeader);
  return r === 'unknown' ? null : r;
}
