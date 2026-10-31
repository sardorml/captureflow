import { describe, expect, it } from "vitest";
import {
  FREE_TIER,
  VOICEOVER_CHARS_PER_MINUTE,
  agentAllowanceLeft,
  startOfMonthUtc,
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

describe("agent allowances", () => {
  it("give each free person minutes but no voiceover", () => {
    const e = resolveWorkspaceEntitlement({
      subscription: null,
      memberCount: 3,
    });
    expect(e.agentMinutes).toBe(FREE_TIER.agentMinutesPerPerson * 3);
    expect(e.voiceoverMinutes).toBe(0);
  });

  it("scale with seats on paid plans", () => {
    const pro = getSeatPlan("pro");
    const e = resolveWorkspaceEntitlement({
      subscription: { quantity: 2, plan: "pro" },
      memberCount: 2,
    });
    expect(e.agentMinutes).toBe(pro.agentMinutesPerSeat * 2);
    expect(e.voiceoverMinutes).toBe(pro.voiceoverMinutesPerSeat * 2);
  });

  it("are unlimited when self-hosted", () => {
    const e = resolveWorkspaceEntitlement({
      subscription: null,
      memberCount: 1,
      selfHosted: true,
    });
    expect(
      agentAllowanceLeft(e, { agentMs: 1e12, narratedChars: 1e9 }),
    ).toEqual({ agentMs: null, voiceoverChars: null });
  });

  it("subtract this month's use and never go below zero", () => {
    expect(
      agentAllowanceLeft(
        { agentMinutes: 10, voiceoverMinutes: 2 },
        { agentMs: 4 * 60_000, narratedChars: 5 * VOICEOVER_CHARS_PER_MINUTE },
      ),
    ).toEqual({ agentMs: 6 * 60_000, voiceoverChars: 0 });
  });

  it("reset on the first of the month, in UTC", () => {
    expect(startOfMonthUtc(Date.UTC(2026, 9, 31, 23, 59))).toBe(
      Date.UTC(2026, 9, 1),
    );
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
