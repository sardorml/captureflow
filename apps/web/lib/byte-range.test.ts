import { describe, expect, it } from "vitest";
import { parseByteRange, resolveByteRange } from "./byte-range";

describe("parseByteRange", () => {
  it("serves the whole object without a header", () => {
    expect(parseByteRange(null)).toBe(undefined);
  });

  it("ignores headers it doesn't understand", () => {
    expect(parseByteRange("items=0-5")).toBe(undefined);
    expect(parseByteRange("bytes=0-5,10-20")).toBe(undefined);
  });

  it("reads a closed range", () => {
    expect(parseByteRange("bytes=0-1")).toEqual({ offset: 0, length: 2 });
    expect(parseByteRange("bytes=100-199")).toEqual({
      offset: 100,
      length: 100,
    });
  });

  it("reads an open-ended range", () => {
    expect(parseByteRange("bytes=500-")).toEqual({ offset: 500 });
  });

  it("reads a suffix range as the last n bytes", () => {
    expect(parseByteRange("bytes=-500")).toEqual({ suffix: 500 });
  });

  it("refuses a backwards or empty range", () => {
    expect(parseByteRange("bytes=10-5")).toBe(null);
    expect(parseByteRange("bytes=-0")).toBe(null);
    expect(parseByteRange("bytes=-")).toBe(null);
  });
});

describe("resolveByteRange", () => {
  it("clamps a range that runs past the end", () => {
    expect(resolveByteRange({ offset: 90, length: 50 }, 100)).toEqual({
      start: 90,
      end: 99,
    });
  });

  it("runs an open range to the last byte", () => {
    expect(resolveByteRange({ offset: 10 }, 100)).toEqual({
      start: 10,
      end: 99,
    });
  });

  it("takes a suffix from the end, or the whole object if longer", () => {
    expect(resolveByteRange({ suffix: 30 }, 100)).toEqual({
      start: 70,
      end: 99,
    });
    expect(resolveByteRange({ suffix: 500 }, 100)).toEqual({
      start: 0,
      end: 99,
    });
  });

  it("can't satisfy a start at or past the end", () => {
    expect(resolveByteRange({ offset: 100 }, 100)).toBe(null);
    expect(resolveByteRange({ suffix: 5 }, 0)).toBe(null);
  });
});
