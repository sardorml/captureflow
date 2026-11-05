import { DEFAULT_LOCALE, type Locale } from "./config";
import { formatNumber } from "./intl";

/*
 * Prices are set and charged in US dollars. A visitor reading another
 * language sees them converted to their language's currency at a daily rate,
 * rounded the way a price tag would be, with a note that the charge is in
 * dollars.
 */
export type Money = { currency: string; rate: number };

export const USD: Money = { currency: "USD", rate: 1 };

const CURRENCY: Record<Locale, string> = {
  en: "USD",
  de: "EUR",
  fr: "EUR",
  es: "EUR",
  "pt-br": "BRL",
  pt: "EUR",
  it: "EUR",
  pl: "PLN",
  sv: "SEK",
  fi: "EUR",
  no: "NOK",
  tr: "TRY",
  uz: "UZS",
  vi: "VND",
  th: "THB",
  ja: "JPY",
  ko: "KRW",
};

// Units per dollar on 2026-11-06, used until a live table is fetched or when
// it cannot be.
export const RATES_SNAPSHOT: Readonly<Record<string, number>> = {
  USD: 1,
  EUR: 0.89,
  BRL: 5.47,
  PLN: 3.91,
  SEK: 9.74,
  NOK: 9.29,
  TRY: 50.03,
  UZS: 11921,
  VND: 25701,
  THB: 33.64,
  JPY: 158.38,
  KRW: 1340.3,
};

export function currencyOf(locale: Locale): string {
  return CURRENCY[locale];
}

export function moneyFor(
  locale: Locale,
  rates: Readonly<Record<string, number>>,
): Money {
  const currency = currencyOf(locale);
  if (locale === DEFAULT_LOCALE) return USD;
  return { currency, rate: rates[currency] ?? RATES_SNAPSHOT[currency] ?? 1 };
}

// Only the currencies the site shows, each a finite positive number; the
// snapshot fills in anything the feed lacks.
export function hydrateRates(raw: unknown): Record<string, number> {
  const rates: Record<string, number> = { ...RATES_SNAPSHOT };
  if (!raw || typeof raw !== "object") return rates;
  for (const code of Object.keys(RATES_SNAPSHOT)) {
    const value = (raw as Record<string, unknown>)[code];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      rates[code] = value;
    }
  }
  return rates;
}

function minorDigits(currency: string): number {
  return (
    new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
}

/*
 * A converted amount is an estimate, so it is rounded like a price: whole
 * units from 100 up, tens from 1,000 and thousands from 100,000 for
 * currencies that count in large numbers.
 */
export function tidyAmount(amount: number, currency: string): number {
  if (minorDigits(currency) === 0 || amount >= 100) {
    const step = amount >= 100_000 ? 1000 : amount >= 1000 ? 10 : 1;
    return Math.round(amount / step) * step;
  }
  return Math.round(amount * 100) / 100;
}

export function formatMoney(usd: number, lang: string, money: Money): string {
  if (money.currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: Number.isInteger(usd) ? 0 : 2,
    }).format(usd);
  }
  const amount = tidyAmount(usd * money.rate, money.currency);
  if (/^uz\b/.test(lang)) {
    return `${formatNumber(amount, lang, { maximumFractionDigits: 0 })} soʻm`;
  }
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

// "South Korean Won" in the reader's language, or the code where the runtime
// has no name for it.
export function currencyName(lang: string, currency: string): string {
  if (/^uz\b/.test(lang) && currency === "UZS") return "soʻm";
  try {
    return (
      new Intl.DisplayNames(lang, { type: "currency" }).of(currency) ?? currency
    );
  } catch {
    return currency;
  }
}
