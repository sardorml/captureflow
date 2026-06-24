import { describe, expect, it } from "vitest";
import { resolveExtensionTarget } from "./extension-target";

const VALID = "abcdefghijklmnopabcdefghijklmnop"; // 32 chars, a–p

describe("resolveExtensionTarget", () => {
  it("accepts a well-formed id when unpinned is allowed (dev)", () => {
    expect(resolveExtensionTarget(VALID, null, true)).toBe(VALID);
  });

  it("fails closed for an unpinned id when unpinned is not allowed (prod)", () => {
    expect(resolveExtensionTarget(VALID, null, false)).toBeNull();
  });

  it("rejects malformed ids", () => {
    for (const raw of [
      undefined,
      "",
      "tooshort",
      VALID.toUpperCase(), // out of the a–p range
      VALID + "a", // 33 chars
      "abcdefghijklmnopabcdefghijklmnoz", // 'z' is past 'p'
    ]) {
      expect(resolveExtensionTarget(raw, null, true)).toBeNull();
    }
  });

  it("requires an exact match against the pinned id, ignoring allowUnpinned", () => {
    const other = "ponmlkjihgfedcbaponmlkjihgfedcba";
    expect(resolveExtensionTarget(VALID, VALID, false)).toBe(VALID);
    expect(resolveExtensionTarget(other, VALID, true)).toBeNull();
  });
});
