import { describe, expect, it } from "vitest";
import {
  createToken,
  hashToken,
  hashPassword,
  issueSession,
  verifyPassword,
  verifySession,
  verifySetupToken,
} from "./auth";

const SECRET = "test-secret";
const ADMIN_ID = "a1b2c3";

describe("hashPassword / verifyPassword", () => {
  it("round-trips a password", async () => {
    const stored = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", stored)).toBe(
      true,
    );
  });

  it("rejects a wrong password", async () => {
    const stored = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery stapl", stored)).toBe(
      false,
    );
  });

  it("salts, so the same password hashes differently every time", async () => {
    const [a, b] = await Promise.all([
      hashPassword("same-password"),
      hashPassword("same-password"),
    ]);
    expect(a).not.toBe(b);
  });

  it("rejects a missing or malformed hash rather than throwing", async () => {
    for (const bad of ["", "plaintext", "pbkdf2$sha256$0$a$b", "a$b$c$d$e"]) {
      expect(await verifyPassword("anything", bad)).toBe(false);
    }
    expect(await verifyPassword("anything", undefined)).toBe(false);
  });
});

describe("verifySetupToken", () => {
  it("accepts the configured token and rejects everything else", async () => {
    expect(await verifySetupToken("tok", "tok")).toBe(true);
    expect(await verifySetupToken("tuk", "tok")).toBe(false);
  });

  it("tolerates whitespace around a pasted token", async () => {
    expect(await verifySetupToken("  tok\n", "tok")).toBe(true);
    expect(await verifySetupToken("tok", " tok ")).toBe(true);
  });

  it("refuses when the deployment has no token set", async () => {
    expect(await verifySetupToken("", undefined)).toBe(false);
    expect(await verifySetupToken("anything", undefined)).toBe(false);
    expect(await verifySetupToken("   ", "   ")).toBe(false);
  });
});

describe("session cookie", () => {
  it("round-trips the admin id", async () => {
    const token = await issueSession(SECRET, ADMIN_ID, 3600);
    expect(await verifySession(SECRET, token)).toBe(ADMIN_ID);
  });

  it("round-trips a uuid id, which contains dashes", async () => {
    const id = "0b3c1e5a-8f2d-4a11-9c77-1d2e3f4a5b6c";
    const token = await issueSession(SECRET, id, 3600);
    expect(await verifySession(SECRET, token)).toBe(id);
  });

  it("rejects a session signed with a different secret", async () => {
    const token = await issueSession(SECRET, ADMIN_ID, 3600);
    expect(await verifySession("other-secret", token)).toBeNull();
  });

  it("rejects an expired session", async () => {
    const token = await issueSession(SECRET, ADMIN_ID, -1);
    expect(await verifySession(SECRET, token)).toBeNull();
  });

  it("rejects a tampered expiry, even though it is plaintext", async () => {
    const token = await issueSession(SECRET, ADMIN_ID, 1);
    const sig = token.slice(token.lastIndexOf(".") + 1);
    const forged = `${ADMIN_ID}.${Date.now() + 10_000_000}.${sig}`;
    expect(await verifySession(SECRET, forged)).toBeNull();
  });

  it("rejects a swapped admin id under a valid signature", async () => {
    const token = await issueSession(SECRET, ADMIN_ID, 3600);
    const rest = token.slice(token.indexOf(".") + 1);
    expect(await verifySession(SECRET, `someone-else.${rest}`)).toBeNull();
  });

  it("rejects junk and missing cookies", async () => {
    for (const bad of ["", "abc", "abc.def", ".", "123.", "a.b.c"]) {
      expect(await verifySession(SECRET, bad)).toBeNull();
    }
    expect(await verifySession(SECRET, undefined)).toBeNull();
    expect(await verifySession(undefined, "anything")).toBeNull();
  });
});

describe("invite tokens", () => {
  it("mints url-safe tokens that differ every time", async () => {
    const a = createToken();
    const b = createToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{16,128}$/);
  });

  it("hashes deterministically, so the raw token is never stored", async () => {
    const token = createToken();
    expect(await hashToken(token)).toBe(await hashToken(token));
    expect(await hashToken(token)).not.toBe(token);
    expect(await hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });
});
