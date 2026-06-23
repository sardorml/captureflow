'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  getWorkspaceById,
  updateWorkspaceLogo,
  updateWorkspaceName,
  updateWorkspacePolicy,
} from '@captureflow/quota';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';
import { resolveCurrentWorkspace } from '@/lib/current-workspace';
import { deleteObject, putObject } from '@/lib/r2';

// Server actions for /settings. Every action re-verifies session + workspace
// ownership server-side: the sidebar hides the page from members, but a
// replayed action lands here directly, so we can't trust the UI.

type FormState = { error: string | null; ok: string | null };

async function requireOwnerWorkspace(): Promise<{
  userId: string;
  workspaceId: string;
}> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');
  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null
  );
  if (current.role !== 'owner') {
    redirect('/shares');
  }
  return { userId: session.user.id, workspaceId: current.workspace.id };
}

export async function updateWorkspaceNameAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { workspaceId } = await requireOwnerWorkspace();
  const env = await getAppWebEnv();
  if (!env?.DB) return { error: 'Database unavailable', ok: null };

  const raw = formData.get('name');
  const next = typeof raw === 'string' ? raw.trim() : '';
  if (!next) return { error: 'Workspace name can’t be empty', ok: null };
  if (next.length > 80) {
    return { error: 'Workspace name is too long (max 80 chars)', ok: null };
  }

  const ok = await updateWorkspaceName(env.DB, workspaceId, next);
  if (!ok) return { error: 'Couldn’t save — try again', ok: null };
  // Sidebar + members header both render the name; revalidate the dashboard
  // root so every page re-fetches it on next nav.
  revalidatePath('/', 'layout');
  return { error: null, ok: 'Saved' };
}

// Cap logo size + content type before pushing to R2 so a malicious form
// can't fill the bucket with arbitrary blobs.
const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const LOGO_MIME = new Map<string, string>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/svg+xml', 'svg'],
]);

export async function uploadWorkspaceLogoAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { workspaceId } = await requireOwnerWorkspace();
  const env = await getAppWebEnv();
  if (!env?.DB) return { error: 'Database unavailable', ok: null };

  const file = formData.get('logo');
  if (!(file instanceof Blob) || file.size === 0) {
    return { error: 'Pick an image file', ok: null };
  }
  if (file.size > LOGO_MAX_BYTES) {
    return { error: 'Logo must be 2 MB or smaller', ok: null };
  }
  const mime = file.type;
  const ext = LOGO_MIME.get(mime);
  if (!ext) {
    return {
      error: 'Logo must be PNG, JPEG, WebP, GIF, or SVG',
      ok: null,
    };
  }

  // Key on workspaceId so a re-upload of the same extension overwrites in
  // place; the page appends updated_at to bust the CDN cache.
  const key = `workspace-logos/${workspaceId}.${ext}`;
  const buffer = (await file.arrayBuffer()) as ArrayBuffer;
  try {
    await putObject(key, buffer, mime, 'public, max-age=86400');
  } catch (err) {
    return {
      error: `Upload failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
      ok: null,
    };
  }

  // Drop the prior key when the extension changed, so format swaps don't
  // leave orphans in the bucket.
  const existing = await getWorkspaceById(env.DB, workspaceId);
  if (existing?.logo_key && existing.logo_key !== key) {
    void deleteObject(existing.logo_key).catch(() => {});
  }

  const ok = await updateWorkspaceLogo(env.DB, workspaceId, key);
  if (!ok) return { error: 'Couldn’t save — try again', ok: null };
  revalidatePath('/', 'layout');
  return { error: null, ok: 'Logo updated' };
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
  revalidatePath('/', 'layout');
}

export async function setPublicLinksPolicyAction(
  formData: FormData
): Promise<void> {
  const { workspaceId } = await requireOwnerWorkspace();
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  const value = formData.get('allow_public_links');
  await updateWorkspacePolicy(env.DB, workspaceId, {
    allowPublicLinks: value === '1',
  });
  revalidatePath('/settings');
}

export async function setMemberUploadsPolicyAction(
  formData: FormData
): Promise<void> {
  const { workspaceId } = await requireOwnerWorkspace();
  const env = await getAppWebEnv();
  if (!env?.DB) return;
  const value = formData.get('allow_member_uploads');
  await updateWorkspacePolicy(env.DB, workspaceId, {
    allowMemberUploads: value === '1',
  });
  revalidatePath('/settings');
}
