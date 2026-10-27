import {
  countWorkspaceMembers,
  countWorkspaceSeats,
  getActiveWorkspaceSubscription,
  getWorkspaceEntitlement,
  isSelfHosted,
  listMembers,
  setSubscriptionItemQuantity,
  setWorkspaceSubscriptionQuantity,
  totalStorageForWorkspace,
  type WorkspaceEntitlement,
  type WorkspaceSubscriptionRow,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { seatCheckoutBases, type SeatOffer } from "./seat-checkout";

export type WorkspaceSeatContext = {
  entitlement: WorkspaceEntitlement;
  subscription: WorkspaceSubscriptionRow | null;
  // People who record here, so the seats a Team plan bills for.
  memberCount: number;
  viewerCount: number;
  usedBytes: number;
  // Null when there is nothing to sell: self-hosted or already paid.
  offer: SeatOffer | null;
};

export async function getWorkspaceSeatContext(workspace: {
  id: string;
  name: string;
}): Promise<WorkspaceSeatContext | null> {
  const env = await getAppWebEnv();
  if (!env?.DB) return null;
  const selfHosted = isSelfHosted(env);
  const [entitlement, subscription, memberCount, everyone, usedBytes] =
    await Promise.all([
      getWorkspaceEntitlement(env.DB, workspace.id, { selfHosted }),
      getActiveWorkspaceSubscription(env.DB, workspace.id),
      countWorkspaceSeats(env.DB, workspace.id),
      countWorkspaceMembers(env.DB, workspace.id),
      totalStorageForWorkspace(env.DB, workspace.id),
    ]);
  const viewerCount = Math.max(0, everyone - memberCount);
  const sellable = !selfHosted && !subscription && entitlement.tier !== "team";
  const offer: SeatOffer | null = sellable
    ? {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        memberCount,
        people: (await listMembers(env.DB, workspace.id)).map((m) => ({
          userId: m.user_id,
          name: m.name,
          email: m.email,
          image: m.image,
          role: m.role,
        })),
        checkoutUrls: seatCheckoutBases(env),
      }
    : null;
  return {
    entitlement,
    subscription,
    memberCount,
    viewerCount,
    usedBytes,
    offer,
  };
}

/*
 * Pushes the member count to billing as the seat quantity after a join or a
 * leave. Best-effort by design: a failed call is logged and the member change
 * stands, since billing must never block someone joining a team. Without an
 * API key (local dev, self-hosted) it only reports what it would have done.
 */
export async function syncWorkspaceSeats(workspaceId: string): Promise<void> {
  const env = await getAppWebEnv();
  if (!env?.DB || isSelfHosted(env)) return;
  const subscription = await getActiveWorkspaceSubscription(
    env.DB,
    workspaceId,
  );
  if (!subscription) return;
  const seats = Math.max(1, await countWorkspaceSeats(env.DB, workspaceId));
  if (seats === subscription.quantity) return;

  if (!env.LEMON_API_KEY || !subscription.ls_subscription_item_id) {
    console.info(
      `[seats] workspace ${workspaceId}: would set quantity ${subscription.quantity} → ${seats} (no LEMON_API_KEY or item id)`,
    );
    return;
  }
  const result = await setSubscriptionItemQuantity({
    apiKey: env.LEMON_API_KEY,
    subscriptionItemId: subscription.ls_subscription_item_id,
    quantity: seats,
  });
  if (!result.ok) {
    console.error(
      `[seats] workspace ${workspaceId}: quantity update failed ${result.status}: ${result.body.slice(0, 200)}`,
    );
    return;
  }
  await setWorkspaceSubscriptionQuantity(
    env.DB,
    subscription.ls_subscription_id,
    seats,
  );
}
