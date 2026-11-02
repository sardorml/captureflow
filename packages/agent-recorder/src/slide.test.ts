import { describe, expect, it } from "vitest";
import { renderSlide } from "./slide";

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
    expect(html).toContain(">06<");
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
    expect(short).toContain("font-size:128px");
    expect(long).toContain("font-size:88px");
  });
});
