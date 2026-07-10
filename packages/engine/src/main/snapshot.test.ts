import { describe, expect, it } from "vitest";
import { parseSnapshotOutput } from "./snapshot";

describe("parseSnapshotOutput", () => {
  it("parses a successful payload among log noise", () => {
    const stdout = [
      "some log line",
      '  {"ok":true,"path":"/tmp/x.png","width":2560,"height":1440,"bytes":12345}',
      "",
    ].join("\n");
    expect(parseSnapshotOutput(stdout)).toEqual({
      ok: true,
      result: { path: "/tmp/x.png", width: 2560, height: 1440, bytes: 12345 },
    });
  });

  it("defaults missing dimensions to zero", () => {
    expect(parseSnapshotOutput('{"ok":true,"path":"/tmp/x.png"}')).toEqual({
      ok: true,
      result: { path: "/tmp/x.png", width: 0, height: 0, bytes: 0 },
    });
  });

  it("fails when no JSON line is present", () => {
    expect(parseSnapshotOutput("nothing here\n")).toEqual({
      ok: false,
      error: "snapshot produced no output",
    });
  });

  it("surfaces the binary's error field", () => {
    expect(parseSnapshotOutput('{"error":"no display"}')).toEqual({
      ok: false,
      error: "no display",
    });
  });

  it("fails on ok payload without a path", () => {
    expect(parseSnapshotOutput('{"ok":true}')).toEqual({
      ok: false,
      error: "snapshot failed",
    });
  });

  it("fails on malformed JSON", () => {
    const res = parseSnapshotOutput("{not json");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("failed to parse");
  });
});
