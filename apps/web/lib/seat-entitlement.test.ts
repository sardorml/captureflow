import { describe, expect, it } from "vitest";
import {
  FREE_TIER,
  SEAT_PLAN,
  UNLIMITED_STORAGE_BYTES,
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
    expect(e.seats).toBe(0);
    expect(e.storageBytes).toBe(UNLIMITED_STORAGE_BYTES);
    expect(e.recordingsPerPerson).toBe(FREE_TIER.recordingsPerPerson);
    expect(e.maxRecordingMs).toBe(FREE_TIER.maxRecordingMs);
    expect(e.maxRecordingBytes).toBe(FREE_TIER.maxRecordingBytes);
    expect(e.maxQuality).toBe("saver");
  });

  it("pools storage per paid seat and lifts the caps", () => {
    const e = resolveWorkspaceEntitlement({
      subscription: { quantity: 4 },
      memberCount: 4,
    });
    expect(e.tier).toBe("team");
    expect(e.seats).toBe(4);
    expect(e.storageBytes).toBe(4 * SEAT_PLAN.storageBytesPerSeat);
    expect(e.recordingsPerPerson).toBeNull();
    expect(e.maxRecordingMs).toBeNull();
    expect(e.maxRecordingBytes).toBeNull();
    expect(e.maxQuality).toBeNull();
  });

  it("is unlimited when self-hosted", () => {
    const e = resolveWorkspaceEntitlement({
      subscription: null,
      memberCount: 9,
      selfHosted: true,
    });
    expect(e.tier).toBe("team");
    expect(e.storageBytes).toBe(UNLIMITED_STORAGE_BYTES);
    expect(e.maxRecordingBytes).toBeNull();
  });

  it("never reports fewer than one seat", () => {
    expect(
      resolveWorkspaceEntitlement({
        subscription: { quantity: 0 },
        memberCount: 0,
      }).seats,
    ).toBe(1);
  });
});

describe("seatPriceUsd", () => {
  it("multiplies the per-seat price by the seat count", () => {
    expect(seatPriceUsd(5, "monthly")).toBe(5 * SEAT_PLAN.priceMonthlyUsd);
    expect(seatPriceUsd(5, "annual")).toBe(
      5 * SEAT_PLAN.priceAnnualUsdPerMonth,
    );
    expect(seatPriceUsd(0, "monthly")).toBe(SEAT_PLAN.priceMonthlyUsd);
  });
});
