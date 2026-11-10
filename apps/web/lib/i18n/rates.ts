import { cache } from "react";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { hydrateRates, moneyFor, USD, type Money } from "./money";

const RATES_URL = "https://open.er-api.com/v6/latest/USD";

// A translated page prerenders with the rates of its build and must never
// expire: the deployed page cache is read-only, so a stale page cannot be
// rebuilt and fails. The snapshot stands in when the feed is down or slow.
async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch(RATES_URL, {
      cache: "force-cache",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const body = (await res.json()) as { rates?: unknown };
    return hydrateRates(body.rates);
  } catch (err) {
    console.warn("[money] using the rates snapshot:", err);
    return hydrateRates(null);
  }
}

export const loadMoney = cache(async (locale: Locale): Promise<Money> => {
  if (locale === DEFAULT_LOCALE) return USD;
  return moneyFor(locale, await fetchRates());
});
