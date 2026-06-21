import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Edge-runtime gate. `getSessionCookie` only reads cookie presence
// (cheap, no DB hit); per-action and per-page server checks via
// `auth.api.getSession()` do the actual session-row verification.
//
// PUBLIC routes that sit OUTSIDE the gate:
//   - `/`                         → custom landing (app/page.tsx redirects
//                                   signed-in users to /shares).
//   - `/login`, `/signup`         → auth forms.
//   - `/auth/callback`            → desktop deep-link handoff (does its own
//                                   session check + redirect to /login).
//   - `/auth/clear`               → cookie-shredder the session guard sends
//                                   users to on a dead/invalid session.
//   - `/invite/*`                 → workspace invite landing.
//   - `/download`                 → public "get the app" page (linked from
//                                   the landing's Download button).
//   - `/plan`                     → public pricing page (PricingSection +
//                                   ComparePlansSection + FAQ).
//   - `/suggest-feature`          → public feature-suggestion form (linked
//                                   from the landing's roadmap section).
//   - `/r/[id]`, `/s/[id]`        → public share + snap viewers (visibility
//                                   enforced inside the route, not here).
//   - `/api/auth`, `/api/r/*`, `/api/s/*`, `/api/usage`, `/api/workspaces`,
//     `/api/verify-session`, `/api/request-access`, `/api/lemon-webhook`
//                                 → unauthenticated or bearer-token APIs;
//                                   excluded so the desktop's bearer calls
//                                   get a JSON 401 instead of a 302.
//
// Dashboard routes (/shares, /snaps, /devices, /members, /settings,
// /profile, /notifications) stay GATED — a missing session cookie bounces
// to /login.

export const config = {
  matcher: [
    // The trailing `(?!...\\.[\\w]+$)` excludes any top-level static file in
    // /public so the gate never redirects an asset to /login. `_next/`
    // already covers the build output + the /_next/image optimizer.
    '/((?!_next/|favicon\\.ico|robots\\.txt|ingest/|api/auth|api/lemon-webhook|api/usage|api/verify-session|api/workspaces|api/request-access|api/r/|api/s/|r/|r$|s/|s$|login|signup|download|plan|suggest-feature|auth/callback|auth/clear|invite|.*\\.[\\w]+$).*)',
  ],
};

export function middleware(req: NextRequest) {
  // The bare `/` is the public landing — app/page.tsx self-branches
  // (renders the landing when logged out, redirects to /shares when logged
  // in). Never gate it here.
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
    // Don't replay a stale 307 after a redeploy.
    res.headers.set('cache-control', 'no-store, must-revalidate');
    return res;
  }
  // Pin gated HTML to `no-store` so the browser never serves a cached shell
  // that still references chunks from a previous deploy.
  const res = NextResponse.next();
  res.headers.set('cache-control', 'private, no-store, must-revalidate');
  return res;
}
