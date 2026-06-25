import { describe, expect, it } from "vitest";
import { corsHeaders } from "./cors";

describe("corsHeaders", () => {
  it("allows the headers cross-origin clients send", () => {
    const allowed = corsHeaders()["access-control-allow-headers"] ?? "";
    const headers = allowed.split(",").map((h) => h.trim().toLowerCase());
    // Authorization is required for browser-extension clients: they call
    // /api/r/* from a chrome-extension:// origin with a Bearer token, so the
    // CORS preflight will fail unless it's listed here.
    expect(headers).toContain("authorization");
    expect(headers).toContain("content-type");
    expect(headers).toContain("x-captureflow-device");
  });
});
