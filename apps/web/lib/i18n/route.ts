import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, isLocaleCode } from "./config";
import type { I18n } from "./english";
import { getMessages } from "./messages";
import { pageMetadata, type MarketingPageId } from "./metadata";

export type LocaleParams = { params: Promise<{ locale: string }> };

export function localeStaticParams(): { locale: string }[] {
  return LOCALES.map((l) => ({ locale: l.code }));
}

// The language and catalog for a page under app/[locale]; 404 for anything else.
export async function resolveI18n({ params }: LocaleParams): Promise<I18n> {
  const { locale } = await params;
  if (!isLocaleCode(locale)) notFound();
  return { locale, messages: await getMessages(locale) };
}

export function localizedMetadata(page: MarketingPageId) {
  return async (props: LocaleParams): Promise<Metadata> => {
    const { locale, messages } = await resolveI18n(props);
    return pageMetadata(page, locale, messages);
  };
}
