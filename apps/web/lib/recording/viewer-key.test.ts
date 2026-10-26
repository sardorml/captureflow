import { describe, expect, it } from "vitest";
import { viewerKeyFor } from "./viewer-key";

const headersOf = (map: Record<string, string>) => ({
  get: (name: string) => map[name.toLowerCase()] ?? null,
});

describe("viewerKeyFor", () => {
  it("keys a signed-in viewer by user id", async () => {
    expect(await viewerKeyFor("user-1", headersOf({}))).toBe("u:user-1");
  });

  it("keys an anonymous viewer by address and browser, stably", async () => {
    const headers = headersOf({
      "cf-connecting-ip": "203.0.113.9",
      "user-agent": "Browser/1.0",
    });
    const key = await viewerKeyFor(null, headers);
    expect(key).toMatch(/^a:[0-9a-f]{16}$/);
    expect(await viewerKeyFor(null, headers)).toBe(key);
    expect(key).not.toContain("203.0.113.9");
  });

  it("tells anonymous viewers apart by address or browser", async () => {
    const a = await viewerKeyFor(
      null,
      headersOf({ "cf-connecting-ip": "203.0.113.9", "user-agent": "A" }),
    );
    const b = await viewerKeyFor(
      null,
      headersOf({ "cf-connecting-ip": "203.0.113.9", "user-agent": "B" }),
    );
    const c = await viewerKeyFor(
      null,
      headersOf({ "cf-connecting-ip": "203.0.113.10", "user-agent": "A" }),
    );
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it("falls back to the first forwarded address", async () => {
    const direct = await viewerKeyFor(
      null,
      headersOf({ "cf-connecting-ip": "203.0.113.9", "user-agent": "A" }),
    );
    const forwarded = await viewerKeyFor(
      null,
      headersOf({
        "x-forwarded-for": "203.0.113.9, 10.0.0.1",
        "user-agent": "A",
      }),
    );
    expect(forwarded).toBe(direct);
  });
});
