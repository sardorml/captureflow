import { describe, expect, it } from "vitest";
import { aacBitrateCandidates } from "./aac-bitrate";

describe("aacBitrateCandidates", () => {
  it("tries the requested rate first, then each higher step", () => {
    expect(aacBitrateCandidates(48_000)).toEqual([
      48_000, 64_000, 96_000, 128_000,
    ]);
  });

  it("skips steps at or below the requested rate", () => {
    expect(aacBitrateCandidates(96_000)).toEqual([96_000, 128_000]);
    expect(aacBitrateCandidates(128_000)).toEqual([128_000]);
  });

  it("keeps a rate above every step on its own", () => {
    expect(aacBitrateCandidates(192_000)).toEqual([192_000]);
  });
});
