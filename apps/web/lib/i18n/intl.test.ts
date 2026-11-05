import { describe, expect, it } from "vitest";
import { formatDate, formatNumber, relativeTime } from "./intl";

const NOV_5 = Date.UTC(2026, 10, 5, 14, 5);
const UTC = { timeZone: "UTC" } as const;

describe("formatDate", () => {
  it("uses the app language", () => {
    const date = {
      day: "numeric",
      month: "long",
      year: "numeric",
      ...UTC,
    } as const;
    expect(formatDate(NOV_5, "de", date)).toBe("5. November 2026");
    expect(formatDate(NOV_5, "en", date, "en-GB")).toBe("5 November 2026");
  });

  it("writes Uzbek out itself", () => {
    expect(
      formatDate(NOV_5, "uz", {
        day: "numeric",
        month: "long",
        year: "numeric",
        ...UTC,
      }),
    ).toBe("5-noyabr, 2026");
    expect(
      formatDate(NOV_5, "uz", { day: "numeric", month: "short", ...UTC }),
    ).toBe("5-noy");
    expect(
      formatDate(NOV_5, "uz", { hour: "numeric", minute: "2-digit", ...UTC }),
    ).toBe("14:05");
    expect(
      formatDate(NOV_5, "uz", {
        dateStyle: "full",
        timeStyle: "short",
        ...UTC,
      }),
    ).toBe("payshanba, 5-noyabr, 2026, 14:05");
    expect(
      formatDate(NOV_5, "uz", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...UTC,
      }),
    ).toBe("05.11.2026");
  });
});

describe("formatNumber", () => {
  it("groups digits the way the language does", () => {
    expect(formatNumber(1234567.5, "de")).toBe("1.234.567,5");
    expect(formatNumber(1234567.5, "uz")).toBe("1 234 567,5");
    expect(formatNumber(12, "uz")).toBe("12");
  });
});

describe("relativeTime", () => {
  it("never prints a bare minus sign in the short style", () => {
    for (const lang of ["fr", "sv", "nb", "pt-PT"]) {
      expect(relativeTime(lang, "short")(-5, "minute")).not.toMatch(/^[-−]/);
    }
  });

  it("writes Uzbek out itself", () => {
    expect(relativeTime("uz", "long")(-5, "minute")).toBe("5 daqiqa oldin");
    expect(relativeTime("uz", "short")(-5, "minute")).toBe("5 daq. oldin");
    expect(relativeTime("uz", "long")(0, "second")).toBe("hozir");
    expect(relativeTime("uz", "long")(-1, "day")).toBe("kecha");
    expect(relativeTime("uz", "long")(-2, "week")).toBe("2 hafta oldin");
  });
});
