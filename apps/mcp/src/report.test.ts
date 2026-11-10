import { describe, expect, it } from "vitest";
import {
  formatAt,
  reportMarkdown,
  slugFromLink,
  summaryWithContext,
} from "./report";

describe("slugFromLink", () => {
  it("takes the id from a share link, or the id alone", () => {
    expect(slugFromLink("https://captureflow.dev/r/ZbHPA8dPCQ")).toBe(
      "ZbHPA8dPCQ",
    );
    expect(slugFromLink("http://localhost:3032/r/ZbHPA8dPCQ/")).toBe(
      "ZbHPA8dPCQ",
    );
    expect(slugFromLink("ZbHPA8dPCQ")).toBe("ZbHPA8dPCQ");
  });

  it("refuses anything else", () => {
    expect(slugFromLink("https://captureflow.dev/s/ZbHPA8dPCQ")).toBeNull();
    expect(slugFromLink("../../etc")).toBeNull();
    expect(slugFromLink("short")).toBeNull();
  });
});

describe("formatAt", () => {
  it("reads like a video timestamp", () => {
    expect(formatAt(0)).toBe("0:00");
    expect(formatAt(65_400)).toBe("1:05");
    expect(formatAt(3_725_000)).toBe("1:02:05");
  });
});

describe("reportMarkdown", () => {
  it("puts the summary under the title and lists chapters", () => {
    const md = reportMarkdown(
      "Signup fix",
      "file:///tmp/a.mp4",
      "Fixed the form.",
      [
        { ms: 0, title: "Intro" },
        { ms: 12_000, title: "The form" },
      ],
    );
    expect(md).toBe(
      "# Signup fix\n\nVideo: file:///tmp/a.mp4\n\nFixed the form.\n\n## Chapters\n\n- 0:00 Intro\n- 0:12 The form\n",
    );
  });
});

describe("summaryWithContext", () => {
  it("leaves a summary alone without a context", () => {
    expect(summaryWithContext(" Fixed. ")).toBe("Fixed.");
  });

  it("adds the revision, changes, checks and what was not shown", () => {
    const text = summaryWithContext("Fixed.", {
      source: {
        sha: "0123456789abcdef",
        dirty: true,
        branch: "fix/form",
        url: "https://github.com/acme/app/pull/7",
      },
      changes: [{ title: "The form", detail: "Keeps its values" }],
      checks: [{ name: "tests", status: "failed", detail: "2 failing" }],
      notShown: ["Migration"],
    });
    expect(text).toBe(
      [
        "Fixed.",
        "",
        "Commit: 0123456789abcdef (uncommitted changes)",
        "Branch: fix/form",
        "Link: https://github.com/acme/app/pull/7",
        "",
        "Changes",
        "- The form: Keeps its values",
        "",
        "Checks",
        "- tests: failed (2 failing)",
        "",
        "Not shown",
        "- Migration",
      ].join("\n"),
    );
  });

  it("skips the parts a context leaves out", () => {
    expect(summaryWithContext("Fixed.", { source: { sha: "0123456" } })).toBe(
      "Fixed.\n\nCommit: 0123456",
    );
  });
});
