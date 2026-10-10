import { describe, expect, it } from "vitest";
import { STORAGE_PLANS, storageBytesForVariant } from "@captureflow/quota";
import { MANAGED_TIERS } from "@/lib/marketing/constants";

const GB = 1024 * 1024 * 1024;

describe("storage plans", () => {
  it("gives each variant the storage it sells", () => {
    expect(storageBytesForVariant("1849420")).toBe(100 * GB);
    expect(storageBytesForVariant("1849425")).toBe(500 * GB);
    expect(storageBytesForVariant("1828191")).toBe(1024 * GB);
  });

  it("falls back to the smallest paid plan for an unknown variant", () => {
    expect(storageBytesForVariant("999")).toBe(100 * GB);
  });

  it("sells exactly the plans the quota enforces", () => {
    expect(MANAGED_TIERS.map((t) => t.variantId)).toEqual(
      STORAGE_PLANS.map((p) => p.variantId),
    );
    for (const tier of MANAGED_TIERS) {
      expect(tier.checkoutUrl).toMatch(/^https:\/\/.+\/checkout\/buy\//);
    }
  });
});
