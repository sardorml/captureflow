/// <reference types="@cloudflare/workers-types" />

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth, type AuthInstance } from './auth';

// Centralised session lookup for server components. The raw better-auth
// call (`auth.api.getSession({ headers })`) sometimes throws on a stale
// cookie — typical scenario: the session row was cascade-deleted (user
// removed by admin), or BETTER_AUTH_SECRET was rotated and the cookie's
// HMAC no longer verifies. A bare uncaught throw in a server component
// stalls the page render on Workers, which the user perceives as
// "site keeps loading."
//
// Swallow the throw so callers get a clean null and can redirect.

type Session = NonNullable<
  Awaited<ReturnType<AuthInstance['api']['getSession']>>
>;

export async function loadSession(): Promise<Session | null> {
  const auth = await getAuth();
  try {
    const result = await auth.api.getSession({ headers: await headers() });
    return (result ?? null) as Session | null;
  } catch (err) {
    console.error('[auth] getSession threw:', err);
    return null;
  }
}

// Dashboard pages call this and assume `session.user.id` is non-null.
// On no-session we route through /auth/clear (Route Handler — it can
// actually delete cookies, which server components cannot) so the
// stale cookie doesn't make the browser bounce-loop back into the
// gated zone the next time the user navigates.
export async function requireSession(): Promise<Session> {
  const session = await loadSession();
  if (!session) redirect('/auth/clear');
  return session;
}
