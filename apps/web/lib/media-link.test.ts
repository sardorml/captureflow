import { describe, expect, it } from "vitest";
import { MEDIA_LINK_TTL_MS, openMediaLink, sealMediaLink } from "./media-link";

const SECRET = "test-secret-at-least-32-characters-long";
const KEY = "videos/3f9c2a7be1d04c6a9b8e5f1d2c3b4a59.mp4";
const NOW = 1_800_000_000_000;

describe("media links", () => {
  it("opens to the sealed storage key", async () => {
    const token = await sealMediaLink(SECRET, KEY, NOW);
    expect(await openMediaLink(SECRET, token, NOW + 1000)).toBe(KEY);
  });

  it("never carries the storage key in the clear", async () => {
    const token = await sealMediaLink(SECRET, KEY, NOW);
    expect(token).not.toContain("videos");
    expect(token).not.toContain("3f9c2a7b");
    expect(atob(token.replace(/-/g, "+").replace(/_/g, "/"))).not.toContain(
      "3f9c2a7b",
    );
  });

  it("is URL-safe", async () => {
    const token = await sealMediaLink(SECRET, KEY, NOW);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("differs every time, even for the same key", async () => {
    const a = await sealMediaLink(SECRET, KEY, NOW);
    const b = await sealMediaLink(SECRET, KEY, NOW);
    expect(a).not.toBe(b);
  });

  it("stops working once it expires", async () => {
    const token = await sealMediaLink(SECRET, KEY, NOW);
    expect(
      await openMediaLink(SECRET, token, NOW + MEDIA_LINK_TTL_MS - 1),
    ).toBe(KEY);
    expect(await openMediaLink(SECRET, token, NOW + MEDIA_LINK_TTL_MS)).toBe(
      null,
    );
  });

  it("rejects a link sealed with another secret", async () => {
    const token = await sealMediaLink(
      "another-secret-of-similar-length!!",
      KEY,
    );
    expect(await openMediaLink(SECRET, token)).toBe(null);
  });

  it("rejects a link with any byte changed", async () => {
    const token = await sealMediaLink(SECRET, KEY, NOW);
    for (const i of [0, 5, 20, token.length - 2]) {
      const flipped =
        token.slice(0, i) + (token[i] === "A" ? "B" : "A") + token.slice(i + 1);
      expect(await openMediaLink(SECRET, flipped, NOW)).toBe(null);
    }
  });

  it("rejects truncated and malformed links", async () => {
    const token = await sealMediaLink(SECRET, KEY, NOW);
    for (const bad of [
      "",
      "abc",
      token.slice(0, 16),
      token.slice(0, -4),
      "not/base64+url=",
      "videos%2Fx.mp4",
      "../../etc/passwd",
    ]) {
      expect(await openMediaLink(SECRET, bad, NOW)).toBe(null);
    }
  });
});
