import { UNLIMITED_STORAGE_BYTES } from "./limits";

const MB = 1024 * 1024;
const GB = 1024 * MB;

/*
 * Per-seat pricing. A workspace is the billing unit; every member is a seat.
 * Paid seats pool their storage. The free tier has no storage pool: its space
 * is bounded by a recording count, a length and a per-recording byte ceiling
 * sized for the data saver preset.
 */
export const SEAT_PLAN = {
  name: "Team + AI",
  priceMonthlyUsd: 10,
  priceAnnualUsdPerMonth: 8,
  storageBytesPerSeat: 20 * GB,
} as const;

export const SEAT_ANNUAL_SAVING_PERCENT = Math.round(
  (1 - SEAT_PLAN.priceAnnualUsdPerMonth / SEAT_PLAN.priceMonthlyUsd) * 100,
);

export type FreeQuality = "saver";

/*
 * maxRecordingBytes covers five minutes at the data saver ceilings in
 * packages/engine/src/quality.ts (750 kbps screen + 48 kbps audio, 200 kbps
 * webcam + 48 kbps audio ≈ 39 MB) with room for container overhead; the
 * recorder stops on the same number.
 */
export const FREE_TIER = {
  recordingsPerPerson: 25,
  maxRecordingMs: 5 * 60 * 1000,
  maxRecordingBytes: 50 * MB,
  quality: "saver" as FreeQuality,
} as const;

export type WorkspaceTier = "free" | "team";

export type WorkspaceEntitlement = {
  tier: WorkspaceTier;
  seats: number;
  storageBytes: number;
  // Free-tier caps, null once paid.
  recordingsPerPerson: number | null;
  maxRecordingMs: number | null;
  maxRecordingBytes: number | null;
  maxQuality: FreeQuality | null;
};

export type SeatSubscriptionInput = {
  quantity: number;
};

const UNCAPPED = {
  recordingsPerPerson: null,
  maxRecordingMs: null,
  maxRecordingBytes: null,
  maxQuality: null,
} as const;

export function resolveWorkspaceEntitlement(input: {
  subscription: SeatSubscriptionInput | null;
  memberCount: number;
  selfHosted?: boolean;
}): WorkspaceEntitlement {
  if (input.selfHosted) {
    return {
      tier: "team",
      seats: Math.max(1, input.memberCount),
      storageBytes: UNLIMITED_STORAGE_BYTES,
      ...UNCAPPED,
    };
  }

  const seats = input.subscription
    ? Math.max(1, input.subscription.quantity)
    : 0;
  if (seats > 0) {
    return {
      tier: "team",
      seats,
      storageBytes: seats * SEAT_PLAN.storageBytesPerSeat,
      ...UNCAPPED,
    };
  }
  return {
    tier: "free",
    seats: 0,
    storageBytes: UNLIMITED_STORAGE_BYTES,
    recordingsPerPerson: FREE_TIER.recordingsPerPerson,
    maxRecordingMs: FREE_TIER.maxRecordingMs,
    maxRecordingBytes: FREE_TIER.maxRecordingBytes,
    maxQuality: FREE_TIER.quality,
  };
}

export function seatPriceUsd(
  seats: number,
  cycle: "monthly" | "annual",
): number {
  const perSeat =
    cycle === "annual"
      ? SEAT_PLAN.priceAnnualUsdPerMonth
      : SEAT_PLAN.priceMonthlyUsd;
  return Math.max(1, seats) * perSeat;
}
