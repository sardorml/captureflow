import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/*
 * Where better-auth sends an agent's sign-in when nobody is signed in. Its
 * own resume cookie would answer the login page's in-page sign-in request
 * with a redirect the page can't follow, so it is dropped and /login is
 * told to come back to authorize instead, which works for every sign-in
 * method and for a visitor who is already signed in.
 */
export function GET(req: NextRequest) {
  const authorize = `/api/auth/mcp/authorize?${req.nextUrl.searchParams}`;
  const login = new URL("/login", req.nextUrl.origin);
  login.searchParams.set("next", authorize);
  const res = NextResponse.redirect(login);
  res.cookies.delete("oidc_login_prompt");
  return res;
}
