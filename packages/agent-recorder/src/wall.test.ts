import { describe, expect, it } from "vitest";
import { looksLikeWall } from "./wall";

describe("looksLikeWall", () => {
  it("knows the usual bot checks and block pages", () => {
    expect(looksLikeWall("Just a moment...", "")).toBe(true);
    expect(looksLikeWall("Access Denied", "You don't have permission")).toBe(
      true,
    );
    expect(
      looksLikeWall(
        "",
        "You've been blocked by network security. File a ticket",
      ),
    ).toBe(true);
    expect(looksLikeWall("etsy.com", "")).toBe(true);
  });

  it("lets a real page through", () => {
    expect(
      looksLikeWall(
        "Figma: The Collaborative Interface Design Tool",
        "Design anything you can imagine. Turn ideas into apps and sites.",
      ),
    ).toBe(false);
    expect(
      looksLikeWall("Example Domain", "This domain is for use in examples"),
    ).toBe(false);
  });
});
