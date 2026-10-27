import { describe, expect, it } from "vitest";
import {
  FREE_TIER,
  UNLIMITED_STORAGE_BYTES,
  getSeatPlan,
  hydrateSeatPlanId,
  resolveWorkspaceEntitlement,
  seatPriceUsd,
} from "@captureflow/quota";

describe("resolveWorkspaceEntitlement", () => {
  it("puts an unpaid workspace on the free tier with per-person caps", () => {
    const e = resolveWorkspaceEntitlement({
      subscription: null,
      memberCount: 3,
    });
    expect(e.tier).toBe("free");
    expect(e.plan).toBeNull();
    expect(e.ai).toBe(false);
    expect(e.seats).toBe(0);
    expect(e.storageBytes).toBe(UNLIMITED_STORAGE_BYTES);
    expect(e.recordingsPerPerson).toBe(FREE_TIER.recordingsPerPerson);
    expect(e.maxRecordingMs).toBe(FREE_TIER.maxRecordingMs);
    expect(e.maxRecordingBytes).toBe(FREE_TIER.maxRecordingBytes);
    expect(e.maxQuality).toBe("saver");
  });

  it("lifts the count, length and storage caps on Light but keeps data saver", () => {
    const e = resolveWorkspaceEntitlement({
      subscription: { quantity: 4, plan: "light" },
      memberCount: 4,
    });
    expect(e.tier).toBe("team");
    expect(e.plan).toBe("light");
    expect(e.ai).toBe(false);
    expect(e.seats).toBe(4);
    expect(e.storageBytes).toBe(UNLIMITED_STORAGE_BYTES);
    expect(e.recordingsPerPerson).toBeNull();
    expect(e.maxRecordingMs).toBeNull();
    expect(e.maxRecordingBytes).toBeNull();
    expect(e.maxQuality).toBe("saver");
  });

  it("lifts every cap on Pro and turns on the AI editing", () => {
    const e = resolveWorkspaceEntitlement({
      subscription: { quantity: 2, plan: "pro" },
      memberCount: 2,
    });
    expect(e.plan).toBe("pro");
    expect(e.ai).toBe(true);
    expect(e.maxQuality).toBeNull();
    expect(e.storageBytes).toBe(UNLIMITED_STORAGE_BYTES);
  });

  it("is unlimited when self-hosted", () => {
    const e = resolveWorkspaceEntitlement({
      subscription: null,
      memberCount: 9,
      selfHosted: true,
    });
    expect(e.tier).toBe("team");
    expect(e.plan).toBeNull();
    expect(e.ai).toBe(true);
    expect(e.storageBytes).toBe(UNLIMITED_STORAGE_BYTES);
    expect(e.maxRecordingBytes).toBeNull();
    expect(e.maxQuality).toBeNull();
  });

  it("never reports fewer than one seat", () => {
    expect(
      resolveWorkspaceEntitlement({
        subscription: { quantity: 0, plan: "light" },
        memberCount: 0,
      }).seats,
    ).toBe(1);
  });
});

describe("seat plans", () => {
  it("reads unknown stored plans as the cheaper one", () => {
    expect(hydrateSeatPlanId("pro")).toBe("pro");
    expect(hydrateSeatPlanId("business")).toBe("light");
    expect(hydrateSeatPlanId(undefined)).toBe("light");
  });

  it("multiplies the per-seat price by the seat count", () => {
    const light = getSeatPlan("light");
    const pro = getSeatPlan("pro");
    expect(seatPriceUsd(5, "monthly")).toBe(5 * light.priceMonthlyUsd);
    expect(seatPriceUsd(5, "annual", "pro")).toBe(
      5 * pro.priceAnnualUsdPerMonth,
    );
    expect(seatPriceUsd(0, "monthly", "pro")).toBe(pro.priceMonthlyUsd);
  });
});
