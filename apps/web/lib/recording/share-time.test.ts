import { describe, expect, it } from "vitest";
import { hydrateStartSeconds, shareUrlAt } from "./share-time";

describe("hydrateStartSeconds", () => {
  it("reads whole and fractional seconds", () => {
    expect(hydrateStartSeconds("12")).toBe(12);
    expect(hydrateStartSeconds("2.5")).toBe(2.5);
  });

  it("drops zero, negatives, text, arrays and absurd values", () => {
    expect(hydrateStartSeconds("0")).toBeNull();
    expect(hydrateStartSeconds("-3")).toBeNull();
    expect(hydrateStartSeconds("1m")).toBeNull();
    expect(hydrateStartSeconds(["4"])).toBeNull();
    expect(hydrateStartSeconds(undefined)).toBeNull();
    expect(hydrateStartSeconds(String(25 * 3600))).toBeNull();
  });
});

describe("shareUrlAt", () => {
  it("adds whole seconds as t", () => {
    expect(shareUrlAt("https://example.com/r/abc", 72.9)).toBe(
      "https://example.com/r/abc?t=72",
    );
  });

  it("replaces an existing t and keeps other params", () => {
    expect(shareUrlAt("https://example.com/r/abc?x=1&t=5", 9)).toBe(
      "https://example.com/r/abc?x=1&t=9",
    );
  });

  it("leaves the link alone under one second", () => {
    expect(shareUrlAt("https://example.com/r/abc", 0.4)).toBe(
      "https://example.com/r/abc",
    );
  });
});
