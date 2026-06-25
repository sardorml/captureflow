import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing";
import { getDeviceId, newDeviceId } from "../lib/auth/device-id";

describe("newDeviceId", () => {
  it("fits the recording API's 8–64 char device-header bound", () => {
    const id = newDeviceId();
    expect(id.length).toBeGreaterThanOrEqual(8);
    expect(id.length).toBeLessThanOrEqual(64);
  });

  it("is unique per call", () => {
    expect(newDeviceId()).not.toBe(newDeviceId());
  });
});

describe("getDeviceId", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("generates once and persists across calls", async () => {
    const first = await getDeviceId();
    const second = await getDeviceId();
    expect(first).toBe(second);
  });
});
