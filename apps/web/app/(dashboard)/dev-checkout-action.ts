"use server";

import { revalidatePath } from "next/cache";
import {
  countWorkspaceSeats,
  hydrateAssignableRole,
  hydrateSeatPlanId,
  upsertWorkspaceSubscription,
} from "@captureflow/quota";
import { DEV_SUBSCRIPTION_PREFIX } from "@/lib/billing/seat-sync";
import { changeMemberRole } from "@/lib/workspace/membership";
import { requireWorkspaceAccess } from "@/lib/workspace/access";

const DAY_S = 86_400;

// Local testing only: does what a paid checkout and its webhook would, so the
// upgrade can be tried without Lemon Squeezy. Production builds refuse it.
export async function fakeCheckoutAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  if (process.env.NODE_ENV !== "development") {
    return { ok: false, error: "Fake checkout only runs under next dev" };
  }
  const access = await requireWorkspaceAccess("manage-members");
  if (!access.ok) return { ok: false, error: access.error };

  const plan = hydrateSeatPlanId(formData.get("plan"));
  const cycle = formData.get("cycle") === "annual" ? "annual" : "monthly";
  let picks: Record<string, unknown> = {};
  try {
    const raw: unknown = JSON.parse(String(formData.get("picks") ?? "{}"));
    if (raw && typeof raw === "object") picks = raw as Record<string, unknown>;
  } catch {
    return { ok: false, error: "Malformed seat picks" };
  }

  for (const [userId, role] of Object.entries(picks)) {
    if (userId === access.userId) continue;
    await changeMemberRole(access.db, {
      workspaceId: access.workspace.id,
      userId,
      role: hydrateAssignableRole(role),
      actorUserId: access.userId,
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const seats = Math.max(
    1,
    await countWorkspaceSeats(access.db, access.workspace.id),
  );
  await upsertWorkspaceSubscription(access.db, {
    ls_subscription_id: `${DEV_SUBSCRIPTION_PREFIX}${access.workspace.id}`,
    ls_subscription_item_id: null,
    workspace_id: access.workspace.id,
    ls_variant_id: `${DEV_SUBSCRIPTION_PREFIX}${plan}-${cycle}`,
    ls_customer_id: null,
    ls_customer_email: access.email,
    status: "active",
    plan,
    cycle,
    quantity: seats,
    current_period_end: now + (cycle === "annual" ? 365 : 30) * DAY_S,
    cancelled_at: null,
    card_brand: "visa",
    card_last_four: "4242",
    portal_url: null,
    update_payment_url: null,
    now,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
