// Carries /login's ?next= from the middleware to the login layout: a layout
// cannot read search params itself.
export const LOGIN_NEXT_HEADER = "x-login-next";

const DEFAULT_NEXT = "/dashboard";

// Only a path on this site: a browser reads "//host" and "/\host" as another.
export function safeNextPath(next: string | null | undefined): string {
  if (!next?.startsWith("/") || /^\/[/\\]/.test(next)) return DEFAULT_NEXT;
  return next;
}
