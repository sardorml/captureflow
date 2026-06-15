// Shared theme primitives — used by app-web, share, snap.
//
// The active theme lives in a single first-party cookie so server
// components can resolve it during render (no FOUC) and client
// components can read/write it. Cookie name is namespaced so it never
// collides with auth state.

export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'captureflow_theme';
export const DEFAULT_THEME: Theme = 'light';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

// Server-side helper: pass the raw cookie header (from headers() or
// the incoming Request) and get back a resolved theme. Falls back to
// DEFAULT_THEME when no cookie is set.
export function readThemeFromCookieHeader(
  cookieHeader: string | null | undefined
): Theme {
  if (!cookieHeader) return DEFAULT_THEME;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === THEME_COOKIE) {
      const val = decodeURIComponent(rest.join('='));
      return isTheme(val) ? val : DEFAULT_THEME;
    }
  }
  return DEFAULT_THEME;
}
