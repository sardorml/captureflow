/// <reference types="@cloudflare/workers-types" />

import { applyDueDowngrades, listPaidWorkspaceIds } from "@captureflow/quota";
import { syncSeatsWithBilling, type SeatSyncEnv } from "./seat-sync";

/*
 * Daily, on the worker's `0 4 * * *` cron: members whose paid seat ran out
 * become viewers, then every paid workspace's seat count is pushed to
 * billing again, which also retries any sync that failed during the day.
 */
export async function runDailySeatSync(env: SeatSyncEnv): Promise<void> {
  const downgraded = await applyDueDowngrades(env.DB, Date.now());
  const paid = await listPaidWorkspaceIds(env.DB);
  for (const workspaceId of new Set([...downgraded, ...paid])) {
    try {
      await syncSeatsWithBilling(env, workspaceId);
    } catch (err) {
      console.warn(`[cron] seat sync failed for ${workspaceId}:`, err);
    }
  }
}
