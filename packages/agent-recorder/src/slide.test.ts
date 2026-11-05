import { describe, expect, it } from "vitest";
import { renderSlide, slideLayer, slideShell } from "./slide";

describe("slideLayer", () => {
  it("picks the entrance by layout", () => {
    expect(slideLayer({ layout: "cover", title: "T" }).entrance).toBe("rise");
    expect(slideLayer({ layout: "image", title: "T" }).entrance).toBe("whip");
    expect(slideLayer({ layout: "end_card", title: "T" }).entrance).toBe(
      "cross",
    );
    expect(slideLayer({ title: "T" }).entrance).toBe("push");
  });

  it("carries the deck's progress and counts figures up", () => {
    const { html } = slideLayer({
      title: "T",
      page: 2,
      total: 4,
      facts: [{ title: "40% faster" }, { title: "2 min" }],
    });
    expect(html).toContain('data-from="0.250" data-to="0.500"');
    expect(html).toContain('<span class="cnt" style="--to:40"></span>% faster');
    expect(html).toContain(">2 min<");
  });

  it("is a layer, not a page, and the shell holds the styles once", () => {
    expect(slideLayer({ title: "T" }).html.startsWith('<div class="s"')).toBe(
      true,
    );
    expect(slideShell()).toContain("__cfEnter");
    expect(slideShell()).toContain('<div class="deck"></div>');
  });
});

describe("renderSlide", () => {
  it("escapes the agent's text so it can't add markup", () => {
    const html = renderSlide({
      layout: "list",
      title: "<script>alert(1)</script>",
      items: [{ text: '"quoted" & <b>bold</b>' }],
    });
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&quot;quoted&quot; &amp; &lt;b&gt;");
  });

  it("numbers list items and keeps at most six", () => {
    const items = Array.from({ length: 7 }, (_, i) => ({ text: `Step ${i}` }));
    const html = renderSlide({ layout: "list", title: "T", items });
    expect(html.match(/class="row /g)).toHaveLength(6);
    expect(html).toContain('<span class="num">6</span>');
    expect(html).not.toContain('<span class="num">7</span>');
  });

  it("only shows http(s) images", () => {
    const html = renderSlide({ title: "T", imageUrl: "javascript:alert(1)" });
    expect(html).not.toContain("<img");
  });

  it("shows the page as n / total in the top bar", () => {
    const html = renderSlide({
      title: "T",
      section: "Record",
      page: 4,
      total: 6,
    });
    expect(html).toContain("04 / 06");
    expect(html).toContain(">Record<");
  });

  it("steps a long headline down a size", () => {
    const short = renderSlide({ layout: "statement", title: "Short" });
    const long = renderSlide({ layout: "statement", title: "x".repeat(120) });
    expect(short).toContain("font-size:124px");
    expect(long).toContain("font-size:80px");
  });

  it("circles the highlighted words when they are in the title", () => {
    const hit = renderSlide({
      layout: "statement",
      title: "Only the actions are recorded",
      highlight: "actions",
    });
    expect(hit).toContain('<span class="hit">actions<svg class="loop');
    const miss = renderSlide({
      layout: "statement",
      title: "Only the actions are recorded",
      highlight: "narration",
    });
    expect(miss).not.toContain('class="hit"');
  });

  it("keeps the logo off unless asked for", () => {
    const plain = renderSlide({ layout: "cover", title: "T" });
    expect(plain).not.toContain('class="lockup');
    const branded = renderSlide({ layout: "cover", title: "T", logo: true });
    expect(branded).toContain('class="lockup');
    expect(branded).toContain(">CaptureFlow<");
  });

  it("puts the button text on an end card", () => {
    const html = renderSlide({
      layout: "end_card",
      title: "Your agent can record for you",
      cta: "Try it free",
    });
    expect(html).toContain('<div class="cta in"');
    expect(html).toContain("Try it free");
  });

  it("frames a screenshot with its callout and pushes in towards it", () => {
    const html = renderSlide({
      layout: "image",
      title: "Open Settings",
      imageUrl: "https://example.com/shot.png",
      caption: "The gear is top right.",
      callout: { x: 80, y: 10, w: 15, h: 10 },
    });
    expect(html).toContain(
      '<div class="ring pop" style="left:80%;top:10%;width:15%;height:10%;',
    );
    expect(html).toContain("transform-origin:87.5% 15%");
    expect(html).toContain("The gear is top right.");
    const plain = renderSlide({ layout: "image", title: "T" });
    expect(plain).not.toContain('class="pic"');
  });

  it("numbers code lines, marks the named ones and escapes the rest", () => {
    const html = renderSlide({
      layout: "code",
      title: "The fix",
      language: "ts",
      code: "const a = 1;\nif (a < 2) {\n  run();\n}",
      lines: "2-3",
    });
    expect(html.match(/class="ln hl"/g)).toHaveLength(2);
    expect(html).toContain("if (a &lt; 2) {");
    expect(html).toContain('<span class="lang">ts</span>');
  });

  it("maps the old theme names onto the new grounds", () => {
    expect(renderSlide({ title: "T", theme: "navy" })).toContain(
      "--bg:#09090b",
    );
    expect(renderSlide({ title: "T", theme: "cream" })).toContain(
      "--bg:#f4f4f5",
    );
  });
});
