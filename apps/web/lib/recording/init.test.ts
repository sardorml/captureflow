import { describe, expect, it } from "vitest";
import { parseInitRequest } from "./init";

describe("parseInitRequest", () => {
  it("accepts an mp4 recording and titles it with the date", () => {
    const parsed = parseInitRequest({
      contentType: "video/mp4",
      source: "instant",
      title: "  Product demo ",
      durationMs: 1200,
    });
    expect(parsed.kind).toBe("ok");
    if (parsed.kind !== "ok") return;
    expect(parsed.init.preset).toBe("recording");
    expect(parsed.init.durationMs).toBe(1200);
    expect(parsed.init.title.startsWith("Product demo — ")).toBe(true);
  });

  it("drops a duration that isn't a positive number", () => {
    const parsed = parseInitRequest({
      contentType: "video/mp4",
      source: "instant",
      durationMs: -1,
    });
    expect(parsed.kind === "ok" && parsed.init.durationMs).toBeNull();
  });

  it.each([
    [{ contentType: "text/html", source: "instant" }, "invalid_content_type"],
    [{ contentType: "video/mp4" }, "invalid_source"],
    [
      { contentType: "video/mp4", source: "instant", preset: "gif" },
      "invalid_preset",
    ],
  ])("refuses %j", (body, code) => {
    expect(parseInitRequest(body as never)).toMatchObject({
      kind: "error",
      status: 400,
      code,
    });
  });
});
