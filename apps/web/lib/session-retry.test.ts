import { describe, expect, it } from "vitest";
import { nextRetries, SESSION_RETRY_WINDOW_MS } from "./session-retry";

describe("nextRetries", () => {
  it("retries a first stall and records it", () => {
    expect(nextRetries([], 1000)).toEqual({ retry: true, tries: [1000] });
  });

  it("stops after two retries within a minute", () => {
    expect(nextRetries([1000, 2000], 3000)).toEqual({
      retry: false,
      tries: [1000, 2000],
    });
  });

  it("forgets retries older than the window", () => {
    const now = 1000 + SESSION_RETRY_WINDOW_MS;
    expect(nextRetries([1000, now - 10], now)).toEqual({
      retry: true,
      tries: [now - 10, now],
    });
  });

  it("ignores garbage read back from storage", () => {
    expect(nextRetries([Number.NaN], 5)).toEqual({ retry: true, tries: [5] });
  });
});
