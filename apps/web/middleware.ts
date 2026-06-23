import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export const config = {
  matcher: [
    // Bearer-token APIs are excluded so desktop bearer calls get a JSON 401, not a 302.
    '/((?!_next/|favicon\\.ico|robots\\.txt|ingest/|api/auth|api/lemon-webhook|api/usage|api/verify-session|api/workspaces|api/request-access|api/r/|api/s/|r/|r$|s/|s$|login|signup|download|plan|suggest-feature|auth/callback|auth/clear|invite|.*\\.[\\w]+$).*)',
  ],
};

export function middleware(req: NextRequest) {
  // The bare `/` is the public landing (app/page.tsx self-branches); never gate it.
  if (req.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  const cookie = getSessionCookie(req);
  if (!cookie) {
    const url = req.nextUrl.clone();
    const next = url.pathname + (url.search || '');
    url.pathname = '/login';
    url.search = next && next !== '/' ? `?next=${encodeURIComponent(next)}` : '';
    const res = NextResponse.redirect(url);
    res.headers.set('cache-control', 'no-store, must-revalidate');
    return res;
  }
  const res = NextResponse.next();
  res.headers.set('cache-control', 'private, no-store, must-revalidate');
  return res;
}
