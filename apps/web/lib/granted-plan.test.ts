import { describe, expect, it } from "vitest";
import {
  ACCOUNT_LIMITS,
  isGrantActive,
  resolveEffectiveLimits,
} from "@captureflow/quota";

const GB = 1024 * 1024 * 1024;
const NOW = 1_800_000_000_000;
const PLAN_100 = "1849420";
const PLAN_500 = "1849425";

const base = {
  storageBytesOverride: null,
  subscriptionVariantId: null,
  grant: null,
  nowMs: NOW,
};

describe("granted plans", () => {
  it("leaves a free account on the free cap", () => {
    expect(resolveEffectiveLimits(base)).toEqual({
      storageBytes: ACCOUNT_LIMITS.totalStorageBytes,
      proSubscriptionActive: false,
    });
  });

  it("gives a grant the storage of its plan and counts it as Pro", () => {
    expect(
      resolveEffectiveLimits({
        ...base,
        grant: { variantId: PLAN_500, expiresAt: null },
      }),
    ).toEqual({ storageBytes: 500 * GB, proSubscriptionActive: true });
  });

  it("ignores a grant once it has expired", () => {
    const grant = { variantId: PLAN_500, expiresAt: NOW - 1 };
    expect(isGrantActive(grant, NOW)).toBe(false);
    expect(resolveEffectiveLimits({ ...base, grant })).toEqual({
      storageBytes: ACCOUNT_LIMITS.totalStorageBytes,
      proSubscriptionActive: false,
    });
  });

  it("keeps a grant until its expiry", () => {
    expect(
      isGrantActive({ variantId: PLAN_100, expiresAt: NOW + 1 }, NOW),
    ).toBe(true);
  });

  it("takes the larger of a subscription and a grant", () => {
    expect(
      resolveEffectiveLimits({
        ...base,
        subscriptionVariantId: PLAN_100,
        grant: { variantId: PLAN_500, expiresAt: null },
      }).storageBytes,
    ).toBe(500 * GB);
    expect(
      resolveEffectiveLimits({
        ...base,
        subscriptionVariantId: PLAN_500,
        grant: { variantId: PLAN_100, expiresAt: null },
      }).storageBytes,
    ).toBe(500 * GB);
  });

  it("lets a storage override win over any plan", () => {
    expect(
      resolveEffectiveLimits({
        ...base,
        storageBytesOverride: 3 * GB,
        subscriptionVariantId: PLAN_500,
        grant: { variantId: PLAN_100, expiresAt: null },
      }),
    ).toEqual({ storageBytes: 3 * GB, proSubscriptionActive: true });
  });
});
