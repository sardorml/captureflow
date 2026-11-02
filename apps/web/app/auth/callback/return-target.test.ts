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

  it("accepts a loopback /callback on an explicit port", () => {
    for (const raw of [
      "http://127.0.0.1:53111/callback?state=abc",
      "http://[::1]:53111/callback",
      "http://localhost:4000/callback",
    ]) {
      expect(classifyReturn(raw, "captureflow")).toEqual({
        kind: "loopback",
        url: raw,
      });
    }
  });

  it("rejects loopback lookalikes", () => {
    for (const raw of [
      "https://127.0.0.1:53111/callback",
      "http://127.0.0.1/callback",
      "http://127.0.0.1:53111/other",
      "http://127.0.0.1.evil.com:53111/callback",
      "http://user@127.0.0.1:53111/callback",
      "http://10.0.0.5:53111/callback",
    ]) {
      expect(classifyReturn(raw, "captureflow")).toEqual({ kind: "none" });
    }
  });

  it("returns none for an absent or empty param", () => {
    expect(classifyReturn(undefined, "captureflow")).toEqual({ kind: "none" });
    expect(classifyReturn("", "captureflow")).toEqual({ kind: "none" });
  });
});
