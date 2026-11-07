import { describe, expect, it } from "vitest";
import {
  isChunkLoadError,
  RELOAD_COOLDOWN_MS,
  shouldReload,
} from "./chunk-error";

describe("isChunkLoadError", () => {
  it.each([
    "Loading chunk 812 failed.",
    "Failed to load chunk /_next/static/chunks/abc.js",
    "Loading CSS chunk 3 failed.",
    "Failed to fetch dynamically imported module: https://x/_next/a.js",
    "Importing a module script failed.",
  ])("recognizes %s", (message) => {
    expect(isChunkLoadError(new Error(message))).toBe(true);
  });

  it("recognizes a ChunkLoadError by name", () => {
    const error = new Error("whatever");
    error.name = "ChunkLoadError";
    expect(isChunkLoadError(error)).toBe(true);
  });

  it("leaves other errors alone", () => {
    expect(isChunkLoadError(new TypeError("x is undefined"))).toBe(false);
    expect(isChunkLoadError("Loading chunk 1 failed")).toBe(false);
  });
});

describe("shouldReload", () => {
  it("reloads the first time and after the cooldown, not within it", () => {
    expect(shouldReload(null, 1000)).toBe(true);
    expect(shouldReload(1000, 1000 + RELOAD_COOLDOWN_MS)).toBe(false);
    expect(shouldReload(1000, 1001 + RELOAD_COOLDOWN_MS)).toBe(true);
  });
});
