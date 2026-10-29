/// <reference types="@cloudflare/workers-types" />

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth, type AuthInstance } from "./auth";
import { renderTrace } from "./render-trace";
import { withTimeout } from "./with-timeout";

/*
 * getSession can throw on a stale cookie (deleted session row, rotated
 * BETTER_AUTH_SECRET); an uncaught throw stalls the page render on Workers, so
 * we swallow it and return null.
 *
 * Cached per request: a dashboard render asks from the layout, the top bar,
 * the sidebar and the page, and each lookup is a D1 round trip.
 */

type Session = NonNullable<
  Awaited<ReturnType<AuthInstance["api"]["getSession"]>>
>;

export const loadSession = cache(async (): Promise<Session | null> => {
  const trace = await renderTrace("session");
  const auth = await getAuth();
  trace("auth built");
  try {
    const result = await auth.api.getSession({ headers: await headers() });
    trace("session read");
    return (result ?? null) as Session | null;
  } catch (err) {
    console.error("[auth] getSession threw:", err);
    return null;
  }
});

const REDIRECT_SESSION_TIMEOUT_MS = 3000;

/*
 * For public pages that read the session only to send a signed-in visitor on.
 * Prod renders have stalled inside the lookup on long-lived isolates; past the
 * limit the page renders signed-out instead of never responding. Never use it
 * to gate the app: a timeout there would read as signed out.
 */
export function loadSessionForRedirect(): Promise<Session | null> {
  return withTimeout(loadSession(), REDIRECT_SESSION_TIMEOUT_MS, null);
}

// Route through /auth/clear (a Route Handler) to delete the stale cookie;
// server components can't delete cookies, which would otherwise bounce-loop.
export async function requireSession(): Promise<Session> {
  const session = await loadSession();
  if (!session) redirect("/auth/clear");
  return session;
}
