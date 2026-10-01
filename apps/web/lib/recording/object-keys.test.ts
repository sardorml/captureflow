import { describe, expect, it } from "vitest";
import { objectKeysFor, summaryChaptersKeyFor } from "./object-keys";
import { screenshotObjectKeysFor } from "../screenshot-keys";

const full = {
  storageKey: "videos/abc12345.mp4",
  posterKey: "posters/abc12345.jpg",
  webcamStorageKey: "videos/abc12345-webcam.webm",
};

describe("objectKeysFor", () => {
  it("covers every object a recording owns", () => {
    expect(objectKeysFor(full)).toEqual([
      "videos/abc12345.mp4",
      "posters/abc12345.jpg",
      "videos/abc12345-webcam.webm",
      "videos/abc12345.config.json",
      "videos/abc12345.mp4.summary-chapters.json",
    ]);
  });

  it("drops absent poster and webcam but keeps the sidecars", () => {
    expect(
      objectKeysFor({ ...full, posterKey: null, webcamStorageKey: null }),
    ).toEqual([
      "videos/abc12345.mp4",
      "videos/abc12345.config.json",
      "videos/abc12345.mp4.summary-chapters.json",
    ]);
  });

  it("keys a webm recording off its own extension", () => {
    const keys = objectKeysFor({
      storageKey: "videos/abc12345.webm",
      posterKey: null,
      webcamStorageKey: null,
    });
    expect(keys).toContain("videos/abc12345.webm.config.json");
    expect(keys).toContain("videos/abc12345.webm.summary-chapters.json");
  });

  it("never returns a null key", () => {
    for (const key of objectKeysFor({ ...full, posterKey: null })) {
      expect(typeof key).toBe("string");
    }
  });
});

describe("summaryChaptersKeyFor", () => {
  it("suffixes the full storage key", () => {
    expect(summaryChaptersKeyFor("videos/x.mp4")).toBe(
      "videos/x.mp4.summary-chapters.json",
    );
  });
});

describe("screenshotObjectKeysFor", () => {
  it("covers the image plus both sidecars", () => {
    expect(screenshotObjectKeysFor("screenshots/abc.png")).toEqual([
      "screenshots/abc.png",
      "screenshots/abc.source.png",
      "screenshots/abc.state.json",
    ]);
  });
});
