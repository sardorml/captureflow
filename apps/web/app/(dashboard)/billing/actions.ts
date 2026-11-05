"use server";

import { revalidatePath } from "next/cache";
import { isSeatPlanId } from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { switchWorkspacePlan } from "@/lib/billing/plan-switch";
import { getAppI18n } from "@/lib/i18n/app/server";
import { requireWorkspaceAccess } from "@/lib/workspace/access";

export async function switchPlanAction(
  plan: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const { messages: m } = await getAppI18n();
  const errors = m.billing.switchPlan.errors;
  if (!isSeatPlanId(plan)) return { ok: false, error: errors.unknownPlan };
  const access = await requireWorkspaceAccess("manage-workspace");
  if (!access.ok) return { ok: false, error: access.error };
  const env = await getAppWebEnv();
  if (!env) return { ok: false, error: errors.billingUnavailable };
  const result = await switchWorkspacePlan(
    { ...env, DB: access.db },
    { workspaceId: access.workspace.id, plan },
  );
  if (!result.ok) return { ok: false, error: errors[result.reason] };
  revalidatePath("/", "layout");
  return { ok: true };
}
