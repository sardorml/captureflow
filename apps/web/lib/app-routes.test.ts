import { describe, expect, it } from "vitest";
import { isAppRoute, isMarketingRoute } from "./app-routes";

describe("isAppRoute", () => {
  it("matches signed-in app pages and their children", () => {
    expect(isAppRoute("/recordings")).toBe(true);
    expect(isAppRoute("/dashboard")).toBe(true);
    expect(isAppRoute("/recordings/abc123")).toBe(true);
    expect(isAppRoute("/settings/account")).toBe(true);
    expect(isAppRoute("/api/search")).toBe(true);
    expect(isAppRoute("/members")).toBe(true);
    expect(isAppRoute("/billing")).toBe(true);
  });

  it("leaves unknown and public paths alone", () => {
    expect(isAppRoute("/")).toBe(false);
    expect(isAppRoute("/workspaces")).toBe(false);
    expect(isAppRoute("/storage")).toBe(false);
    expect(isAppRoute("/some/old/page")).toBe(false);
    expect(isAppRoute("/recordingsx")).toBe(false);
    expect(isAppRoute("/blog/loom-pricing")).toBe(false);
  });
});

describe("isMarketingRoute", () => {
  it("matches the landing and the prerendered marketing pages", () => {
    expect(isMarketingRoute("/")).toBe(true);
    expect(isMarketingRoute("/pricing")).toBe(true);
    expect(isMarketingRoute("/blog/some-post")).toBe(true);
    expect(isMarketingRoute("/suggest-feature")).toBe(true);
  });

  it("leaves app, share and unknown paths alone", () => {
    expect(isMarketingRoute("/recordings")).toBe(false);
    expect(isMarketingRoute("/r/abc123")).toBe(false);
    expect(isMarketingRoute("/login")).toBe(false);
    expect(isMarketingRoute("/pricingx")).toBe(false);
  });
});
