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

// Null when there is nothing to sell: self-hosted, subscribed, or granted.
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
  return {
    usedBytes,
    limitBytes:
      limits.storageBytes >= UNLIMITED_STORAGE_BYTES
        ? null
        : limits.storageBytes,
  };
}
