import { describe, expect, it } from "vitest";
import {
  EXTERNAL_AUTH_KIND,
  isTrustedAuthSender,
  parseExternalAuth,
} from "../lib/auth/handoff";
import { WEB_BASE } from "../lib/config";

const token = "a".repeat(64);

describe("parseExternalAuth", () => {
  it("accepts a well-formed auth message", () => {
    expect(
      parseExternalAuth({ kind: EXTERNAL_AUTH_KIND, token, id: "tok_1" }),
    ).toEqual({ token, tokenId: "tok_1" });
  });

  it("rejects the wrong message kind", () => {
    expect(parseExternalAuth({ kind: "other", token, id: "tok_1" })).toBeNull();
  });

  it("rejects a token under the 32-char minimum", () => {
    expect(
      parseExternalAuth({ kind: EXTERNAL_AUTH_KIND, token: "short", id: "t" }),
    ).toBeNull();
  });

  it("rejects a missing token id", () => {
    expect(
      parseExternalAuth({ kind: EXTERNAL_AUTH_KIND, token, id: "" }),
    ).toBeNull();
  });

  it("rejects non-object payloads", () => {
    for (const raw of [null, undefined, "str", 42, []]) {
      expect(parseExternalAuth(raw)).toBeNull();
    }
  });
});

describe("isTrustedAuthSender", () => {
  it("accepts the web app's callback page", () => {
    expect(isTrustedAuthSender(`${WEB_BASE}/auth/callback`)).toBe(true);
    expect(isTrustedAuthSender(`${WEB_BASE}/auth/callback?ext=abc`)).toBe(true);
  });

  it("rejects other paths on the trusted origin", () => {
    expect(isTrustedAuthSender(`${WEB_BASE}/`)).toBe(false);
    expect(isTrustedAuthSender(`${WEB_BASE}/auth/callback/evil`)).toBe(false);
  });

  it("rejects other origins and junk", () => {
    for (const raw of [
      "https://evil.com/auth/callback",
      "http://localhost:9999/auth/callback",
      undefined,
      "not a url",
    ]) {
      expect(isTrustedAuthSender(raw)).toBe(false);
    }
  });
});
