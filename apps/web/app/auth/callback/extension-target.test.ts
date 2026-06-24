import { describe, expect, it } from "vitest";
import { resolveExtensionTarget } from "./extension-target";

const VALID = "abcdefghijklmnopabcdefghijklmnop"; // 32 chars, a–p

describe("resolveExtensionTarget", () => {
  it("accepts a well-formed id when nothing is pinned", () => {
    expect(resolveExtensionTarget(VALID, null)).toBe(VALID);
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
      expect(resolveExtensionTarget(raw, null)).toBeNull();
    }
  });

  it("requires an exact match against the pinned id", () => {
    const other = "ponmlkjihgfedcbaponmlkjihgfedcba";
    expect(resolveExtensionTarget(VALID, VALID)).toBe(VALID);
    expect(resolveExtensionTarget(other, VALID)).toBeNull();
  });
});
