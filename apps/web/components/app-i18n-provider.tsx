"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LANG, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { APP_MESSAGES, type AppMessages } from "@/lib/i18n/app/messages";
import { currencyName, formatMoney, USD, type Money } from "@/lib/i18n/money";
import { MESSAGES, type Messages } from "@/lib/marketing/messages";

type PlanCopy = Messages["pricing"]["plans"];

export type AppI18nValue = {
  locale: Locale;
  lang: string;
  messages: AppMessages;
  plans: PlanCopy;
  money: Money;
};

const ENGLISH: AppI18nValue = {
  locale: DEFAULT_LOCALE,
  lang: DEFAULT_LANG,
  messages: APP_MESSAGES,
  plans: MESSAGES.pricing.plans,
  money: USD,
};

const AppI18nContext = createContext<AppI18nValue>(ENGLISH);

// English is bundled, so only another language is handed in from the server.
export function AppI18nProvider({
  i18n = ENGLISH,
  children,
}: {
  i18n?: AppI18nValue;
  children: ReactNode;
}) {
  return (
    <AppI18nContext.Provider value={i18n}>{children}</AppI18nContext.Provider>
  );
}

export function useAppMessages(): AppMessages {
  return useContext(AppI18nContext).messages;
}

// `lang` is the BCP 47 tag, for Intl formatters and plural().
export function useAppLocale(): { locale: Locale; lang: string } {
  const { locale, lang } = useContext(AppI18nContext);
  return { locale, lang };
}

/*
 * Prices in the reader's currency: `format` takes dollars, `note` is the
 * "shown in won, charged in dollars" line for a view that lists prices and
 * `charged` the short form for one price; both null when the reader pays in
 * dollars anyway.
 */
export function useMoney(): {
  format: (usd: number) => string;
  note: string | null;
  charged: string | null;
} {
  const { lang, messages, money } = useContext(AppI18nContext);
  const converted = money.currency !== "USD";
  return {
    format: (usd) => formatMoney(usd, lang, money),
    charged: converted ? messages.billing.chargedInUsd : null,
    note: !converted
      ? null
      : messages.billing.shownIn.replace(
          "{currency}",
          currencyName(lang, money.currency),
        ),
  };
}

// Plan names and feature lists, shared with the public pricing page.
export function usePlanCopy(): PlanCopy {
  return useContext(AppI18nContext).plans;
}
