// True only when the browser stamped the request with this site's own origin; a request with no Origin header is refused.
export function isSameOriginRequest(
  origin: string | null,
  requestUrl: string,
): boolean {
  if (!origin) return false;
  try {
    return origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}
