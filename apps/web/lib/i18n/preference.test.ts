import { describe, expect, it } from "vitest";
import {
  browserLocale,
  parseLanguageChoice,
  redirectLocale,
} from "./preference";

const BROWSER =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

const visit = (
  country: string | null,
  chosen: string | undefined = undefined,
  acceptLanguage: string | null = null,
) =>
  redirectLocale({
    chosen: parseLanguageChoice(chosen),
    acceptLanguage,
    country,
    userAgent: BROWSER,
  });

describe("redirectLocale", () => {
  it("sends a visitor to their country's language", () => {
    expect(visit("DE")).toBe("de");
    expect(visit("at")).toBe("de");
    expect(visit("BR")).toBe("pt-br");
    expect(visit("PT")).toBe("pt");
    expect(visit("MX")).toBe("es");
    expect(visit("UZ")).toBe("uz");
    expect(visit("JP")).toBe("ja");
    expect(visit("KR")).toBe("ko");
  });

  it("leaves English-speaking, mixed and unknown countries on English", () => {
    expect(visit("US")).toBeNull();
    expect(visit("CH")).toBeNull();
    expect(visit("XX")).toBeNull();
    expect(visit(null)).toBeNull();
  });

  it("puts the language a visitor picked ahead of their location", () => {
    expect(visit("DE", "en")).toBeNull();
    expect(visit("DE", "fr")).toBe("fr");
    expect(visit("US", "th")).toBe("th");
  });

  it("follows the browser's language ahead of the country", () => {
    expect(visit("PT", undefined, "en-US,en;q=0.9,pt;q=0.8")).toBeNull();
    expect(visit("US", undefined, "de-DE,de;q=0.9")).toBe("de");
    expect(visit("DE", undefined, "ru-RU,ru;q=0.9")).toBeNull();
    expect(visit("PT", "pt", "en-US")).toBe("pt");
  });

  it("ignores a cookie that names no language", () => {
    expect(visit("DE", "klingon")).toBe("de");
  });

  it("never moves a crawler or a request with no user agent", () => {
    const from = { chosen: null, acceptLanguage: "de-DE", country: "DE" };
    expect(redirectLocale({ ...from, userAgent: GOOGLEBOT })).toBeNull();
    expect(redirectLocale({ ...from, userAgent: null })).toBeNull();
  });
});

describe("browserLocale", () => {
  it("reads the language with the highest weight", () => {
    expect(browserLocale("fr;q=0.5, ja", null)).toBe("ja");
    expect(browserLocale("en-GB,en;q=0.9", "FR")).toBe("en");
    expect(browserLocale("nb-NO", null)).toBe("no");
  });

  it("tells the two Portugueses apart", () => {
    expect(browserLocale("pt-BR", "PT")).toBe("pt-br");
    expect(browserLocale("pt-PT", "BR")).toBe("pt");
    expect(browserLocale("pt", "BR")).toBe("pt-br");
    expect(browserLocale("pt", "PT")).toBe("pt");
  });

  it("leaves the decision to the country without a usable header", () => {
    expect(browserLocale(null, "DE")).toBeNull();
    expect(browserLocale("", "DE")).toBeNull();
    expect(browserLocale("*", "DE")).toBeNull();
  });
});
