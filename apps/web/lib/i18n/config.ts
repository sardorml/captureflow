/*
 * The public site's languages. English lives at the bare paths it always had;
 * every other language gets the same pages under its `code` (/de, /pt-br).
 * `lang` is the BCP 47 tag for <html lang> and hreflang.
 */
export const DEFAULT_LOCALE = "en";
export const DEFAULT_LANG = "en";

export const LOCALES = [
  { code: "de", lang: "de", og: "de_DE", label: "Deutsch" },
  { code: "fr", lang: "fr", og: "fr_FR", label: "Français" },
  { code: "es", lang: "es", og: "es_ES", label: "Español" },
  { code: "pt-br", lang: "pt-BR", og: "pt_BR", label: "Português (Brasil)" },
  { code: "pt", lang: "pt-PT", og: "pt_PT", label: "Português (Portugal)" },
  { code: "it", lang: "it", og: "it_IT", label: "Italiano" },
  { code: "pl", lang: "pl", og: "pl_PL", label: "Polski" },
  { code: "sv", lang: "sv", og: "sv_SE", label: "Svenska" },
  { code: "fi", lang: "fi", og: "fi_FI", label: "Suomi" },
  { code: "no", lang: "nb", og: "nb_NO", label: "Norsk" },
  { code: "tr", lang: "tr", og: "tr_TR", label: "Türkçe" },
  { code: "uz", lang: "uz", og: "uz_UZ", label: "Oʻzbekcha" },
  { code: "vi", lang: "vi", og: "vi_VN", label: "Tiếng Việt" },
  { code: "th", lang: "th", og: "th_TH", label: "ไทย" },
  { code: "ja", lang: "ja", og: "ja_JP", label: "日本語" },
  { code: "ko", lang: "ko", og: "ko_KR", label: "한국어" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];
export type Locale = typeof DEFAULT_LOCALE | LocaleCode;

export const LANGUAGE_OPTIONS: readonly { code: Locale; label: string }[] = [
  { code: DEFAULT_LOCALE, label: "English" },
  ...LOCALES.map(({ code, label }) => ({ code, label })),
];

export function isLocaleCode(code: unknown): code is LocaleCode {
  return LOCALES.some((l) => l.code === code);
}

export function langOf(locale: Locale): string {
  return LOCALES.find((l) => l.code === locale)?.lang ?? DEFAULT_LANG;
}

export function ogLocaleOf(locale: Locale): string {
  return LOCALES.find((l) => l.code === locale)?.og ?? "en_US";
}

// First path segments that exist in every language; "" is the home page. The
// blog, the legal pages and the comparison page are English only.
const LOCALIZED_SEGMENTS: ReadonlySet<string> = new Set([
  "",
  "download",
  "enterprise",
  "faq",
  "features",
  "pricing",
  "self-host-setup",
]);

function firstSegment(path: string): string {
  return path.replace(/^\//, "").split(/[/#?]/)[0] ?? "";
}

/*
 * Splits a leading language off a path: "/de/pricing" gives ["de", "/pricing"],
 * "/de" gives ["de", "/"], and anything else comes back as [null, path].
 */
export function splitLocale(pathname: string): [LocaleCode | null, string] {
  const segment = pathname.split("/")[1] ?? "";
  if (!isLocaleCode(segment)) return [null, pathname];
  return [segment, pathname.slice(segment.length + 1) || "/"];
}

export function isLocalizedPath(path: string): boolean {
  return path.startsWith("/") && LOCALIZED_SEGMENTS.has(firstSegment(path));
}

// Safe on any href: external links, anchors and English-only pages pass through.
export function localizedHref(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !isLocalizedPath(path)) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

// hreflang map for a localized page, as site-relative paths: every language,
// plus x-default pointing at English.
export function languageAlternates(path: string): Record<string, string> {
  return {
    [DEFAULT_LANG]: path,
    ...Object.fromEntries(
      LOCALES.map((l) => [l.lang, localizedHref(path, l.code)]),
    ),
    "x-default": path,
  };
}
