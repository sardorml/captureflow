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
  checkoutUrls: SeatCheckoutUrls;
};

export type SeatCycle = "monthly" | "annual";

// A paid workspace's seats as the members page and invites price them.
export type PaidSeats = {
  plan: SeatPlanId;
  cycle: SeatCycle;
  seats: number;
  periodEnd: number | null;
};

// Lemon Squeezy's buy links are per variant, so each plan and cycle has its own.
export type SeatCheckoutUrls = Record<
  SeatPlanId,
  Record<SeatCycle, string | null>
>;

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

type CheckoutEnv = Partial<
  Record<
    `NEXT_PUBLIC_LEMON_${"LIGHT" | "PRO"}_${"MONTHLY" | "ANNUAL"}_CHECKOUT_URL`,
    string
  >
>;

// Read from the request's worker env, not process.env, so a deploy's vars
// apply without a rebuild.
export function seatCheckoutBases(env: CheckoutEnv): SeatCheckoutUrls {
  return {
    light: {
      monthly: env.NEXT_PUBLIC_LEMON_LIGHT_MONTHLY_CHECKOUT_URL || null,
      annual: env.NEXT_PUBLIC_LEMON_LIGHT_ANNUAL_CHECKOUT_URL || null,
    },
    pro: {
      monthly: env.NEXT_PUBLIC_LEMON_PRO_MONTHLY_CHECKOUT_URL || null,
      annual: env.NEXT_PUBLIC_LEMON_PRO_ANNUAL_CHECKOUT_URL || null,
    },
  };
}
