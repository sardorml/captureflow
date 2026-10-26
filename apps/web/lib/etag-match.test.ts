import { describe, expect, it } from "vitest";
import { etagFromIfNoneMatch } from "./etag-match";

describe("etagFromIfNoneMatch", () => {
  it("has nothing to compare without a header", () => {
    expect(etagFromIfNoneMatch(null)).toBe(undefined);
    expect(etagFromIfNoneMatch("")).toBe(undefined);
    expect(etagFromIfNoneMatch("*")).toBe(undefined);
  });

  it("strips the quotes R2 refuses", () => {
    expect(etagFromIfNoneMatch('"f891202a-1"')).toBe("f891202a-1");
  });

  it("drops the weak marker and takes the first of a list", () => {
    expect(etagFromIfNoneMatch('W/"abc", "def"')).toBe("abc");
  });
});
