import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { HtmlLang } from "@/components/html-lang";
import { isLocaleCode, langOf } from "@/lib/i18n/config";
import { localeStaticParams } from "@/lib/i18n/route";

// Only the listed languages exist, each prerendered; any other first segment
// is a 404 rather than a page rendered on demand.
export const dynamicParams = false;
export const generateStaticParams = localeStaticParams;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocaleCode(locale)) notFound();
  return (
    <>
      <HtmlLang lang={langOf(locale)} />
      {children}
    </>
  );
}
