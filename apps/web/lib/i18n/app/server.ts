import { cache } from "react";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, langOf, type Locale } from "../config";
import {
  isCrawler,
  LANGUAGE_COOKIE,
  parseLanguageChoice,
  preferredLocale,
} from "../preference";
import { getAppMessages } from "./load";
import type { AppMessages } from "./messages";

export type AppI18n = { locale: Locale; lang: string; messages: AppMessages };

async function requestLocale(): Promise<Locale> {
  try {
    const [jar, head] = await Promise.all([cookies(), headers()]);
    const chosen = parseLanguageChoice(jar.get(LANGUAGE_COOKIE)?.value);
    // A link preview shows the same text to everyone, so it stays English.
    if (!chosen && isCrawler(head.get("user-agent"))) return DEFAULT_LOCALE;
    return preferredLocale({
      chosen,
      acceptLanguage: head.get("accept-language"),
      country: head.get("cf-ipcountry"),
    });
  } catch {
    // No request to read: a unit test, or a page rendered at build time.
    return DEFAULT_LOCALE;
  }
}

/*
 * The language of the request and its copy, for server components, routes and
 * server actions. Reads cookies, so only dynamic pages may call it; client
 * components use useAppMessages() instead.
 */
export const getAppI18n = cache(async (): Promise<AppI18n> => {
  const locale = await requestLocale();
  return {
    locale,
    lang: langOf(locale),
    messages: await getAppMessages(locale),
  };
});
