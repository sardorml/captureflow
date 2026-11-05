import { MESSAGES, type Messages } from "@/lib/marketing/messages";
import { DEFAULT_LOCALE, type Locale, type LocaleCode } from "./config";

/*
 * Each catalog is its own chunk. A translated page loads its language on the
 * server and hands it to the client provider as props; an English-only page
 * fetches the visitor's chosen one in the browser. Never import a catalog
 * statically from a client component: that ships it to every visitor.
 */
const CATALOGS: Record<LocaleCode, () => Promise<{ default: Messages }>> = {
  de: () => import("@/lib/marketing/locales/de"),
  fr: () => import("@/lib/marketing/locales/fr"),
  es: () => import("@/lib/marketing/locales/es"),
  "pt-br": () => import("@/lib/marketing/locales/pt-br"),
  pt: () => import("@/lib/marketing/locales/pt"),
  it: () => import("@/lib/marketing/locales/it"),
  pl: () => import("@/lib/marketing/locales/pl"),
  sv: () => import("@/lib/marketing/locales/sv"),
  fi: () => import("@/lib/marketing/locales/fi"),
  no: () => import("@/lib/marketing/locales/no"),
  tr: () => import("@/lib/marketing/locales/tr"),
  uz: () => import("@/lib/marketing/locales/uz"),
  vi: () => import("@/lib/marketing/locales/vi"),
  th: () => import("@/lib/marketing/locales/th"),
  ja: () => import("@/lib/marketing/locales/ja"),
  ko: () => import("@/lib/marketing/locales/ko"),
};

export async function getMessages(locale: Locale): Promise<Messages> {
  if (locale === DEFAULT_LOCALE) return MESSAGES;
  return (await CATALOGS[locale]()).default;
}
