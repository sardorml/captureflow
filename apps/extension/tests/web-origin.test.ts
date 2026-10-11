import { describe, expect, it } from "vitest";
import { webOriginMatches } from "../lib/web-origin";

describe("webOriginMatches", () => {
  it("trusts only production in a store build", () => {
    expect(webOriginMatches(undefined, false)).toEqual([
      "https://captureflow.dev/*",
    ]);
  });

  it("adds localhost in dev", () => {
    expect(webOriginMatches(undefined, true)).toEqual([
      "https://captureflow.dev/*",
      "http://localhost/*",
    ]);
  });

  it("trusts a self-hosted backend instead of production", () => {
    expect(webOriginMatches("https://rec.acme.com/", false)).toEqual([
      "https://rec.acme.com/*",
    ]);
  });

  it("drops the port, which match patterns can't carry", () => {
    expect(webOriginMatches("http://localhost:3032", true)).toEqual([
      "http://localhost/*",
    ]);
  });
});
