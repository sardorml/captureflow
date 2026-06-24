import { describe, expect, it } from "vitest";
import { EXTERNAL_AUTH_KIND, parseExternalAuth } from "../lib/auth/handoff";

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
