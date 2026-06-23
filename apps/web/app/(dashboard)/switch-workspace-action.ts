"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { listWorkspacesForUser } from "@captureflow/quota";
import { getAuth } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";
import { CURRENT_WORKSPACE_COOKIE } from "@/lib/current-workspace";

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

  const store = await cookies();
  store.set(CURRENT_WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    sameSite: "lax",
    secure: true,
    // No HttpOnly: it's a preference, not a credential, and client code reads it.
    // 30-day max-age matches the better-auth session lifetime.
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/shares");
  revalidatePath("/snaps");
  revalidatePath("/members");
  revalidatePath("/devices");
}
