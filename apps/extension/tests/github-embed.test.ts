import { describe, expect, it } from "vitest";
import { parseSharePage, shareSlugFromUrl } from "../lib/github-embed";

const BASE = "https://captureflow.dev";

describe("shareSlugFromUrl", () => {
  it("reads the slug of a share link on the web origin", () => {
    expect(shareSlugFromUrl("https://captureflow.dev/r/kvdELAWxxJ", BASE)).toBe(
      "kvdELAWxxJ",
    );
    expect(
      shareSlugFromUrl("https://captureflow.dev/r/kvdELAWxxJ/?t=3", BASE),
    ).toBe("kvdELAWxxJ");
  });

  it("ignores other origins, paths and malformed slugs", () => {
    expect(shareSlugFromUrl("https://evil.dev/r/kvdELAWxxJ", BASE)).toBeNull();
    expect(
      shareSlugFromUrl("https://captureflow.dev/s/kvdELAWxxJ", BASE),
    ).toBeNull();
    expect(
      shareSlugFromUrl("https://captureflow.dev/r/kvdELAWxxJ/edit", BASE),
    ).toBeNull();
    expect(shareSlugFromUrl("https://captureflow.dev/r/no", BASE)).toBeNull();
    expect(shareSlugFromUrl("not a url", BASE)).toBeNull();
  });
});

describe("parseSharePage", () => {
  const page = "https://captureflow.dev/r/kvdELAWxxJ";

  it("reads the player inputs from the preview tags", () => {
    const html = `<head>
      <meta property="og:title" content="Fix &amp; ship"/>
      <meta property="og:image" content="https://cdn.captureflow.dev/posters/a.jpg?v=1"/>
      <meta property="og:video" content="https://cdn.captureflow.dev/videos/a.mp4?v=1&amp;x=2"/>
      <meta property="og:video:width" content="1920"/>
      <meta property="og:video:height" content="1080"/>
    </head>`;
    expect(parseSharePage(html, page)).toEqual({
      videoUrl: "https://cdn.captureflow.dev/videos/a.mp4?v=1&x=2",
      posterUrl: "https://cdn.captureflow.dev/posters/a.jpg?v=1",
      title: "Fix & ship",
      width: 1920,
      height: 1080,
    });
  });

  it("resolves a signed relative media link and defaults the size", () => {
    const html = `<meta property="og:video" content="/api/r/m/abc"/>`;
    expect(parseSharePage(html, page)).toEqual({
      videoUrl: "https://captureflow.dev/api/r/m/abc",
      posterUrl: null,
      title: "CaptureFlow recording",
      width: 1280,
      height: 720,
    });
  });

  it("returns null when the visitor may not watch", () => {
    expect(
      parseSharePage(`<meta property="og:title" content="Not found"/>`, page),
    ).toBeNull();
  });
});
