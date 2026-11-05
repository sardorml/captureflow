import { describe, expect, it } from "vitest";
import { fmt, plural } from "./format";

describe("fmt", () => {
  it("fills every named placeholder", () => {
    expect(fmt("Hi {name}, {n} new", { name: "Pat", n: 3 })).toBe(
      "Hi Pat, 3 new",
    );
    expect(fmt("{a} and {a}", { a: "x" })).toBe("x and x");
  });

  it("leaves a placeholder it has no value for", () => {
    expect(fmt("Hi {name}", {})).toBe("Hi {name}");
  });
});

describe("plural", () => {
  const english = "one:{n} recording|other:{n} recordings";
  const polish =
    "one:{n} nagranie|few:{n} nagrania|many:{n} nagrań|other:{n} nagrania";

  it("picks the form for the count", () => {
    expect(plural(english, 1, "en")).toBe("1 recording");
    expect(plural(english, 0, "en")).toBe("0 recordings");
    expect(plural(english, 12, "en")).toBe("12 recordings");
  });

  it("uses the extra forms a language has", () => {
    expect(plural(polish, 1, "pl")).toBe("1 nagranie");
    expect(plural(polish, 3, "pl")).toBe("3 nagrania");
    expect(plural(polish, 5, "pl")).toBe("5 nagrań");
  });

  it("falls back to the other form", () => {
    expect(plural("other:{n} 件", 1, "en")).toBe("1 件");
  });
});
