import { describe, expect, it } from "vitest";
import {
  FREE_TIER,
  resolveWorkspaceEntitlement,
  UNLIMITED_STORAGE_BYTES,
} from "@captureflow/quota";
import { budgetFromEntitlement } from "./quota";
import { exceedsQuality } from "./limits";

const free = resolveWorkspaceEntitlement({
  subscription: null,
  memberCount: 1,
});
const team = resolveWorkspaceEntitlement({
  subscription: { quantity: 2, plan: "light" },
  memberCount: 2,
});

// The data saver ceilings in packages/engine/src/quality.ts: screen video and
// audio, webcam video and audio.
const SAVER_CEILING_BPS = 750_000 + 48_000 + 200_000 + 48_000;

describe("budgetFromEntitlement", () => {
  it("caps a free recording by its own bytes, camera included", () => {
    const budget = budgetFromEntitlement(
      free,
      { sizeBytes: 30 * 1024 * 1024, webcamSizeBytes: 5 * 1024 * 1024 },
      999,
    );
    expect(budget).toEqual({
      kind: "recording",
      used: 35 * 1024 * 1024,
      limit: FREE_TIER.maxRecordingBytes,
    });
  });

  it("leaves a paid recording without a storage cap", () => {
    const budget = budgetFromEntitlement(
      team,
      { sizeBytes: 1, webcamSizeBytes: 1 },
      7_000,
    );
    expect(budget).toEqual({
      kind: "storage",
      used: 7_000,
      limit: UNLIMITED_STORAGE_BYTES,
    });
  });
});

// The ceiling has to hold a full-length data saver recording with the camera
// on at the encoder ceilings, or the recorder would stop early on free.
describe("FREE_TIER.maxRecordingBytes", () => {
  it("fits five minutes at the data saver ceilings with a camera", () => {
    const seconds = FREE_TIER.maxRecordingMs / 1000;
    const atCeiling = (SAVER_CEILING_BPS / 8) * seconds;
    expect(atCeiling).toBeLessThan(FREE_TIER.maxRecordingBytes);
    expect(FREE_TIER.maxRecordingBytes).toBeLessThan(atCeiling * 1.5);
  });
});

describe("exceedsQuality", () => {
  it("refuses only a declared preset above the cap", () => {
    expect(exceedsQuality("high", "saver")).toBe(true);
    expect(exceedsQuality("saver", "saver")).toBe(false);
    expect(exceedsQuality(null, "saver")).toBe(false);
    expect(exceedsQuality("max", null)).toBe(false);
  });
});
