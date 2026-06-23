// Shared theme primitives.
//
// The active theme lives in a first-party cookie so server components can
// resolve it during render (avoiding FOUC) while client components can
// still read/write it. The name is namespaced to avoid colliding with
// auth state.

export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'captureflow_theme';
export const DEFAULT_THEME: Theme = 'light';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

// Resolves a theme from a raw cookie header (from headers() or the
// incoming Request), falling back to DEFAULT_THEME when unset.
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
