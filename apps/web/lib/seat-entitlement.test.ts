import { describe, expect, it } from "vitest";
import {
  FREE_TIER,
  SEAT_PLANS,
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
    expect(e.seats).toBe(0);
    expect(e.storageBytes).toBe(UNLIMITED_STORAGE_BYTES);
    expect(e.recordingsPerPerson).toBe(FREE_TIER.recordingsPerPerson);
    expect(e.maxRecordingMs).toBe(FREE_TIER.maxRecordingMs);
    expect(e.maxRecordingBytes).toBe(FREE_TIER.maxRecordingBytes);
    expect(e.maxQuality).toBe("saver");
  });

  it("pools storage per paid seat at the plan's rate and lifts the caps", () => {
    for (const plan of SEAT_PLANS) {
      const e = resolveWorkspaceEntitlement({
        subscription: { quantity: 4, plan: plan.id },
        memberCount: 4,
      });
      expect(e.tier).toBe("team");
      expect(e.plan).toBe(plan.id);
      expect(e.seats).toBe(4);
      expect(e.storageBytes).toBe(4 * plan.storageBytesPerSeat);
      expect(e.recordingsPerPerson).toBeNull();
      expect(e.maxRecordingMs).toBeNull();
      expect(e.maxRecordingBytes).toBeNull();
      expect(e.maxQuality).toBeNull();
    }
  });

  it("is unlimited when self-hosted", () => {
    const e = resolveWorkspaceEntitlement({
      subscription: null,
      memberCount: 9,
      selfHosted: true,
    });
    expect(e.tier).toBe("team");
    expect(e.plan).toBeNull();
    expect(e.storageBytes).toBe(UNLIMITED_STORAGE_BYTES);
    expect(e.maxRecordingBytes).toBeNull();
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
