/// <reference types="@cloudflare/workers-types" />

import { applyLimitOverrides, listLimitOverrides } from "./limit-overrides";
import {
  resolveWorkspaceEntitlement,
  type WorkspaceEntitlement,
} from "./seat-plans";
import { getActiveWorkspaceSubscription } from "./workspace-subscription";
import { countWorkspaceSeats } from "./workspaces";

/*
 * What a workspace may do right now: its seat subscription against the
 * members who hold seats. On the free tier the caps staff raised for the
 * workspace apply, and with `userId` so do the ones raised for that person.
 */
export async function getWorkspaceEntitlement(
  db: D1Database,
  workspaceId: string,
  options: { selfHosted?: boolean; userId?: string | null } = {},
): Promise<WorkspaceEntitlement> {
  const [subscription, memberCount] = await Promise.all([
    getActiveWorkspaceSubscription(db, workspaceId),
    countWorkspaceSeats(db, workspaceId),
  ]);
  const entitlement = resolveWorkspaceEntitlement({
    subscription: subscription
      ? { quantity: subscription.quantity, plan: subscription.plan }
      : null,
    memberCount,
    selfHosted: options.selfHosted,
  });
  if (entitlement.tier !== "free") return entitlement;
  return applyLimitOverrides(
    entitlement,
    await listLimitOverrides(db, { workspaceId, userId: options.userId }),
  );
}
