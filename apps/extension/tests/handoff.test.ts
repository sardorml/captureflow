import { describe, expect, it } from "vitest";
import {
  EXTERNAL_AUTH_KIND,
  EXTERNAL_LOGOUT_KIND,
  isTrustedAuthSender,
  isTrustedWebOrigin,
  parseExternalMessage,
} from "../lib/auth/handoff";
import { WEB_BASE } from "../lib/config";

const token = "a".repeat(64);

describe("parseExternalMessage", () => {
  it("parses a well-formed auth message", () => {
    expect(
      parseExternalMessage({ kind: EXTERNAL_AUTH_KIND, token, id: "tok_1" }),
    ).toEqual({ kind: "auth", session: { token, tokenId: "tok_1" } });
  });

  it("parses a logout message", () => {
    expect(parseExternalMessage({ kind: EXTERNAL_LOGOUT_KIND })).toEqual({
      kind: "logout",
    });
  });

  it("rejects an unknown message kind", () => {
    expect(
      parseExternalMessage({ kind: "other", token, id: "tok_1" }),
    ).toBeNull();
  });

  it("rejects an auth token under the 32-char minimum", () => {
    expect(
      parseExternalMessage({
        kind: EXTERNAL_AUTH_KIND,
        token: "short",
        id: "t",
      }),
    ).toBeNull();
  });

  it("rejects an auth message with no token id", () => {
    expect(
      parseExternalMessage({ kind: EXTERNAL_AUTH_KIND, token, id: "" }),
    ).toBeNull();
  });

  it("rejects non-object payloads", () => {
    for (const raw of [null, undefined, "str", 42, []]) {
      expect(parseExternalMessage(raw)).toBeNull();
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

describe("isTrustedWebOrigin", () => {
  it("accepts any path on the web origin", () => {
    expect(isTrustedWebOrigin(`${WEB_BASE}/`)).toBe(true);
    expect(isTrustedWebOrigin(`${WEB_BASE}/dashboard`)).toBe(true);
  });

  it("rejects other origins and junk", () => {
    for (const raw of [
      "https://evil.com/",
      "http://localhost:9999/",
      undefined,
      "not a url",
    ]) {
      expect(isTrustedWebOrigin(raw)).toBe(false);
    }
  });
});
