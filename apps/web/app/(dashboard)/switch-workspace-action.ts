"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  listWorkspacesForUser,
  setCurrentWorkspaceId,
} from "@captureflow/quota";
import { getAuth } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";

export async function switchWorkspaceAction(formData: FormData): Promise<void> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const env = await getAppWebEnv();
  if (!env?.DB) return;

  const workspaceId = formData.get("workspaceId");
  if (typeof workspaceId !== "string" || !workspaceId) return;

  // Verify membership: a forged submission could otherwise leak rows from a
  // workspace the user isn't in.
  const memberships = await listWorkspacesForUser(env.DB, session.user.id);
  const allowed = memberships.some((m) => m.workspace_id === workspaceId);
  if (!allowed) return;

  // On the account, not in a cookie: uploads from the extension and the desktop
  // app carry a device token and no cookies, so a browser-only preference left
  // them writing to the personal workspace whatever the switcher said.
  await setCurrentWorkspaceId(env.DB, session.user.id, workspaceId);

  revalidatePath("/recordings");
  revalidatePath("/screenshots");
  revalidatePath("/members");
  revalidatePath("/devices");
}
