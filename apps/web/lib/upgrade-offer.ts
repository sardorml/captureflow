import {
  getActiveGrantedPlan,
  getActiveProSubscription,
  getEffectiveLimitsForUser,
  isSelfHosted,
  totalStorageForUser,
  UNLIMITED_STORAGE_BYTES,
} from "@captureflow/quota";
import { getAppWebEnv } from "./cf-env";

export type UpgradeOffer = { usedBytes: number; limitBytes: number | null };

// Below this the banner would nag someone who has barely started.
export const UPGRADE_BANNER_FROM_BYTES = 100 * 1024 * 1024;

export function upgradeOfferFor(
  usedBytes: number,
  limitBytes: number,
): UpgradeOffer | null {
  if (usedBytes < UPGRADE_BANNER_FROM_BYTES) return null;
  return {
    usedBytes,
    limitBytes: limitBytes >= UNLIMITED_STORAGE_BYTES ? null : limitBytes,
  };
}

// Null when there is nothing to sell: self-hosted, subscribed, granted, or
// still well inside the free plan.
export async function getUpgradeOffer(
  userId: string,
): Promise<UpgradeOffer | null> {
  const env = await getAppWebEnv();
  if (!env?.DB || isSelfHosted(env)) return null;
  const [subscription, grant, usedBytes, limits] = await Promise.all([
    getActiveProSubscription(env.DB, userId),
    getActiveGrantedPlan(env.DB, userId),
    totalStorageForUser(env.DB, userId),
    getEffectiveLimitsForUser(env.DB, userId),
  ]);
  if (subscription?.status === "active" || grant !== null) return null;
  return upgradeOfferFor(usedBytes, limits.storageBytes);
}
