import { describe, expect, it } from "vitest";
import { isSubscriptionActive } from "@captureflow/quota";
import {
  hydrateOverride,
  overrideRowFields,
  readOverride,
} from "./subscription-override";

const NOW = 1_800_000_000;

describe("overrideRowFields", () => {
  it("makes Free an inactive row", () => {
    const row = overrideRowFields({ plan: "free", status: "active" }, NOW);
    expect(isSubscriptionActive(row, NOW)).toBe(false);
  });

  it("keeps paid statuses as billing would treat them", () => {
    const active = (status: "active" | "past_due" | "cancelled" | "unpaid") =>
      isSubscriptionActive(
        overrideRowFields({ plan: "pro", status }, NOW),
        NOW,
      );
    expect(active("active")).toBe(true);
    expect(active("past_due")).toBe(true);
    expect(active("cancelled")).toBe(true);
    expect(active("unpaid")).toBe(false);
  });
});

describe("hydrateOverride", () => {
  it("rejects unknown plans and defaults unknown statuses", () => {
    expect(hydrateOverride("enterprise", "active")).toBeNull();
    expect(hydrateOverride("pro", "bogus")).toEqual({
      plan: "pro",
      status: "active",
    });
  });
});

describe("readOverride", () => {
  it("round-trips through the stored row", () => {
    const write = (plan: "free" | "pro", status: "past_due" | "active") =>
      readOverride(overrideRowFields({ plan, status }, NOW));
    expect(write("free", "active")).toEqual({ plan: "free", status: "active" });
    expect(write("pro", "past_due")).toEqual({
      plan: "pro",
      status: "past_due",
    });
    expect(readOverride(null)).toBeNull();
  });
});
