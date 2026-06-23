/// <reference types="@cloudflare/workers-types" />

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth, type AuthInstance } from './auth';

/*
 * getSession can throw on a stale cookie (deleted session row, rotated
 * BETTER_AUTH_SECRET); an uncaught throw stalls the page render on Workers, so
 * we swallow it and return null.
 */

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

// Route through /auth/clear (a Route Handler) to delete the stale cookie;
// server components can't delete cookies, which would otherwise bounce-loop.
export async function requireSession(): Promise<Session> {
  const session = await loadSession();
  if (!session) redirect('/auth/clear');
  return session;
}
