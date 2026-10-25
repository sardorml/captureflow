"use server";

/// <reference types="@cloudflare/workers-types" />

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createTeamWorkspace,
  getWorkspaceById,
  updateWorkspaceCard,
  updateWorkspaceLogo,
  updateWorkspaceName,
  type WorkspaceRow,
} from "@captureflow/quota";
import { getAuth } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";
import { deleteObject, putObject } from "@/lib/r2";
import {
  isWorkspaceCardPresetKey,
  parseWorkspaceCard,
  serializeWorkspaceCard,
} from "@/lib/workspace-card";
import { readImageUpload } from "@/lib/workspace-images";
import { hydrateWorkspaceName } from "@/lib/workspace-name";

type FormState = { error: string | null; ok: string | null };

type Owned =
  | { ok: true; db: D1Database; workspace: WorkspaceRow }
  | { ok: false; error: string };

async function requireUserId(): Promise<string> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user.id;
}

// Every change below names its workspace in the form, and only that
// workspace's owner may make it; a replayed action can't lean on the UI.
async function requireOwned(raw: unknown): Promise<Owned> {
  const userId = await requireUserId();
  const env = await getAppWebEnv();
  if (!env?.DB) return { ok: false, error: "Database unavailable" };
  const workspace =
    typeof raw === "string" && raw ? await getWorkspaceById(env.DB, raw) : null;
  if (!workspace || workspace.owner_user_id !== userId) {
    return { ok: false, error: "Only the workspace owner can change this" };
  }
  return { ok: true, db: env.DB, workspace };
}

const failed = (error: string): FormState => ({ error, ok: null });
const saved = (ok: string): FormState => ({ error: null, ok });

// Any signed-in user may start a workspace and becomes its owner. The default
// stays where it was; the new card offers "Make default".
export async function createWorkspaceAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const userId = await requireUserId();
  const env = await getAppWebEnv();
  if (!env?.DB) return failed("Database unavailable");

  const name = hydrateWorkspaceName(formData.get("name"));
  if (!name.ok) return failed(name.error);

  try {
    const workspace = await createTeamWorkspace(env.DB, {
      ownerUserId: userId,
      name: name.name,
    });
    revalidatePath("/", "layout");
    return saved(workspace.id);
  } catch {
    return failed("Couldn’t create the workspace — try again");
  }
}

export async function renameWorkspaceAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const owned = await requireOwned(formData.get("workspaceId"));
  if (!owned.ok) return failed(owned.error);
  const name = hydrateWorkspaceName(formData.get("name"));
  if (!name.ok) return failed(name.error);
  const ok = await updateWorkspaceName(owned.db, owned.workspace.id, name.name);
  if (!ok) return failed("Couldn’t save — try again");
  revalidatePath("/", "layout");
  return saved("Saved");
}

async function store(
  key: string,
  image: { buffer: ArrayBuffer; mime: string },
): Promise<string | null> {
  try {
    await putObject(key, image.buffer, image.mime, "public, max-age=86400");
    return null;
  } catch (err) {
    return `Upload failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// Keyed on the workspace so a same-format re-upload overwrites in place; the
// card appends updated_at to bust the CDN cache. A format swap drops the old
// key so it doesn't orphan in the bucket.
export async function uploadWorkspaceLogoForAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const owned = await requireOwned(formData.get("workspaceId"));
  if (!owned.ok) return failed(owned.error);
  const image = await readImageUpload(formData.get("logo"), "Logo");
  if (!image.ok) return failed(image.error);

  const key = `workspace-logos/${owned.workspace.id}.${image.ext}`;
  const error = await store(key, image);
  if (error) return failed(error);
  const previous = owned.workspace.logo_key;
  if (previous && previous !== key) void deleteObject(previous).catch(() => {});

  const ok = await updateWorkspaceLogo(owned.db, owned.workspace.id, key);
  if (!ok) return failed("Couldn’t save — try again");
  revalidatePath("/", "layout");
  return saved("Logo updated");
}

export async function removeWorkspaceLogoForAction(
  formData: FormData,
): Promise<FormState> {
  const owned = await requireOwned(formData.get("workspaceId"));
  if (!owned.ok) return failed(owned.error);
  const previous = owned.workspace.logo_key;
  if (previous) void deleteObject(previous).catch(() => {});
  await updateWorkspaceLogo(owned.db, owned.workspace.id, null);
  revalidatePath("/", "layout");
  return saved("Logo removed");
}

function dropCardImage(workspace: WorkspaceRow, keep?: string): void {
  const current = parseWorkspaceCard(workspace.card_bg);
  if (current?.kind === "image" && current.key !== keep) {
    void deleteObject(current.key).catch(() => {});
  }
}

// `preset` is a palette key, or "none" for a plain card.
export async function setWorkspaceCardPresetAction(
  formData: FormData,
): Promise<FormState> {
  const owned = await requireOwned(formData.get("workspaceId"));
  if (!owned.ok) return failed(owned.error);
  const raw = formData.get("preset");
  if (
    raw !== "none" &&
    !(typeof raw === "string" && isWorkspaceCardPresetKey(raw))
  ) {
    return failed("Unknown background");
  }
  dropCardImage(owned.workspace);
  const next = raw === "none" ? null : { kind: "preset" as const, key: raw };
  await updateWorkspaceCard(
    owned.db,
    owned.workspace.id,
    serializeWorkspaceCard(next),
  );
  revalidatePath("/", "layout");
  return saved("Background updated");
}

export async function uploadWorkspaceCardAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const owned = await requireOwned(formData.get("workspaceId"));
  if (!owned.ok) return failed(owned.error);
  const image = await readImageUpload(formData.get("image"), "Image");
  if (!image.ok) return failed(image.error);

  const key = `workspace-cards/${owned.workspace.id}.${image.ext}`;
  const error = await store(key, image);
  if (error) return failed(error);
  dropCardImage(owned.workspace, key);

  const ok = await updateWorkspaceCard(
    owned.db,
    owned.workspace.id,
    serializeWorkspaceCard({ kind: "image", key }),
  );
  if (!ok) return failed("Couldn’t save — try again");
  revalidatePath("/", "layout");
  return saved("Background updated");
}
