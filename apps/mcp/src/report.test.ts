import { describe, expect, it } from "vitest";
import { formatAt, reportMarkdown, slugFromLink } from "./report";

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
