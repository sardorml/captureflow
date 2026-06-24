import { describe, expect, it } from "vitest";
import { pickScreenMimeType } from "../lib/capture/pick-mime-type";

describe("pickScreenMimeType", () => {
  it("prefers MP4/H.264 when the platform supports it", () => {
    const result = pickScreenMimeType(() => true);
    expect(result.contentType).toBe("video/mp4");
    expect(result.mimeType).toContain("avc1");
  });

  it("falls back to WebM when MP4 is unsupported", () => {
    const result = pickScreenMimeType((type) => type.startsWith("video/webm"));
    expect(result.contentType).toBe("video/webm");
    expect(result.mimeType).toContain("vp9");
  });

  it("falls back to VP8 when VP9 is unavailable", () => {
    const result = pickScreenMimeType((type) => type.includes("vp8"));
    expect(result.mimeType).toContain("vp8");
  });

  it("returns an empty mimeType (browser default) when nothing is supported", () => {
    const result = pickScreenMimeType(() => false);
    expect(result.mimeType).toBe("");
    expect(result.contentType).toBe("video/webm");
  });
});
