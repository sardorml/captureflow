"use server";

import { revalidatePath } from "next/cache";
import { isSeatPlanId } from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { switchWorkspacePlan } from "@/lib/billing/plan-switch";
import { requireWorkspaceAccess } from "@/lib/workspace/access";

export async function switchPlanAction(
  plan: unknown,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSeatPlanId(plan)) return { ok: false, error: "Unknown plan" };
  const access = await requireWorkspaceAccess("manage-workspace");
  if (!access.ok) return { ok: false, error: access.error };
  const env = await getAppWebEnv();
  if (!env) return { ok: false, error: "Billing is unavailable" };
  const result = await switchWorkspacePlan(
    { ...env, DB: access.db },
    { workspaceId: access.workspace.id, plan },
  );
  if (!result.ok) return result;
  revalidatePath("/", "layout");
  return { ok: true };
}
