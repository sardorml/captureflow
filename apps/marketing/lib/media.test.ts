import { describe, expect, it } from "vitest";
import {
  isMediaKind,
  kindFromFile,
  mimeForFile,
  outputName,
  slugFromOutput,
} from "./media.ts";

describe("outputName", () => {
  it("stamps the slug with local date and time and the kind's extension", () => {
    const at = new Date(2026, 9, 29, 7, 5, 9);
    expect(outputName("gif", "record-to-link", at)).toBe(
      "record-to-link-20261029-070509.gif",
    );
    expect(outputName("image", "og", at)).toBe("og-20261029-070509.png");
    expect(outputName("video", "promo", at)).toBe("promo-20261029-070509.mp4");
  });

  it("round-trips through slugFromOutput", () => {
    const name = outputName("gif", "a-b-2026", new Date(2026, 0, 1));
    expect(slugFromOutput(name)).toBe("a-b-2026");
    expect(slugFromOutput(`gifs/${name}`)).toBe("a-b-2026");
  });
});

describe("kindFromFile / mimeForFile", () => {
  it("maps extensions to kinds and types", () => {
    expect(kindFromFile("x.PNG")).toBe("image");
    expect(kindFromFile("x.gif")).toBe("gif");
    expect(kindFromFile("x.mp4")).toBe("video");
    expect(kindFromFile("x.txt")).toBeNull();
    expect(mimeForFile("x.mp4")).toBe("video/mp4");
    expect(mimeForFile("x.exe")).toBe("application/octet-stream");
  });
});

describe("isMediaKind", () => {
  it("accepts only the three kinds", () => {
    expect(isMediaKind("gif")).toBe(true);
    expect(isMediaKind("svg")).toBe(false);
    expect(isMediaKind(undefined)).toBe(false);
  });
});
