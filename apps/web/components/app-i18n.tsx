import type { ReactNode } from "react";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getAppI18n } from "@/lib/i18n/app/server";
import { getMessages } from "@/lib/i18n/messages";
import { AppI18nProvider } from "./app-i18n-provider";
import { HtmlLang } from "./html-lang";

// Wraps a signed-in or sign-in page in the request's language. English is
// already in the client bundle, so only another language is sent down.
export async function AppI18n({ children }: { children: ReactNode }) {
  const i18n = await getAppI18n();
  if (i18n.locale === DEFAULT_LOCALE) {
    return <AppI18nProvider>{children}</AppI18nProvider>;
  }
  const { plans } = (await getMessages(i18n.locale)).pricing;
  return (
    <AppI18nProvider i18n={{ ...i18n, plans }}>
      <HtmlLang lang={i18n.lang} />
      {children}
    </AppI18nProvider>
  );
}
