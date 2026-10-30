import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { isSelfHosted } from "@captureflow/quota";
import { isAppRoute, isMarketingRoute } from "@/lib/app-routes";

export const config = {
  matcher: [
    // Bearer-token APIs are excluded so desktop bearer calls get a JSON 401, not a 302.
    "/((?!_next/|favicon\\.ico|robots\\.txt|ingest/|api/auth|api/health|api/lemon-webhook|api/usage|api/verify-session|api/workspaces|api/request-access|api/github|api/r/|api/s/|r/|r$|s/|s$|login|signup|plan|privacy|terms|refund|security|auth/callback|auth/clear|invite|.*\\.[\\w]+$).*)",
  ],
};

function redirectTo(
  req: NextRequest,
  pathname: string,
  search = "",
): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  const res = NextResponse.redirect(url);
  res.headers.set("cache-control", "no-store, must-revalidate");
  return res;
}

/*
 * Marketing pages are prerendered, so their per-visitor redirects live here.
 * process.env carries SELF_HOSTED both on Workers (OpenNext copies string vars
 * into it) and in the Docker server. A stale session cookie on `/` lands on
 * /recordings, whose guard clears it.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isMarketingRoute(pathname)) {
    if (pathname === "/" && getSessionCookie(req)) {
      return redirectTo(req, "/recordings");
    }
    if (isSelfHosted({ SELF_HOSTED: process.env.SELF_HOSTED }))
      return redirectTo(req, "/login");
    return NextResponse.next();
  }

  const cookie = getSessionCookie(req);
  // Only app pages send a signed-out visitor to /login; any other path falls
  // through to a real 404 instead of an indexable login page.
  if (!cookie && !isAppRoute(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  if (!cookie) {
    const next = pathname + req.nextUrl.search;
    return redirectTo(req, "/login", `?next=${encodeURIComponent(next)}`);
  }
  const res = NextResponse.next();
  res.headers.set("cache-control", "private, no-store, must-revalidate");
  return res;
}
