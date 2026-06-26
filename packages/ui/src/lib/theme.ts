export type Theme = "light" | "dark";

export const THEME_COOKIE = "captureflow_theme";
export const DEFAULT_THEME: Theme = "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function readThemeFromCookieHeader(
  cookieHeader: string | null | undefined,
): Theme {
  if (!cookieHeader) return DEFAULT_THEME;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === THEME_COOKIE) {
      const val = decodeURIComponent(rest.join("="));
      return isTheme(val) ? val : DEFAULT_THEME;
    }
  }
  return DEFAULT_THEME;
}
