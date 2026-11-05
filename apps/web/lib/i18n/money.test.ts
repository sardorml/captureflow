import { describe, expect, it } from "vitest";
import {
  currencyName,
  formatMoney,
  hydrateRates,
  moneyFor,
  RATES_SNAPSHOT,
  tidyAmount,
  USD,
} from "./money";

describe("formatMoney", () => {
  it("keeps dollars as they were", () => {
    expect(formatMoney(5, "en", USD)).toBe("$5");
    expect(formatMoney(4.5, "en", USD)).toBe("$4.50");
    expect(formatMoney(1234, "en", USD)).toBe("$1,234");
    expect(formatMoney(0, "en", USD)).toBe("$0");
  });

  it("converts at the rate and rounds like a price", () => {
    expect(formatMoney(5, "ko", { currency: "KRW", rate: 1340.3 })).toBe(
      "₩6,700",
    );
    expect(formatMoney(5, "ja", { currency: "JPY", rate: 158.38 })).toBe(
      "￥792",
    );
    expect(formatMoney(5, "de", { currency: "EUR", rate: 0.89 })).toBe(
      "4,45 €",
    );
    expect(formatMoney(240, "de", { currency: "EUR", rate: 0.89 })).toBe(
      "214 €",
    );
    expect(formatMoney(5, "vi", { currency: "VND", rate: 25701 })).toBe(
      "129.000 ₫",
    );
  });

  it("writes Uzbek out itself", () => {
    expect(formatMoney(5, "uz", { currency: "UZS", rate: 11921 })).toBe(
      "59 610 soʻm",
    );
  });
});

describe("tidyAmount", () => {
  it("rounds by size", () => {
    expect(tidyAmount(4.449, "EUR")).toBe(4.45);
    expect(tidyAmount(213.6, "EUR")).toBe(214);
    expect(tidyAmount(792.4, "JPY")).toBe(792);
    expect(tidyAmount(6701.5, "KRW")).toBe(6700);
    expect(tidyAmount(128_507, "VND")).toBe(129_000);
  });
});

describe("moneyFor", () => {
  it("is dollars for English and the language's currency otherwise", () => {
    expect(moneyFor("en", { USD: 1, KRW: 2 })).toEqual(USD);
    expect(moneyFor("ko", { KRW: 1300 })).toEqual({
      currency: "KRW",
      rate: 1300,
    });
    expect(moneyFor("ja", {})).toEqual({
      currency: "JPY",
      rate: RATES_SNAPSHOT.JPY,
    });
  });
});

describe("hydrateRates", () => {
  it("takes only sane numbers for the currencies shown", () => {
    const rates = hydrateRates({ KRW: 1300, JPY: "x", EUR: -1, XXX: 5 });
    expect(rates.KRW).toBe(1300);
    expect(rates.JPY).toBe(RATES_SNAPSHOT.JPY);
    expect(rates.EUR).toBe(RATES_SNAPSHOT.EUR);
    expect(rates).not.toHaveProperty("XXX");
    expect(hydrateRates(null)).toEqual(RATES_SNAPSHOT);
  });
});

describe("currencyName", () => {
  it("names the currency in the reader's language", () => {
    expect(currencyName("en", "KRW")).toBe("South Korean Won");
    expect(currencyName("uz", "UZS")).toBe("soʻm");
  });
});
