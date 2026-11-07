import { describe, expect, it } from "vitest";
import {
  SOCIAL_NETWORKS,
  socialShareUrl,
  unlinkHostnames,
} from "./share-links";

const link = {
  url: "https://captureflow.dev/r/abc?t=12",
  title: "Q3 demo & roadmap",
  message: "Check out “Q3 demo & roadmap”",
};

describe("socialShareUrl", () => {
  it("encodes the link and message so query characters survive", () => {
    const x = new URL(socialShareUrl("x", link));
    expect(x.searchParams.get("url")).toBe(link.url);
    expect(x.searchParams.get("text")).toBe(link.message);
    const reddit = new URL(socialShareUrl("reddit", link));
    expect(reddit.searchParams.get("title")).toBe(link.title);
  });

  it("puts the link inside the message where the network has no url field", () => {
    const wa = new URL(socialShareUrl("whatsapp", link));
    expect(wa.searchParams.get("text")).toBe(`${link.message} ${link.url}`);
    const mail = socialShareUrl("email", link);
    expect(mail.startsWith("mailto:?")).toBe(true);
    expect(decodeURIComponent(mail)).toContain(link.url);
  });

  it("builds an address for every network", () => {
    for (const n of SOCIAL_NETWORKS) {
      expect(socialShareUrl(n, link)).toMatch(/^(https:\/\/|mailto:)/);
    }
  });

  it("keeps hostnames in the message from becoming links", () => {
    const message = "Check out “www.figma.com rebuilt by agents”";
    const text = new URL(
      socialShareUrl("x", { ...link, message }),
    ).searchParams.get("text")!;
    expect(text).not.toMatch(/figma\.com/);
    expect(text.replaceAll("\u2060", "")).toBe(message);
    expect(unlinkHostnames("Q3 demo. Next steps")).toBe("Q3 demo. Next steps");
  });
});
