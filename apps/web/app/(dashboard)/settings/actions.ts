"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getWorkspaceById,
  updateWorkspaceLogo,
  updateWorkspaceName,
  updateWorkspacePolicy,
} from "@captureflow/quota";
import { getAuth } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { deleteObject, putObject } from "@/lib/r2";
import { readImageUpload } from "@/lib/workspace-images";
import { hydrateWorkspaceName } from "@/lib/workspace-name";

// Every action re-verifies owner access server-side: a replayed action lands
// here directly and can't trust the UI hiding the page from members.

type FormState = { error: string | null; ok: string | null };

async function requireOwnerWorkspace(): Promise<{
  userId: string;
  workspaceId: string;
}> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  if (current.role !== "owner") {
    redirect("/recordings");
  }
  return { userId: session.user.id, workspaceId: current.workspace.id };
}

export async function updateWorkspaceNameAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { workspaceId } = await requireOwnerWorkspace();
  const env = await getAppWebEnv();
  if (!env?.DB) return { error: "Database unavailable", ok: null };

  const name = hydrateWorkspaceName(formData.get("name"));
  if (!name.ok) return { error: name.error, ok: null };

  const ok = await updateWorkspaceName(env.DB, workspaceId, name.name);
  if (!ok) return { error: "Couldn’t save — try again", ok: null };
  revalidatePath("/", "layout");
  return { error: null, ok: "Saved" };
}

export async function uploadWorkspaceLogoAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { workspaceId } = await requireOwnerWorkspace();
  const env = await getAppWebEnv();
  if (!env?.DB) return { error: "Database unavailable", ok: null };

  const image = await readImageUpload(formData.get("logo"), "Logo");
  if (!image.ok) return { error: image.error, ok: null };

  // Key on workspaceId so a same-extension re-upload overwrites in place; the
  // page appends updated_at to bust the CDN cache.
  const key = `workspace-logos/${workspaceId}.${image.ext}`;
  try {
    await putObject(key, image.buffer, image.mime, "public, max-age=86400");
  } catch (err) {
    return {
      error: `Upload failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
      ok: null,
    };
  }

  // Drop the prior key on a format swap so it doesn't orphan in the bucket.
  const existing = await getWorkspaceById(env.DB, workspaceId);
  if (existing?.logo_key && existing.logo_key !== key) {
    void deleteObject(existing.logo_key).catch(() => {});
  }

  const ok = await updateWorkspaceLogo(env.DB, workspaceId, key);
  if (!ok) return { error: "Couldn’t save — try again", ok: null };
  revalidatePath("/", "layout");
  return { error: null, ok: "Logo updated" };
}

export async function removeWorkspaceLogoAction(): Promise<void> {
  const { workspaceId } = await requireOwnerWorkspace();
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  const existing = await getWorkspaceById(env.DB, workspaceId);
  if (existing?.logo_key) {
    void deleteObject(existing.logo_key).catch(() => {});
  }
  await updateWorkspaceLogo(env.DB, workspaceId, null);
  revalidatePath("/", "layout");
}

export async function setPublicLinksPolicyAction(
  formData: FormData,
): Promise<void> {
  const { workspaceId } = await requireOwnerWorkspace();
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  const value = formData.get("allow_public_links");
  await updateWorkspacePolicy(env.DB, workspaceId, {
    allowPublicLinks: value === "1",
  });
  revalidatePath("/settings");
}

export async function setMemberUploadsPolicyAction(
  formData: FormData,
): Promise<void> {
  const { workspaceId } = await requireOwnerWorkspace();
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  const value = formData.get("allow_member_uploads");
  await updateWorkspacePolicy(env.DB, workspaceId, {
    allowMemberUploads: value === "1",
  });
  revalidatePath("/settings");
}
