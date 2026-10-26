import { describe, expect, it } from "vitest";
import { UNLIMITED_STORAGE_BYTES } from "@captureflow/quota";
import { UPGRADE_BANNER_FROM_BYTES, upgradeOfferFor } from "./upgrade-offer";

const MB = 1024 * 1024;

describe("upgradeOfferFor", () => {
  it("stays quiet under 100 MB", () => {
    expect(upgradeOfferFor(UPGRADE_BANNER_FROM_BYTES - 1, 200 * MB)).toBeNull();
    expect(upgradeOfferFor(0, 200 * MB)).toBeNull();
  });

  it("offers from 100 MB with the limit", () => {
    expect(upgradeOfferFor(100 * MB, 200 * MB)).toEqual({
      usedBytes: 100 * MB,
      limitBytes: 200 * MB,
    });
  });

  it("reports no limit for unlimited storage", () => {
    expect(upgradeOfferFor(150 * MB, UNLIMITED_STORAGE_BYTES)).toEqual({
      usedBytes: 150 * MB,
      limitBytes: null,
    });
  });
});
