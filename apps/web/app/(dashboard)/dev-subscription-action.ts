"use server";

import { revalidatePath } from "next/cache";
import {
  countWorkspaceSeats,
  deleteWorkspaceSubscription,
  getWorkspaceSubscriptionById,
  upsertWorkspaceSubscription,
} from "@captureflow/quota";
import { DEV_SUBSCRIPTION_PREFIX } from "@/lib/billing/seat-sync";
import {
  type SubscriptionOverride,
  hydrateOverride,
  overrideRowFields,
  readOverride,
} from "@/lib/dev/subscription-override";
import { loadSession } from "@/lib/session-guard";
import { requireWorkspaceAccess } from "@/lib/workspace/access";

export type DevSubscriptionState =
  | { ok: true; workspaceName: string; override: SubscriptionOverride | null }
  | { ok: false; error: string };

// Local testing only. The override is a dev subscription row of its own, so
// every plan check (the app, the extension, the agent recorder) sees it, and
// clearing it leaves a fake checkout's row alone.
const overrideId = (workspaceId: string) =>
  `${DEV_SUBSCRIPTION_PREFIX}override-${workspaceId}`;

async function devAccess() {
  if (process.env.NODE_ENV !== "development") {
    return { ok: false as const, error: "Only runs under next dev" };
  }
  if (!(await loadSession())) {
    return { ok: false as const, error: "Sign in to a workspace to use this" };
  }
  return requireWorkspaceAccess("manage-members");
}

export async function getDevSubscriptionAction(): Promise<DevSubscriptionState> {
  const access = await devAccess();
  if (!access.ok) return { ok: false, error: access.error };
  const row = await getWorkspaceSubscriptionById(
    access.db,
    overrideId(access.workspace.id),
  );
  return {
    ok: true,
    workspaceName: access.workspace.name,
    override: readOverride(row),
  };
}

export async function setDevSubscriptionAction(
  formData: FormData,
): Promise<DevSubscriptionState> {
  const access = await devAccess();
  if (!access.ok) return { ok: false, error: access.error };
  const id = overrideId(access.workspace.id);
  const override = hydrateOverride(
    formData.get("plan"),
    formData.get("status"),
  );
  if (!override) {
    await deleteWorkspaceSubscription(access.db, id);
  } else {
    const now = Math.floor(Date.now() / 1000);
    const fields = overrideRowFields(override, now);
    await upsertWorkspaceSubscription(access.db, {
      ls_subscription_id: id,
      ls_subscription_item_id: null,
      workspace_id: access.workspace.id,
      ls_variant_id: `${DEV_SUBSCRIPTION_PREFIX}${fields.plan}-monthly`,
      ls_customer_id: null,
      ls_customer_email: access.email,
      cycle: "monthly",
      quantity: Math.max(
        1,
        await countWorkspaceSeats(access.db, access.workspace.id),
      ),
      card_brand: "visa",
      card_last_four: "4242",
      portal_url: null,
      update_payment_url: null,
      now,
      ...fields,
    });
  }
  revalidatePath("/", "layout");
  return { ok: true, workspaceName: access.workspace.name, override };
}
