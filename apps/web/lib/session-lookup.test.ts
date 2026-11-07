import { describe, expect, it, vi } from "vitest";
import { lookupSession, SessionLookupStalled } from "./session-lookup";

const never = () => new Promise<never>(() => {});

describe("lookupSession", () => {
  it("returns the answer when it comes in time", async () => {
    await expect(
      lookupSession(async () => "session", "test", { attemptMs: 50 }),
    ).resolves.toBe("session");
  });

  it("retries a stalled read and returns the second answer", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    let calls = 0;
    const read = () => (++calls === 1 ? never() : Promise.resolve("late"));
    await expect(
      lookupSession(read, "test", {
        attemptMs: 20,
        probe: async () => "d1: answered in 1ms",
      }),
    ).resolves.toBe("late");
    expect(calls).toBe(2);
    expect(warn.mock.calls[0]?.[0]).toContain("d1: answered in 1ms");
    warn.mockRestore();
  });

  it("gives up after two stalls instead of waiting forever", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(
      lookupSession(never, "test", { attemptMs: 20 }),
    ).rejects.toBeInstanceOf(SessionLookupStalled);
    warn.mockRestore();
  });

  it("passes a failed read through", async () => {
    await expect(
      lookupSession(() => Promise.reject(new Error("bad cookie")), "test", {
        attemptMs: 50,
      }),
    ).rejects.toThrow("bad cookie");
  });
});
