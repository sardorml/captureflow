import { describe, expect, it } from "vitest";
import { renderCampaign, renderNotice } from "./render";

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

  it("heads the email with the logo as a hosted PNG", () => {
    expect(renderCampaign(args).html).toContain(
      'src="https://captureflow.dev/logo.png"',
    );
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

describe("renderNotice", () => {
  it("escapes the fields it is given as text", () => {
    const html = renderNotice({
      label: "<b>Label</b>",
      heading: "Tom & Jerry",
      bodyHtml: "<p>body</p>",
      button: { label: "Go", url: "https://x.dev/?a=1&b=2" },
    });
    expect(html).toContain("&lt;b&gt;Label&lt;/b&gt;");
    expect(html).toContain("Tom &amp; Jerry");
    expect(html).toContain("<p>body</p>");
    expect(html).toContain('href="https://x.dev/?a=1&amp;b=2"');
  });

  it("leaves out the parts that were not given", () => {
    const html = renderNotice({ heading: "Hi", bodyHtml: "" });
    expect(html).not.toContain("#8a847c");
    expect(html).not.toContain("#2563eb");
  });
});
