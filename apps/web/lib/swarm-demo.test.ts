import { describe, expect, it } from "vitest";
import { checkSite, hydrateDemoUrl, parseSitePreview } from "./swarm-demo";

describe("hydrateDemoUrl", () => {
  it("accepts a bare host or a full address", () => {
    expect(hydrateDemoUrl("example.com")).toBe("https://example.com/");
    expect(hydrateDemoUrl("  www.example.com/pricing ")).toBe(
      "https://www.example.com/pricing",
    );
    expect(hydrateDemoUrl("http://example.co.uk/a?b=1")).toBe(
      "http://example.co.uk/a?b=1",
    );
  });

  it("refuses what the recorder can't or shouldn't open", () => {
    for (const bad of [
      "",
      "   ",
      "localhost",
      "localhost:3000",
      "127.0.0.1",
      "http://10.0.0.1/",
      "ftp://example.com",
      "javascript:alert(1)",
      "https://user:pw@example.com",
      "not a url",
      "x".repeat(600),
      42,
      null,
    ]) {
      expect(hydrateDemoUrl(bad)).toBeNull();
    }
  });
});

describe("parseSitePreview", () => {
  const html = `<!doctype html><html><head>
    <title>Example &amp; Co — Home</title>
    <meta property="og:title" content="Example &amp; Co">
    <meta name="description" content="  Plain   description ">
    <meta property="og:description" content='Social description'>
    <meta property="og:image" content="/img/social.png">
    <link rel="shortcut icon" href="favicon-32.png">
    <link rel="apple-touch-icon" href="/touch.png">
  </head><body></body></html>`;

  it("takes the social fields first and resolves addresses against the page", () => {
    const p = parseSitePreview(html, "https://example.com/pricing/");
    expect(p).toEqual({
      url: "https://example.com/pricing/",
      host: "example.com",
      title: "Example & Co",
      description: "Social description",
      image: "https://example.com/img/social.png",
      icon: "https://example.com/touch.png",
    });
  });

  it("falls back to the title tag, the plain description and the root favicon", () => {
    const p = parseSitePreview(
      `<title>Just a &#x27;page&#x27;</title><meta name="description" content="x">`,
      "https://www.example.org/a",
    );
    expect(p.title).toBe("Just a 'page'");
    expect(p.description).toBe("x");
    expect(p.image).toBeNull();
    expect(p.icon).toBe("https://www.example.org/favicon.ico");
  });

  it("keeps a long title and description short", () => {
    const p = parseSitePreview(
      `<title>${"t".repeat(300)}</title><meta name="description" content="${"d".repeat(400)}">`,
      "https://example.com/",
    );
    expect(p.title!.length).toBe(120);
    expect(p.description!.length).toBe(200);
  });
});

describe("checkSite", () => {
  it("reads the page it is given and keeps the address it landed on", async () => {
    const fetchImpl = (async () =>
      new Response("<title>Landed</title>", {
        headers: { "content-type": "text/html" },
      })) as unknown as typeof fetch;
    const p = await checkSite("https://example.com/", fetchImpl);
    expect(p?.title).toBe("Landed");
    expect(p?.host).toBe("example.com");
  });

  it("finds tags behind a large inline stylesheet", async () => {
    const css = `<style>${"a{color:red}".repeat(30_000)}</style>`;
    const fetchImpl = (async () =>
      new Response(
        `<html><head>${css}<title>Deep</title><meta property="og:image" content="/og.png"></head><body></body></html>`,
        { headers: { "content-type": "text/html" } },
      )) as unknown as typeof fetch;
    const p = await checkSite("https://example.com/", fetchImpl);
    expect(p?.title).toBe("Deep");
    expect(p?.image).toBe("https://example.com/og.png");
  });

  it("is null when nothing answers", async () => {
    const fetchImpl = (async () => {
      throw new Error("ENOTFOUND");
    }) as unknown as typeof fetch;
    expect(await checkSite("https://nope.example/", fetchImpl)).toBeNull();
  });
});
