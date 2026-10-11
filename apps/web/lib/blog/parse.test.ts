import { describe, expect, it } from "vitest";
import { parsePost, slugify } from "./parse";

const SOURCE = `---
title: Hello world
description: A post: with a colon
date: 2026-10-11
---

Intro text.

## What you’re building

\`\`\`bash
## not a heading
\`\`\`

## Step 1: Log in
`;

describe("slugify", () => {
  it("drops apostrophes and joins words with dashes", () => {
    expect(slugify("What you’re building")).toBe("what-youre-building");
    expect(slugify("Step 1: Log in to Cloudflare")).toBe(
      "step-1-log-in-to-cloudflare",
    );
  });
});

describe("parsePost", () => {
  it("reads frontmatter and keeps colons in values", () => {
    const post = parsePost("hello", SOURCE);
    expect(post.title).toBe("Hello world");
    expect(post.description).toBe("A post: with a colon");
    expect(post.date).toBe("2026-10-11");
    expect(post.markdown.startsWith("\nIntro text.")).toBe(true);
  });

  it("builds the table of contents from h2s outside code blocks", () => {
    expect(parsePost("hello", SOURCE).toc).toEqual([
      { id: "what-youre-building", title: "What you’re building" },
      { id: "step-1-log-in", title: "Step 1: Log in" },
    ]);
  });

  it("rejects a post missing required frontmatter", () => {
    expect(() => parsePost("bad", "# no frontmatter")).toThrow(/bad/);
  });
});

describe("extractFaq", () => {
  it("pairs each question heading with its answer as plain text", () => {
    const post = parsePost(
      "faq",
      `---
title: T
description: D
date: 2026-10-11
---

## Frequently asked questions

### Is it free?

Yes, it's **open source**. See [the guide](/blog/x).

### Not a question

Skipped.

### Can I move?

Download and upload.
`,
    );
    expect(post.faq).toEqual([
      {
        question: "Is it free?",
        answer: "Yes, it's open source. See the guide.",
      },
      { question: "Can I move?", answer: "Download and upload." },
    ]);
  });
});
