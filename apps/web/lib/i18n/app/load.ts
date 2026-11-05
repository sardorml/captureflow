import { DEFAULT_LOCALE, type Locale, type LocaleCode } from "../config";
import { APP_MESSAGES, type AppMessages } from "./messages";

// Each language is its own chunk, loaded on the server for the one a request
// is in. Importing this from a client component would ship every language.
const CATALOGS: Record<LocaleCode, () => Promise<{ default: AppMessages }>> = {
  de: () => import("./locales/de"),
  fr: () => import("./locales/fr"),
  es: () => import("./locales/es"),
  "pt-br": () => import("./locales/pt-br"),
  pt: () => import("./locales/pt"),
  it: () => import("./locales/it"),
  pl: () => import("./locales/pl"),
  sv: () => import("./locales/sv"),
  fi: () => import("./locales/fi"),
  no: () => import("./locales/no"),
  tr: () => import("./locales/tr"),
  uz: () => import("./locales/uz"),
  vi: () => import("./locales/vi"),
  th: () => import("./locales/th"),
};

export async function getAppMessages(locale: Locale): Promise<AppMessages> {
  if (locale === DEFAULT_LOCALE) return APP_MESSAGES;
  return (await CATALOGS[locale]()).default;
}
