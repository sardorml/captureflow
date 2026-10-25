import { describe, expect, it } from "vitest";
import { isAppRoute } from "./app-routes";

describe("isAppRoute", () => {
  it("matches signed-in app pages and their children", () => {
    expect(isAppRoute("/recordings")).toBe(true);
    expect(isAppRoute("/recordings/abc123")).toBe(true);
    expect(isAppRoute("/settings/account")).toBe(true);
    expect(isAppRoute("/api/search")).toBe(true);
    expect(isAppRoute("/workspaces")).toBe(true);
    expect(isAppRoute("/storage")).toBe(true);
  });

  it("leaves unknown and public paths alone", () => {
    expect(isAppRoute("/")).toBe(false);
    expect(isAppRoute("/some/old/page")).toBe(false);
    expect(isAppRoute("/recordingsx")).toBe(false);
    expect(isAppRoute("/blog/loom-pricing")).toBe(false);
  });
});
