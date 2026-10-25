"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createTeamWorkspace, setCurrentWorkspaceId } from "@captureflow/quota";
import { getAuth } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";
import { hydrateWorkspaceName } from "@/lib/workspace-name";

type FormState = { error: string | null; ok: string | null };

// Any signed-in user may start a workspace and becomes its owner. It becomes
// the default straight away: the next capture goes there, and the page the
// user lands on shows it.
export async function createWorkspaceAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const env = await getAppWebEnv();
  if (!env?.DB) return { error: "Database unavailable", ok: null };

  const name = hydrateWorkspaceName(formData.get("name"));
  if (!name.ok) return { error: name.error, ok: null };

  try {
    const workspace = await createTeamWorkspace(env.DB, {
      ownerUserId: session.user.id,
      name: name.name,
    });
    await setCurrentWorkspaceId(env.DB, session.user.id, workspace.id);
    revalidatePath("/", "layout");
    return { error: null, ok: workspace.id };
  } catch {
    return { error: "Couldn’t create the workspace — try again", ok: null };
  }
}
