import {
  countWorkspaceMembers,
  countWorkspaceSeats,
  getActiveWorkspaceSubscription,
  getWorkspaceEntitlement,
  DEFAULT_SEAT_PLAN_ID,
  isSelfHosted,
  listMembers,
  totalStorageForWorkspace,
  type WorkspaceEntitlement,
  type WorkspaceSubscriptionRow,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import {
  seatCheckoutBases,
  type PaidSeats,
  type SeatOffer,
} from "./seat-checkout";
import { syncSeatsWithBilling } from "./seat-sync";

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

export function paidSeatsOf(
  context: WorkspaceSeatContext | null,
): PaidSeats | null {
  if (!context?.subscription || context.entitlement.tier !== "team") {
    return null;
  }
  return {
    plan: context.entitlement.plan ?? DEFAULT_SEAT_PLAN_ID,
    cycle: context.subscription.cycle,
    seats: context.memberCount,
    periodEnd: context.subscription.current_period_end,
  };
}

export async function syncWorkspaceSeats(workspaceId: string): Promise<void> {
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  await syncSeatsWithBilling({ ...env, DB: env.DB }, workspaceId);
}
