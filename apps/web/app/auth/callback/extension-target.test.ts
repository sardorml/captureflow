import { describe, expect, it } from "vitest";
import { resolveExtensionTarget } from "./extension-target";

const VALID = "abcdefghijklmnopabcdefghijklmnop"; // 32 chars, a–p

const OTHER = "ponmlkjihgfedcbaponmlkjihgfedcba";

describe("resolveExtensionTarget", () => {
  it("accepts a well-formed id in dev", () => {
    expect(resolveExtensionTarget(VALID, null, false)).toBe(VALID);
  });

  /*
   * The pin is a production-shipped id living in wrangler vars that dev shares,
   * so enforcing it in dev would refuse every unpacked build — the failure that
   * broke the extension sign-in handoff on localhost.
   */
  it("ignores the pin in dev, so an unpacked id still signs in", () => {
    expect(resolveExtensionTarget(OTHER, VALID, false)).toBe(OTHER);
  });

  it("fails closed in production when no pin is configured", () => {
    expect(resolveExtensionTarget(VALID, null, true)).toBeNull();
  });

  it("requires an exact match against the pin in production", () => {
    expect(resolveExtensionTarget(VALID, VALID, true)).toBe(VALID);
    expect(resolveExtensionTarget(OTHER, VALID, true)).toBeNull();
  });

  it("rejects malformed ids either way", () => {
    for (const raw of [
      undefined,
      "",
      "tooshort",
      VALID.toUpperCase(), // out of the a–p range
      VALID + "a", // 33 chars
      "abcdefghijklmnopabcdefghijklmnoz", // 'z' is past 'p'
    ]) {
      expect(resolveExtensionTarget(raw, null, false)).toBeNull();
      expect(resolveExtensionTarget(raw, VALID, true)).toBeNull();
    }
  });
});
