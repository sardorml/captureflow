import { describe, expect, it } from "vitest";
import {
  PAGE_SIZE,
  hydratePageNumber,
  pageCount,
  pageItems,
  pageOffset,
} from "./pagination";

describe("hydratePageNumber", () => {
  it("falls back to the first page for anything but a positive integer", () => {
    for (const raw of [undefined, "", "0", "-1", "2.5", "abc", ["2"], 2]) {
      expect(hydratePageNumber(raw, 100)).toBe(1);
    }
  });

  it("clamps to the last page", () => {
    expect(hydratePageNumber("3", PAGE_SIZE * 2 + 1)).toBe(3);
    expect(hydratePageNumber("9", PAGE_SIZE * 2 + 1)).toBe(3);
    expect(hydratePageNumber("9", 0)).toBe(1);
  });
});

describe("pageCount and pageOffset", () => {
  it("always has at least one page and starts each at a multiple of the size", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(PAGE_SIZE)).toBe(1);
    expect(pageCount(PAGE_SIZE + 1)).toBe(2);
    expect(pageOffset(1)).toBe(0);
    expect(pageOffset(3)).toBe(PAGE_SIZE * 2);
  });
});

describe("pageItems", () => {
  it("lists short ranges in full", () => {
    expect(pageItems(2, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("keeps the ends and the current page's neighbours with gaps between", () => {
    expect(pageItems(1, 20)).toEqual([1, 2, 3, 4, "gap", 20]);
    expect(pageItems(10, 20)).toEqual([1, "gap", 9, 10, 11, "gap", 20]);
    expect(pageItems(20, 20)).toEqual([1, "gap", 17, 18, 19, 20]);
  });
});
