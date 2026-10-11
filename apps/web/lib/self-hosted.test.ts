import { describe, expect, it } from "vitest";
import {
  isSelfHosted,
  resolveEffectiveLimits,
  UNLIMITED_STORAGE_BYTES,
} from "@captureflow/quota";

const base = {
  storageBytesOverride: null,
  subscriptionVariantId: null,
  grant: null,
  nowMs: 1_800_000_000_000,
};

describe("isSelfHosted", () => {
  it("is on only for the exact string true", () => {
    expect(isSelfHosted({ SELF_HOSTED: "true" })).toBe(true);
    expect(isSelfHosted({ SELF_HOSTED: "1" })).toBe(false);
    expect(isSelfHosted({})).toBe(false);
    expect(isSelfHosted(null)).toBe(false);
  });
});

describe("resolveEffectiveLimits when self-hosted", () => {
  it("lifts the default cap", () => {
    expect(
      resolveEffectiveLimits({ ...base, selfHosted: true }).storageBytes,
    ).toBe(UNLIMITED_STORAGE_BYTES);
  });

  it("still honors an admin's per-user override", () => {
    expect(
      resolveEffectiveLimits({
        ...base,
        storageBytesOverride: 5 * 1024 ** 3,
        selfHosted: true,
      }).storageBytes,
    ).toBe(5 * 1024 ** 3);
  });

  it("survives a JSON round trip as a number", () => {
    const limits = resolveEffectiveLimits({ ...base, selfHosted: true });
    expect(JSON.parse(JSON.stringify(limits)).storageBytes).toBe(
      UNLIMITED_STORAGE_BYTES,
    );
  });
});
