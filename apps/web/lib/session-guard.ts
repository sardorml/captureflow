/// <reference types="@cloudflare/workers-types" />

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth, type AuthInstance } from './auth';

// Centralised session lookup for server components. The raw better-auth call
// (`auth.api.getSession`) sometimes throws on a stale cookie — e.g. the session
// row was cascade-deleted (user removed by admin), or BETTER_AUTH_SECRET was
// rotated so the cookie's HMAC no longer verifies. An uncaught throw in a server
// component stalls the page render on Workers, which the user perceives as "site
// keeps loading", so we swallow it and return null for callers to redirect on.

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

// On no-session we route through /auth/clear (a Route Handler, which can delete
// cookies — server components cannot) so a stale cookie doesn't bounce-loop the
// browser back into the gated zone on the next navigation.
export async function requireSession(): Promise<Session> {
  const session = await loadSession();
  if (!session) redirect('/auth/clear');
  return session;
}
