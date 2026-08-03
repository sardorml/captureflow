export type Theme = "light" | "dark";

// What the user picked. "system" defers to the OS, so it is never what paints —
// only ever what resolves to a Theme.
export type ThemePreference = Theme | "system";

export const THEME_COOKIE = "captureflow_theme";
export const DEFAULT_THEME: Theme = "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return isTheme(value) || value === "system";
}

function readCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === THEME_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function readThemePreferenceFromCookieHeader(
  cookieHeader: string | null | undefined,
): ThemePreference {
  const value = readCookie(cookieHeader);
  return isThemePreference(value) ? value : DEFAULT_THEME;
}

/*
 * What to paint on the server. A "system" preference has no server-side answer
 * — the OS setting never reaches us — so it renders as the default, and
 * THEME_INIT_SCRIPT corrects it before first paint.
 */
export function readThemeFromCookieHeader(
  cookieHeader: string | null | undefined,
): Theme {
  const value = readCookie(cookieHeader);
  return isTheme(value) ? value : DEFAULT_THEME;
}

/*
 * Runs blocking in <head>, ahead of any paint, so a "system" preference never
 * shows the server's guess first. The listener stays for the session and
 * re-reads the cookie each time, so it covers both an OS switch made later and
 * a preference switched to "system" without a reload.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var q=window.matchMedia("(prefers-color-scheme: dark)");
var apply=function(){
var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);
if(!m||decodeURIComponent(m[1])!=="system")return;
document.documentElement.setAttribute("data-theme",q.matches?"dark":"light");
};
apply();
q.addEventListener("change",apply);
}catch(e){}})()`;
