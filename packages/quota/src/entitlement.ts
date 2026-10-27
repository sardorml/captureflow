/// <reference types="@cloudflare/workers-types" />

import {
  resolveWorkspaceEntitlement,
  type WorkspaceEntitlement,
} from "./seat-plans";
import { getActiveWorkspaceSubscription } from "./workspace-subscription";
import { countWorkspaceSeats } from "./workspaces";

// What a workspace may do right now: its seat subscription against the
// members who hold seats.
export async function getWorkspaceEntitlement(
  db: D1Database,
  workspaceId: string,
  options: { selfHosted?: boolean } = {},
): Promise<WorkspaceEntitlement> {
  const [subscription, memberCount] = await Promise.all([
    getActiveWorkspaceSubscription(db, workspaceId),
    countWorkspaceSeats(db, workspaceId),
  ]);
  return resolveWorkspaceEntitlement({
    subscription: subscription
      ? { quantity: subscription.quantity, plan: subscription.plan }
      : null,
    memberCount,
    selfHosted: options.selfHosted,
  });
}
