import {
  DEFAULT_LOCALE,
  LANGUAGE_OPTIONS,
  type Locale,
  type LocaleCode,
} from "./config";

// Holds the language a visitor picked, so their choice outranks their location.
export const LANGUAGE_COOKIE = "captureflow_lang";

export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Countries with one main language the site is published in. Countries with
// several (Switzerland, Belgium, Canada) are left on English.
const COUNTRY_LOCALE: Record<string, LocaleCode> = {
  DE: "de",
  AT: "de",
  LI: "de",
  FR: "fr",
  MC: "fr",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  BR: "pt-br",
  PT: "pt",
  AO: "pt",
  MZ: "pt",
  IT: "it",
  SM: "it",
  PL: "pl",
  SE: "sv",
  FI: "fi",
  NO: "no",
  TR: "tr",
  UZ: "uz",
  VN: "vi",
  TH: "th",
  JP: "ja",
  KR: "ko",
};

const CRAWLER =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|lighthouse|headless/i;

// Link previews and search crawlers: no person is reading from that country.
export function isCrawler(userAgent: string | null): boolean {
  return !userAgent || CRAWLER.test(userAgent);
}

export function parseLanguageChoice(value: string | undefined): Locale | null {
  return LANGUAGE_OPTIONS.find((option) => option.code === value)?.code ?? null;
}

// The language a visitor reads: the one they picked, else their country's.
export function preferredLocale({
  chosen,
  country,
}: {
  chosen: Locale | null;
  country: string | null;
}): Locale {
  return (
    chosen ?? COUNTRY_LOCALE[country?.toUpperCase() ?? ""] ?? DEFAULT_LOCALE
  );
}

/*
 * The language to send a visitor on an English address to, if any. Crawlers
 * always get the address they asked for, so every language is indexed
 * whatever country they crawl from.
 */
export function redirectLocale({
  chosen,
  country,
  userAgent,
}: {
  chosen: Locale | null;
  country: string | null;
  userAgent: string | null;
}): LocaleCode | null {
  if (isCrawler(userAgent)) return null;
  const locale = preferredLocale({ chosen, country });
  return locale === DEFAULT_LOCALE ? null : locale;
}

// Browser only: the language saved by rememberLanguage or the middleware.
export function readLanguageChoice(): Locale | null {
  const saved = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${LANGUAGE_COOKIE}=`));
  return parseLanguageChoice(saved?.slice(LANGUAGE_COOKIE.length + 1));
}

// Browser only: called when a visitor picks a language from a menu.
export function rememberLanguage(locale: Locale): void {
  document.cookie = `${LANGUAGE_COOKIE}=${locale}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
}
