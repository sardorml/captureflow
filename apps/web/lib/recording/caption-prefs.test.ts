import { describe, expect, it } from "vitest";
import {
  DEFAULT_CAPTION_PREFS,
  hydrateCaptionPrefs,
  parseCaptionPrefs,
} from "./caption-prefs";

describe("caption prefs", () => {
  it("keeps known values and falls back field by field", () => {
    expect(hydrateCaptionPrefs({ size: "large", position: "top" })).toEqual({
      size: "large",
      position: "top",
    });
    expect(hydrateCaptionPrefs({ size: "huge", position: "middle" })).toEqual(
      DEFAULT_CAPTION_PREFS,
    );
    expect(hydrateCaptionPrefs(null)).toEqual(DEFAULT_CAPTION_PREFS);
    expect(parseCaptionPrefs('{"size":"small"}').size).toBe("small");
    expect(parseCaptionPrefs("{oops")).toEqual(DEFAULT_CAPTION_PREFS);
  });
});
