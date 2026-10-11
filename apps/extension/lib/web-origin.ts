export const PRODUCTION_WEB_BASE = "https://captureflow.dev";

/*
 * The origins the extension trusts: the backend it was built for, plus every
 * localhost port in dev only. Chrome match patterns can't carry a port, so the
 * host is matched on any port. A published build must never trust localhost —
 * any local app could then answer for the dashboard.
 */
export function webOriginMatches(
  webBase: string | undefined,
  isDev: boolean,
): string[] {
  const url = new URL(webBase || PRODUCTION_WEB_BASE);
  const matches = [`${url.protocol}//${url.hostname}/*`];
  if (isDev && url.hostname !== "localhost") {
    matches.push("http://localhost/*");
  }
  return matches;
}
