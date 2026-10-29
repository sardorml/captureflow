import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withTimeout } from "./with-timeout";

describe("withTimeout", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("resolves with the promise when it settles in time", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 100, null)).resolves.toBe(
      "ok",
    );
  });

  it("resolves with the fallback when the promise never settles", async () => {
    const result = withTimeout(new Promise<string>(() => {}), 100, null);
    await vi.advanceTimersByTimeAsync(100);
    await expect(result).resolves.toBeNull();
  });

  it("passes a rejection through", async () => {
    await expect(
      withTimeout(Promise.reject(new Error("boom")), 100, null),
    ).rejects.toThrow("boom");
  });

  it("clears its timer once the promise wins", async () => {
    await withTimeout(Promise.resolve(1), 100, null);
    expect(vi.getTimerCount()).toBe(0);
  });
});
