import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cookie shredder. The dashboard's session guard sends users here
// whenever `getSession()` returns null (or throws). Two real-world
// triggers:
//   1. Session row was deleted from D1 (admin removed the user, or the
//      sessions row aged out and was reaped by the cron) — the cookie
//      is still in the browser, middleware still lets it through, but
//      the dashboard can never load.
//   2. BETTER_AUTH_SECRET was rotated between deploys — every cookie
//      signed under the old secret now fails HMAC verification.
//
// Without this route, those users get stuck because middleware
// (cookie-presence only) keeps shoving them back into the gated zone
// after every /login bounce. Clearing the cookie here breaks the loop
// — the next request lands at middleware with no cookie and gets a
// clean redirect to /login.

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get('next');
  const cookieStore = await cookies();

  // Match every cookie better-auth might have set. Default prefix is
  // `better-auth.` (covers session_token, session_data, …) plus the
  // `__Secure-` variants browsers use when the cookie was minted with
  // the secure flag.
  for (const c of cookieStore.getAll()) {
    const isBetterAuth =
      c.name.startsWith('better-auth.') ||
      c.name.startsWith('__Secure-better-auth.') ||
      c.name.startsWith('__Host-better-auth.');
    if (isBetterAuth) cookieStore.delete(c.name);
  }

  const target = new URL('/login', url);
  if (next && next.startsWith('/')) {
    target.searchParams.set('next', next);
  }
  const res = NextResponse.redirect(target);
  // Belt-and-braces: tell the browser not to cache this response and
  // to drop any HTML it might have for the path that triggered the
  // clear. Without this, a back-button after redeploy could replay a
  // stale tree.
  res.headers.set('cache-control', 'no-store, must-revalidate');
  // Nuclear option: tell the browser to wipe everything for this
  // origin — cached HTML/JS/CSS chunks from a previous deploy
  // (`_next/static/<old BUILD_ID>/…`), any leftover cookies, and any
  // service-worker / cache-storage entries. This is what unsticks a
  // user whose normal-browser session is stuck "loading forever"
  // after a redeploy: the chain `/ → /auth/clear → /login` arrives
  // here with stale state, this header wipes it, and the follow-up
  // redirect to /login lands on a clean origin.
  //   See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data
  res.headers.set('clear-site-data', '"cache", "cookies", "storage"');
  return res;
}
