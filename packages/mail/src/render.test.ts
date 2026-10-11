import { describe, expect, it } from "vitest";
import { renderCampaign } from "./render";

const args = {
  subject: "What's new",
  body: "# Hello\n\nRead the [changelog](https://example.com/c).\n\n<script>alert(1)</script>",
  unsubscribeUrl: "https://mail.example.com/unsubscribe?e=a%40b.c&t=x",
};

describe("renderCampaign", () => {
  it("renders Markdown and escapes raw HTML", () => {
    const { html } = renderCampaign(args);
    expect(html).toContain("<h1>Hello</h1>");
    expect(html).toContain('<a href="https://example.com/c">changelog</a>');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("puts the unsubscribe link in both parts", () => {
    const { html, text } = renderCampaign(args);
    expect(html).toContain("unsubscribe?e=a%40b.c&amp;t=x");
    expect(text).toContain(`Unsubscribe: ${args.unsubscribeUrl}`);
  });

  it("writes a readable plain-text part", () => {
    expect(renderCampaign(args).text).toMatch(
      /^Hello\n\nRead the changelog \(https:\/\/example.com\/c\)\./,
    );
  });
});
