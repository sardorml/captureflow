import type { WorkspaceRole } from "@captureflow/quota";

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
  // Null until NEXT_PUBLIC_LEMON_SEAT_CHECKOUT_URL is set; the dialog then
  // shows the price without a working button.
  checkoutUrl: string | null;
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
  seats: number;
}): string {
  const u = new URL(input.base);
  if (input.email) u.searchParams.set("checkout[email]", input.email);
  u.searchParams.set("checkout[custom][user_id]", input.userId);
  u.searchParams.set("checkout[custom][workspace_id]", input.workspaceId);
  u.searchParams.set("quantity", String(Math.max(1, input.seats)));
  return u.toString();
}

export function seatCheckoutBase(): string | null {
  return process.env.NEXT_PUBLIC_LEMON_SEAT_CHECKOUT_URL || null;
}
