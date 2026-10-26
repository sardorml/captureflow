import { describe, expect, it } from "vitest";
import {
  audioPartKeyFor,
  audioPartPrefixFor,
  objectKeysFor,
  posterThumbKeyFor,
  summaryChaptersKeyFor,
} from "./object-keys";
import { screenshotObjectKeysFor } from "../screenshot-keys";

const full = {
  storageKey: "videos/abc12345.mp4",
  posterKey: "posters/abc12345.jpg",
  posterThumbKey: "posters/abc12345.0123456789abcdef.thumb2.jpg",
  webcamStorageKey: "videos/abc12345-webcam.webm",
};

describe("objectKeysFor", () => {
  it("covers every object a recording owns", () => {
    expect(objectKeysFor(full)).toEqual([
      "videos/abc12345.mp4",
      "posters/abc12345.jpg",
      "posters/abc12345.0123456789abcdef.thumb2.jpg",
      "videos/abc12345-webcam.webm",
      "videos/abc12345.config.json",
      "videos/abc12345.mp4.summary-chapters.json",
    ]);
  });

  it("drops absent poster, thumbnail and webcam but keeps the sidecars", () => {
    expect(
      objectKeysFor({
        ...full,
        posterKey: null,
        posterThumbKey: null,
        webcamStorageKey: null,
      }),
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
      posterThumbKey: null,
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

describe("posterThumbKeyFor", () => {
  it("sits next to the poster under the digest, always as a JPEG", () => {
    expect(posterThumbKeyFor("posters/abc12345.jpg", "0123456789abcdef")).toBe(
      "posters/abc12345.0123456789abcdef.thumb2.jpg",
    );
    expect(posterThumbKeyFor("posters/abc12345.png", "fedcba9876543210")).toBe(
      "posters/abc12345.fedcba9876543210.thumb2.jpg",
    );
  });
});

describe("summaryChaptersKeyFor", () => {
  it("suffixes the full storage key", () => {
    expect(summaryChaptersKeyFor("videos/x.mp4")).toBe(
      "videos/x.mp4.summary-chapters.json",
    );
  });
});

describe("audio part keys", () => {
  it("numbers chunks under one prefix next to the video", () => {
    expect(audioPartPrefixFor("videos/x.mp4")).toBe("videos/x-audio-");
    expect(audioPartKeyFor("videos/x.mp4", 3)).toBe("videos/x-audio-3.webm");
  });

  it("keeps the prefix clear of the video and its sidecars", () => {
    const prefix = audioPartPrefixFor(full.storageKey);
    for (const key of objectKeysFor(full)) {
      expect(key.startsWith(prefix)).toBe(false);
    }
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
