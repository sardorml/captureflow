"use server";

import { revalidatePath } from "next/cache";
import {
  getWorkspaceById,
  updateWorkspaceLogo,
  updateWorkspaceName,
  updateWorkspacePolicy,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";
import { deleteObject, putObject } from "@/lib/r2";
import { requireWorkspaceAccess } from "@/lib/workspace/access";
import { readImageUpload } from "@/lib/workspace-images";
import { hydrateWorkspaceName } from "@/lib/workspace-name";

type FormState = { error: string | null; ok: string | null };

async function requireOwnerWorkspace(): Promise<{
  userId: string;
  workspaceId: string;
} | null> {
  const access = await requireWorkspaceAccess("manage-workspace");
  return access.ok
    ? { userId: access.userId, workspaceId: access.workspace.id }
    : null;
}

export async function updateWorkspaceNameAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { messages: m } = await getAppI18n();
  const owned = await requireOwnerWorkspace();
  if (!owned) return { error: m.settings.errors.ownerOnly, ok: null };
  const { workspaceId } = owned;
  const env = await getAppWebEnv();
  if (!env?.DB)
    return { error: m.settings.errors.databaseUnavailable, ok: null };

  const name = hydrateWorkspaceName(formData.get("name"), {
    empty: m.settings.workspace.name.empty,
    tooLong: m.settings.workspace.name.tooLong,
  });
  if (!name.ok) return { error: name.error, ok: null };

  const ok = await updateWorkspaceName(env.DB, workspaceId, name.name);
  if (!ok) return { error: m.settings.errors.saveFailed, ok: null };
  revalidatePath("/", "layout");
  return { error: null, ok: "Saved" };
}

export async function uploadWorkspaceLogoAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { messages: m } = await getAppI18n();
  const owned = await requireOwnerWorkspace();
  if (!owned) return { error: m.settings.errors.ownerOnly, ok: null };
  const { workspaceId } = owned;
  const env = await getAppWebEnv();
  if (!env?.DB)
    return { error: m.settings.errors.databaseUnavailable, ok: null };

  const image = await readImageUpload(formData.get("logo"), {
    missing: m.settings.upload.missing,
    tooLarge: m.settings.workspace.logo.tooLarge,
    badType: m.settings.workspace.logo.badType,
  });
  if (!image.ok) return { error: image.error, ok: null };

  // Key on workspaceId so a same-extension re-upload overwrites in place; the
  // page appends updated_at to bust the CDN cache.
  const key = `workspace-logos/${workspaceId}.${image.ext}`;
  try {
    await putObject(key, image.buffer, image.mime, "public, max-age=86400");
  } catch (err) {
    return {
      error: fmt(m.settings.upload.failedReason, {
        reason: err instanceof Error ? err.message : String(err),
      }),
      ok: null,
    };
  }

  // Drop the prior key on a format swap so it doesn't orphan in the bucket.
  const existing = await getWorkspaceById(env.DB, workspaceId);
  if (existing?.logo_key && existing.logo_key !== key) {
    void deleteObject(existing.logo_key).catch(() => {});
  }

  const ok = await updateWorkspaceLogo(env.DB, workspaceId, key);
  if (!ok) return { error: m.settings.errors.saveFailed, ok: null };
  revalidatePath("/", "layout");
  return { error: null, ok: "Logo updated" };
}

export async function removeWorkspaceLogoAction(): Promise<void> {
  const owned = await requireOwnerWorkspace();
  if (!owned) return;
  const { workspaceId } = owned;
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  const existing = await getWorkspaceById(env.DB, workspaceId);
  if (existing?.logo_key) {
    void deleteObject(existing.logo_key).catch(() => {});
  }
  await updateWorkspaceLogo(env.DB, workspaceId, null);
  revalidatePath("/", "layout");
}

export async function setMemberUploadsPolicyAction(
  formData: FormData,
): Promise<void> {
  const owned = await requireOwnerWorkspace();
  if (!owned) return;
  const { workspaceId } = owned;
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  const value = formData.get("allow_member_uploads");
  await updateWorkspacePolicy(env.DB, workspaceId, {
    allowMemberUploads: value === "1",
  });
  revalidatePath("/settings/workspace");
}
