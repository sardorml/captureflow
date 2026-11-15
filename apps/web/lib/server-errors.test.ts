import { describe, expect, it } from "vitest";
import { exceptionEvent, parseStack } from "./server-errors";

describe("parseStack", () => {
  it("lists V8 frames caller first", () => {
    const stack = [
      "TypeError: boom",
      "    at loadRecording (/app/.next/server/chunks/ssr/a.js:12:34)",
      "    at async Page (/app/.next/server/chunks/ssr/b.js:5:6)",
      "    at /app/node_modules/next/dist/server/render.js:1:2",
    ].join("\n");
    const frames = parseStack(stack);
    expect(frames.map((f) => [f.function, f.lineno, f.in_app])).toEqual([
      ["?", 1, false],
      ["async Page", 5, true],
      ["loadRecording", 12, true],
    ]);
    expect(frames[2]).toMatchObject({
      filename: "/app/.next/server/chunks/ssr/a.js",
      colno: 34,
    });
  });

  it("returns no frames without a stack", () => {
    expect(parseStack(undefined)).toEqual([]);
  });
});

describe("exceptionEvent", () => {
  it("describes the error and the route", () => {
    const event = exceptionEvent(
      new RangeError("bad"),
      { path: "/r/abc", method: "GET" },
      { routePath: "/r/[id]", routeType: "render" },
    );
    expect(event.event).toBe("$exception");
    expect(event.properties.$exception_list[0]).toMatchObject({
      type: "RangeError",
      value: "bad",
    });
    expect(event.properties).toMatchObject({
      $current_url: "/r/abc",
      route: "/r/[id]",
      source: "server",
    });
  });

  it("wraps thrown values that aren't errors", () => {
    const event = exceptionEvent(
      "nope",
      { path: "/", method: "GET" },
      {
        routePath: "/",
        routeType: "render",
      },
    );
    expect(event.properties.$exception_list[0].value).toBe("nope");
  });
});
