/// <reference types="@cloudflare/workers-types" />

// In-process session verification for the snap viewer. Runs the same
// lookup app-web's /api/verify-session does: getSession (reads the
// cookie), listWorkspacesForUser, and a users.image read for the avatar.
//
// Return shape:
//   - VerifiedSession: a valid session was found.
//   - null:            no session — no cookie, or no session for the
//                      cookie. Render RequestAccess.
//   - 'unknown':       transient backend failure (e.g. a D1 hiccup or
//                      the auth lookup throwing). The caller renders a
//                      neutral loading shell instead of RequestAccess so
//                      a cold-start blip isn't mistaken for "logged out".

import { listWorkspacesForUser } from '@captureflow/quota';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';

export type VerifiedSession = {
  userId: string;
  email: string;
  name: string | null;
  // Avatar URL from better-auth `users.image`, so the viewer's own chip
  // reflects uploads done on app-web.
  image: string | null;
  workspaceIds: string[];
};

export type VerifySessionResult = VerifiedSession | null | 'unknown';

// Wrap the visitor's raw cookie header in a Headers object so better-auth
// can read the session cookie out of it, the same way the app-web route
// passes `req.headers` straight through.
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
    // getSession reads the cookie out of `headers`; cross-subdomain
    // cookies must be enabled for the visitor's cookie to be present.
    session = await auth.api.getSession({
      headers: headersFromCookie(cookieHeader),
    });
  } catch (err) {
    // A thrown lookup is a transient backend failure (cold start, D1
    // blip); surface as 'unknown' so the page renders a loading shell
    // rather than treating it as a hard "logged out".
    console.error('snap verify-session: getSession threw', err);
    return 'unknown';
  }
  if (!session) return null;

  const env = await getAppWebEnv();
  if (!env?.DB) {
    // No DB binding means we can't resolve workspace memberships. Treat
    // as transient rather than "no session" so a misconfigured/cold
    // request doesn't downgrade a logged-in viewer to RequestAccess.
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
    console.error('snap verify-session: membership lookup threw', err);
    return 'unknown';
  }
}

// Convenience wrapper for callers that don't distinguish "definitely
// no session" from "transient backend failure" — API route mutations,
// for instance, want to fail closed (401) either way. The page-level
// viewer cares about the distinction so it can render a loading shell
// instead of RequestAccess.
export async function verifySessionOrNull(
  cookieHeader: string | null
): Promise<VerifiedSession | null> {
  const r = await verifySession(cookieHeader);
  return r === 'unknown' ? null : r;
}
