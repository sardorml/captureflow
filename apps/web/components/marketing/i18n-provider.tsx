"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LANGUAGE_OPTIONS,
  langOf,
  localizedHref,
  splitLocale,
  type Locale,
} from "@/lib/i18n/config";
import { ENGLISH, type I18n } from "@/lib/i18n/english";
import { getMessages } from "@/lib/i18n/messages";
import { readLanguageChoice } from "@/lib/i18n/preference";
import type { Messages } from "@/lib/marketing/messages";

const I18nContext = createContext<I18n>(ENGLISH);

/*
 * A translated page passes the language and catalog its server component
 * loaded. A page that exists in English only (the blog, the legal pages)
 * passes nothing and is prerendered in English; its menu and footer then
 * switch to the language the visitor chose, once the page is running.
 */
export function I18nProvider({
  i18n,
  children,
}: {
  i18n?: I18n;
  children: ReactNode;
}) {
  const chosen = useChosenLanguage(i18n === undefined);
  return (
    <I18nContext.Provider value={i18n ?? chosen ?? ENGLISH}>
      {children}
    </I18nContext.Provider>
  );
}

function useChosenLanguage(enabled: boolean): I18n | null {
  const [chosen, setChosen] = useState<I18n | null>(null);
  useEffect(() => {
    const locale = enabled ? readLanguageChoice() : null;
    if (!locale || locale === DEFAULT_LOCALE) return;
    let current = true;
    void getMessages(locale).then((messages) => {
      if (current) setChosen({ locale, messages });
    });
    return () => {
      current = false;
    };
  }, [enabled]);
  return chosen;
}

export function useMessages(): Messages {
  return useContext(I18nContext).messages;
}

// The BCP 47 tag, for date and number formatting.
export function useLang(): string {
  return langOf(useContext(I18nContext).locale);
}

export function useLocalizedHref(): (href: string) => string {
  const { locale } = useContext(I18nContext);
  return (href: string) => localizedHref(href, locale);
}

export type LanguageOption = {
  code: Locale;
  label: string;
  lang: string;
  href: string;
  current: boolean;
};

// Each language's address for the page on screen. A page that exists in
// English only keeps its address; picking a language changes what surrounds it.
export function useLanguageOptions(): LanguageOption[] {
  const { locale } = useContext(I18nContext);
  const [, path] = splitLocale(usePathname());
  return LANGUAGE_OPTIONS.map(({ code, label }) => ({
    code,
    label,
    lang: langOf(code),
    href: localizedHref(path, code),
    current: code === locale,
  }));
}
