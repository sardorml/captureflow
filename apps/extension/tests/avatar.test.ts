import { describe, expect, it } from "vitest";
import { avatarUrlAt } from "../lib/avatar";

describe("avatarUrlAt", () => {
  it("resizes a Google avatar through its size suffix", () => {
    expect(
      avatarUrlAt("https://lh3.googleusercontent.com/a/abc=s96-c", 440),
    ).toBe("https://lh3.googleusercontent.com/a/abc=s440-c");
    expect(
      avatarUrlAt("https://lh3.googleusercontent.com/a/abc=s96", 440),
    ).toBe("https://lh3.googleusercontent.com/a/abc=s440-c");
  });

  it("leaves a Google avatar without a size suffix alone", () => {
    expect(avatarUrlAt("https://lh3.googleusercontent.com/a/abc", 440)).toBe(
      "https://lh3.googleusercontent.com/a/abc",
    );
  });

  it("leaves other hosts and malformed values alone", () => {
    expect(avatarUrlAt("https://example.com/me.png?s=96", 440)).toBe(
      "https://example.com/me.png?s=96",
    );
    expect(avatarUrlAt("not a url=s96-c", 440)).toBe("not a url=s96-c");
  });
});
