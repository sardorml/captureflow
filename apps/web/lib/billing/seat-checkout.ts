import type { SeatPlanId, WorkspaceRole } from "@captureflow/quota";

export type SeatPerson = {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: WorkspaceRole;
};

// Client-safe: what the upgrade dialog needs to sell seats for one workspace.
export type SeatOffer = {
  workspaceId: string;
  workspaceName: string;
  memberCount: number;
  people: SeatPerson[];
  // Null until the plan's NEXT_PUBLIC_LEMON_*_CHECKOUT_URL is set; the dialog
  // then shows the price without a working button.
  checkoutUrls: Record<SeatPlanId, string | null>;
};

export type SeatCycle = "monthly" | "annual";

/*
 * The billing checkout link with the seat count and the workspace attached.
 * `checkout[custom][workspace_id]` is how the webhook tells a workspace
 * subscription from a per-user one; `quantity` prefills the seat count on a
 * variant with quantity enabled.
 */
export function seatCheckoutUrl(input: {
  base: string;
  email: string;
  userId: string;
  workspaceId: string;
  plan: SeatPlanId;
  seats: number;
}): string {
  const u = new URL(input.base);
  if (input.email) u.searchParams.set("checkout[email]", input.email);
  u.searchParams.set("checkout[custom][user_id]", input.userId);
  u.searchParams.set("checkout[custom][workspace_id]", input.workspaceId);
  u.searchParams.set("checkout[custom][plan]", input.plan);
  u.searchParams.set("quantity", String(Math.max(1, input.seats)));
  return u.toString();
}

// Spelled out per plan: Next inlines NEXT_PUBLIC_* only when the name is literal.
export function seatCheckoutBases(): Record<SeatPlanId, string | null> {
  return {
    light: process.env.NEXT_PUBLIC_LEMON_LIGHT_CHECKOUT_URL || null,
    pro: process.env.NEXT_PUBLIC_LEMON_PRO_CHECKOUT_URL || null,
  };
}
