import { describe, expect, it } from "vitest";
import { safeNextPath } from "./login-next";

describe("safeNextPath", () => {
  it("keeps a path on this site, query included", () => {
    expect(safeNextPath("/recordings?upgrade=1")).toBe("/recordings?upgrade=1");
    expect(safeNextPath("/invite/abc")).toBe("/invite/abc");
  });

  it("falls back to the dashboard when there is none", () => {
    expect(safeNextPath(undefined)).toBe("/dashboard");
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath("")).toBe("/dashboard");
  });

  it("drops anything a browser would read as another site", () => {
    for (const next of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "evil.example",
      "javascript:alert(1)",
    ]) {
      expect(safeNextPath(next)).toBe("/dashboard");
    }
  });
});
