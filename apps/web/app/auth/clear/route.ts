import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cookie shredder. The dashboard's session guard sends users here when
// getSession() returns null or throws — e.g. the D1 session row was
// deleted/reaped, or BETTER_AUTH_SECRET was rotated so old cookies fail
// HMAC verification. Middleware only checks cookie presence, so a stale
// cookie keeps bouncing the user back into the gated zone after every
// /login redirect. Clearing it here breaks the loop: the next request
// hits middleware with no cookie and redirects cleanly to /login.

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get('next');
  const cookieStore = await cookies();

  // Match every cookie better-auth might have set: the default
  // `better-auth.` prefix plus the __Secure-/__Host- variants used when
  // the cookie was minted with the secure flag.
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
  // Don't cache this response, so a back-button after redeploy can't
  // replay a stale tree.
  res.headers.set('cache-control', 'no-store, must-revalidate');
  // Wipe everything for this origin: cached HTML/JS/CSS chunks from a
  // previous deploy (_next/static/<old BUILD_ID>/…), leftover cookies,
  // and service-worker / cache-storage entries. This unsticks a session
  // stuck "loading forever" after a redeploy — the / → /auth/clear →
  // /login chain arrives with stale state, this clears it, and the
  // redirect to /login lands on a clean origin.
  //   See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data
  res.headers.set('clear-site-data', '"cache", "cookies", "storage"');
  return res;
}
