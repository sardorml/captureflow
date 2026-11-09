import { describe, expect, it } from "vitest";
import { canAdoptWebSession } from "@/lib/auth/session";

describe("canAdoptWebSession", () => {
  it("takes the website's account when the extension has none", () => {
    expect(
      canAdoptWebSession({ hasSession: false, optedOut: false, reason: null }),
    ).toBe(true);
    expect(
      canAdoptWebSession({
        hasSession: false,
        optedOut: false,
        reason: "other-user",
      }),
    ).toBe(true);
  });

  it("keeps a token it already holds", () => {
    expect(
      canAdoptWebSession({ hasSession: true, optedOut: false, reason: null }),
    ).toBe(false);
  });

  it("stays signed out after the user signed it out or the token was revoked", () => {
    expect(
      canAdoptWebSession({ hasSession: false, optedOut: true, reason: null }),
    ).toBe(false);
    expect(
      canAdoptWebSession({
        hasSession: false,
        optedOut: false,
        reason: "revoked",
      }),
    ).toBe(false);
  });
});
