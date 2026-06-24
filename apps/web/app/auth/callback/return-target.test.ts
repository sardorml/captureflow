import { describe, expect, it } from "vitest";
import { classifyReturn } from "./return-target";

describe("classifyReturn", () => {
  it("treats the configured custom scheme as a deep link", () => {
    expect(
      classifyReturn("captureflow://auth/callback", "captureflow"),
    ).toEqual({ kind: "deeplink", url: "captureflow://auth/callback" });
  });

  it("accepts an https chromiumapp.org return as the extension flow", () => {
    const url = "https://abcdefghijklmnop.chromiumapp.org/";
    expect(classifyReturn(url, "captureflow")).toEqual({
      kind: "extension",
      url,
    });
  });

  it("rejects non-https chromiumapp.org returns", () => {
    expect(
      classifyReturn("http://abc.chromiumapp.org/", "captureflow"),
    ).toEqual({ kind: "none" });
  });

  it("rejects hosts that only look like chromiumapp.org", () => {
    for (const raw of [
      "https://evilchromiumapp.org/",
      "https://chromiumapp.org.evil.com/",
      "https://chromiumapp.org/", // bare apex has no extension subdomain
    ]) {
      expect(classifyReturn(raw, "captureflow")).toEqual({ kind: "none" });
    }
  });

  it("rejects hostile schemes and arbitrary origins", () => {
    for (const raw of [
      "javascript:alert(1)",
      "http://evil.com/",
      "https://evil.com/",
      "data:text/html,hi",
      "not a url",
    ]) {
      expect(classifyReturn(raw, "captureflow")).toEqual({ kind: "none" });
    }
  });

  it("returns none for an absent or empty param", () => {
    expect(classifyReturn(undefined, "captureflow")).toEqual({ kind: "none" });
    expect(classifyReturn("", "captureflow")).toEqual({ kind: "none" });
  });
});
