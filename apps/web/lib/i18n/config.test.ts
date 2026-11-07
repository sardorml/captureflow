import { describe, expect, it } from "vitest";
import {
  LOCALES,
  isLocalizedPath,
  languageAlternates,
  langOf,
  localizedHref,
  splitLocale,
} from "./config";

describe("splitLocale", () => {
  it("splits a leading language off the path", () => {
    expect(splitLocale("/de")).toEqual(["de", "/"]);
    expect(splitLocale("/de/pricing")).toEqual(["de", "/pricing"]);
    expect(splitLocale("/pt-br/faq")).toEqual(["pt-br", "/faq"]);
  });

  it("leaves English and unknown first segments alone", () => {
    expect(splitLocale("/")).toEqual([null, "/"]);
    expect(splitLocale("/pricing")).toEqual([null, "/pricing"]);
    expect(splitLocale("/en/pricing")).toEqual([null, "/en/pricing"]);
    expect(splitLocale("/deutsch")).toEqual([null, "/deutsch"]);
  });
});

describe("localizedHref", () => {
  it("prefixes translated pages", () => {
    expect(localizedHref("/", "fr")).toBe("/fr");
    expect(localizedHref("/pricing", "fr")).toBe("/fr/pricing");
    expect(localizedHref("/pricing#plans", "pt-br")).toBe(
      "/pt-br/pricing#plans",
    );
  });

  it("keeps English at the bare path", () => {
    expect(localizedHref("/", "en")).toBe("/");
    expect(localizedHref("/pricing", "en")).toBe("/pricing");
  });

  it("passes through pages that exist in English only", () => {
    expect(localizedHref("/blog", "de")).toBe("/blog");
    expect(localizedHref("/login?mode=signup", "de")).toBe(
      "/login?mode=signup",
    );
    expect(localizedHref("/privacy", "de")).toBe("/privacy");
    expect(localizedHref("#agents", "de")).toBe("#agents");
    expect(localizedHref("https://docs.captureflow.dev", "de")).toBe(
      "https://docs.captureflow.dev",
    );
  });
});

describe("isLocalizedPath", () => {
  it("knows which pages are translated", () => {
    expect(isLocalizedPath("/")).toBe(true);
    expect(isLocalizedPath("/self-host-setup")).toBe(true);
    expect(isLocalizedPath("/swarm-demo")).toBe(true);
    expect(isLocalizedPath("/blog/some-post")).toBe(false);
    expect(isLocalizedPath("/pricingx")).toBe(false);
  });
});

describe("languageAlternates", () => {
  it("lists every language once, with English as the default", () => {
    const alternates = languageAlternates("/pricing");
    expect(alternates.en).toBe("/pricing");
    expect(alternates["x-default"]).toBe("/pricing");
    expect(alternates["pt-BR"]).toBe("/pt-br/pricing");
    expect(alternates.nb).toBe("/no/pricing");
    expect(Object.keys(alternates)).toHaveLength(LOCALES.length + 2);
  });

  it("points each language's home at its bare prefix", () => {
    expect(languageAlternates("/").de).toBe("/de");
  });
});

describe("langOf", () => {
  it("maps a URL code to its language tag", () => {
    expect(langOf("no")).toBe("nb");
    expect(langOf("pt")).toBe("pt-PT");
    expect(langOf("en")).toBe("en");
  });
});
