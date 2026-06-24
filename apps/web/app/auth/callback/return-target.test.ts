import { describe, expect, it } from "vitest";
import { classifyReturn } from "./return-target";

describe("classifyReturn", () => {
  it("treats the configured custom scheme as a deep link", () => {
    expect(
      classifyReturn("captureflow://auth/callback", "captureflow"),
    ).toEqual({ kind: "deeplink", url: "captureflow://auth/callback" });
  });

  it("rejects hostile schemes and arbitrary origins", () => {
    for (const raw of [
      "javascript:alert(1)",
      "http://evil.com/",
      "https://evil.com/",
      "https://abc.chromiumapp.org/", // not a return shape anymore
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
