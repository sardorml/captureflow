import { describe, expect, it } from "vitest";
import { MESSAGES } from "@/lib/marketing/messages";
import { pageMetadata } from "./metadata";

const imageOf = (m: ReturnType<typeof pageMetadata>) =>
  (m.openGraph?.images as { url: string }[] | undefined)?.[0]?.url;

describe("pageMetadata", () => {
  it("gives the swarm demo page its own card, in English too", () => {
    const m = pageMetadata("swarmDemo", "en", MESSAGES);
    expect(imageOf(m)).toMatch(/^\/og-swarm-demo\.png/);
    expect(m.twitter).toMatchObject({ images: [imageOf(m)] });
  });

  it("leaves other English inner pages on the site-wide card", () => {
    expect(pageMetadata("features", "en", MESSAGES).openGraph).toBeUndefined();
  });

  it("uses the site-wide card for translated pages without their own", () => {
    expect(imageOf(pageMetadata("features", "de", MESSAGES))).toMatch(
      /^\/og-image\.png/,
    );
  });
});
