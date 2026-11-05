import { describe, expect, it } from "vitest";
import {
  cachedStylesheets,
  forInlining,
  stylesheetName,
} from "./inline-stylesheet";

const ADDRESS = new URL("https://captureflow.dev/_next/static/chunks/app.css");

describe("forInlining", () => {
  it("re-points references that are relative to the stylesheet", () => {
    expect(forInlining("src:url(../media/a.woff2)", ADDRESS)).toBe(
      "src:url(/_next/static/media/a.woff2)",
    );
    expect(forInlining(`src:url("./b.woff2?v=2#c")`, ADDRESS)).toBe(
      `src:url("/_next/static/chunks/b.woff2?v=2#c")`,
    );
    expect(forInlining("src:url('media/c.png')", ADDRESS)).toBe(
      "src:url('/_next/static/chunks/media/c.png')",
    );
  });

  it("leaves absolute, data and fragment references alone", () => {
    const css =
      "a{b:url(/fonts/a.woff2)}c{d:url(data:image/svg+xml;utf8,<svg/>)}e{f:url(https://x.dev/y.png)}g{h:url(#i)}";
    expect(forInlining(css, ADDRESS)).toBe(css);
  });

  it("cannot close the style element it is placed in", () => {
    expect(forInlining(`a{content:"</style>"}`, ADDRESS)).toBe(
      `a{content:"<\\/style>"}`,
    );
  });
});

describe("cachedStylesheets", () => {
  it("reads the names out of the cookie header", () => {
    const cookie =
      "captureflow_lang=de; captureflow_css=1k3kfvey1-5a9.3n2cpb4q; x=1";
    expect([...cachedStylesheets(cookie)]).toEqual([
      "1k3kfvey1-5a9",
      "3n2cpb4q",
    ]);
  });

  it("is empty without the cookie", () => {
    expect(cachedStylesheets(null).size).toBe(0);
    expect(cachedStylesheets("captureflow_lang=de").size).toBe(0);
    expect(cachedStylesheets("captureflow_css=").size).toBe(0);
  });

  it("matches the name the worker derives from a stylesheet's address", () => {
    const name = stylesheetName("/_next/static/chunks/1k3kfvey1-5a9.css");
    expect(name).toBe("1k3kfvey1-5a9");
    expect(cachedStylesheets(`captureflow_css=${name}`).has(name)).toBe(true);
  });
});
