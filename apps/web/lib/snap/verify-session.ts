/// <reference types="@cloudflare/workers-types" />

// In-process session verification for the snap viewer.
//
// An earlier standalone version of this module made a server-side
// `fetch` to app.captureflow.xyz/api/verify-session, forwarding the
// visitor's cookie header across origins (with an explicit Origin for
// the CORS allowlist, an 8s timeout, and a single retry on cold-start).
// Now the snap viewer lives under `/s` on the SAME app as better-auth,
// so there is no second origin to call: we run the exact session lookup
// the app's own `app/api/verify-session/route.ts` does —
//   1. `auth.api.getSession({ headers })`  (reads the cookie),
//   2. `listWorkspacesForUser(DB, userId)` for workspace memberships,
//   3. a `users.image` read for the viewer's avatar.
//
// The cross-origin fetch, its CORS Origin header, the timeout, and the
// retry are all gone for this path — there is no network hop to fail.
//
// This is the byte-for-byte mirror of lib/share/verify-session.ts (the
// share equivalent). Return shape:
//   - VerifiedSession: a valid session was found.
//   - null:            "definitely no session" — no cookie, or no
//                      session for the cookie. Render RequestAccess.
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
  // Optional avatar URL from better-auth `users.image`. Surfaced so the
  // viewer's own chip reflects uploads done on app-web.
  image: string | null;
  workspaceIds: string[];
};

export type VerifySessionResult = VerifiedSession | null | 'unknown';

// Reconstruct a Headers object carrying just the visitor's cookie so
// better-auth can read the session cookie out of it — the same way the
// app-web route passes `req.headers` straight through. Callers hand us
// the raw cookie header (`(await headers()).get('cookie')`), preserving
// the original signature so no moved caller needs to change.
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
    // `auth.api.getSession` reads the cookie out of `headers` — the same
    // path the dashboard + app-web's /api/verify-session use. With
    // cross-subdomain cookies enabled the visitor's cookie is present.
    session = await auth.api.getSession({
      headers: headersFromCookie(cookieHeader),
    });
  } catch (err) {
    // A thrown lookup is a transient backend failure (cold start, D1
    // blip) — surface as 'unknown' so the page renders a loading shell
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
