'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import {
  deleteReactionsForShare,
  deleteShareForAdmin,
  getShareForAdmin,
  getShareForUser,
  updateShareTitleForUser,
  updateShareVisibilityForAdmin,
  type ShareVisibility,
} from '@/lib/shares-db';
import {
  getSnapForAdmin,
  getSnapForUser,
  renameSnap,
  softDeleteSnapForAdmin,
  updateSnapAfterEdit,
  updateSnapVisibilityForAdmin,
  type SnapVisibility,
} from '@/lib/snaps-db';
import {
  deleteObject,
  getObjectBytes,
  objectExists,
  putObject,
} from '@/lib/r2';
import { sourceKeyFor, stateKeyFor } from '@/lib/snap-keys';
import {
  hydrateShareConfig,
  shareConfigKeyFor,
  type ShareConfig,
} from '@/lib/share-config';
import { revokeDeviceToken } from '@/lib/device-tokens';

// Middleware only guards page requests; a forged/replayed direct action
// invocation bypasses it, so every action re-checks the session here.
async function requireUserId(): Promise<string> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/login');
  }
  return session.user.id;
}

export async function renameShareAction(
  _prev: { error: string | null; slug: string | null },
  formData: FormData
): Promise<{ error: string | null; slug: string | null }> {
  const userId = await requireUserId();
  const slug =
    typeof formData.get('slug') === 'string'
      ? (formData.get('slug') as string).trim()
      : '';
  const title =
    typeof formData.get('title') === 'string'
      ? (formData.get('title') as string).trim()
      : '';
  if (!slug) {
    return { error: 'Missing slug', slug: null };
  }
  // Same 200-char cap the share /api/init enforces.
  const next = title.length === 0 ? null : title.slice(0, 200);
  const ok = await updateShareTitleForUser(userId, slug, next);
  if (!ok) {
    return { error: 'Share not found', slug };
  }
  revalidatePath('/');
  return { error: null, slug };
}

export async function setVisibilityAction(
  slug: string,
  visibility: ShareVisibility
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const cleanSlug = typeof slug === 'string' ? slug.trim() : '';
  if (!cleanSlug) return { error: 'Missing slug' };
  if (
    visibility !== 'public' &&
    visibility !== 'workspace' &&
    visibility !== 'private'
  ) {
    return { error: 'Invalid visibility' };
  }
  const ok = await updateShareVisibilityForAdmin(userId, cleanSlug, visibility);
  if (!ok) return { error: 'Share not found' };
  revalidatePath('/');
  return { error: null };
}

export async function deleteShareAction(slug: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const cleanSlug = typeof slug === 'string' ? slug.trim() : '';
  if (!cleanSlug) return { error: 'Missing slug' };
  // getShareForAdmin authorises uploader OR workspace owner.
  const row = await getShareForAdmin(userId, cleanSlug);
  if (!row) {
    return { error: 'Share not found' };
  }
  // R2 objects first, then reactions, then the row, so a failure strands
  // at worst a row pointing at a missing object (delete again to clean up).
  try {
    await deleteObject(row.storageKey);
    if (row.posterKey) {
      await deleteObject(row.posterKey);
    }
  } catch (err) {
    return {
      error: `Could not delete the video file: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
  await deleteReactionsForShare(cleanSlug);
  await deleteShareForAdmin(userId, cleanSlug);
  revalidatePath('/');
  return { error: null };
}

// Public viewer and dashboard edit page read the same R2 sidecar, so one
// PUT updates every surface on next fetch.
export async function saveShareConfigAction(
  slug: string,
  raw: unknown
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const cleanSlug = typeof slug === 'string' ? slug.trim() : '';
  if (!cleanSlug) return { error: 'Missing slug' };
  const share = await getShareForUser(userId, cleanSlug);
  if (!share) return { error: 'Share not found' };
  const config: ShareConfig = hydrateShareConfig(raw);
  const json = JSON.stringify(config);
  const bytes = new TextEncoder().encode(json);
  try {
    await putObject(
      shareConfigKeyFor(share.storageKey),
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      ) as ArrayBuffer,
      'application/json'
    );
  } catch (err) {
    return {
      error: `Could not save share config: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
  revalidatePath(`/shares/${cleanSlug}/edit`);
  revalidatePath('/');
  return { error: null };
}

export async function revokeDeviceTokenAction(tokenId: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const cleanId = typeof tokenId === 'string' ? tokenId.trim() : '';
  if (!cleanId) return { error: 'Missing token id' };
  const ok = await revokeDeviceToken(userId, cleanId);
  if (!ok) return { error: 'Token not found' };
  revalidatePath('/');
  return { error: null };
}

export async function deleteSnapAction(snapId: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const cleanId = typeof snapId === 'string' ? snapId.trim() : '';
  if (!cleanId) return { error: 'Missing snap id' };
  const snap = await getSnapForAdmin(cleanId, userId);
  if (!snap) return { error: 'Snap not found' };
  const ok = await softDeleteSnapForAdmin(cleanId, userId);
  if (!ok) return { error: 'Snap not found' };
  // Best-effort R2 cleanup; row is already soft-deleted and the retention
  // cron sweeps any stranded bytes.
  await Promise.allSettled([
    deleteObject(snap.storageKey),
    deleteObject(sourceKeyFor(snap.storageKey)),
    deleteObject(stateKeyFor(snap.storageKey)),
  ]);
  revalidatePath('/snaps');
  return { error: null };
}

export async function setSnapVisibilityAction(
  snapId: string,
  visibility: SnapVisibility
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const cleanId = typeof snapId === 'string' ? snapId.trim() : '';
  if (!cleanId) return { error: 'Missing snap id' };
  if (
    visibility !== 'public' &&
    visibility !== 'workspace' &&
    visibility !== 'private'
  ) {
    return { error: 'Invalid visibility' };
  }
  const ok = await updateSnapVisibilityForAdmin(userId, cleanId, visibility);
  if (!ok) return { error: 'Snap not found' };
  revalidatePath('/snaps');
  return { error: null };
}

export async function renameSnapAction(
  snapId: string,
  title: string
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const cleanId = typeof snapId === 'string' ? snapId.trim() : '';
  if (!cleanId) return { error: 'Missing snap id' };
  const trimmed = typeof title === 'string' ? title.trim().slice(0, 200) : '';
  const ok = await renameSnap(cleanId, userId, trimmed || null);
  if (!ok) return { error: 'Snap not found' };
  revalidatePath('/snaps');
  revalidatePath(`/snaps/${cleanId}/edit`);
  return { error: null };
}

// Caps an edited snap so high-res annotations can't blow past the upload cap.
const MAX_SNAP_BYTES = 8 * 1024 * 1024;

export type SnapEditState = {
  background: string;
  annotations: unknown[];
  // Composed PNG dimensions; the editor may grow the canvas past the
  // original upload (background padding), so D1's width/height must refresh.
  width: number;
  height: number;
};

export async function saveSnapAction(
  snapId: string,
  blob: Blob,
  state: SnapEditState
): Promise<{ error: string | null }> {
  try {
    return await saveSnapActionInner(snapId, blob, state);
  } catch (err) {
    // Next strips thrown server-action messages in prod; funnel through here
    // so the client gets a readable string and we log a breadcrumb.
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[saveSnapAction] uncaught:', msg, err);
    return { error: `Save failed: ${msg}` };
  }
}

async function saveSnapActionInner(
  snapId: string,
  blob: Blob,
  state: SnapEditState
): Promise<{ error: string | null }> {
  const userId = await requireUserId();
  const cleanId = typeof snapId === 'string' ? snapId.trim() : '';
  if (!cleanId) return { error: 'Missing snap id' };
  // PNG arrives as a Blob: a raw Uint8Array trips React's array-nesting guard
  // past ~1 MB, so the serializer must take the binary path.
  if (!blob || typeof (blob as Blob).arrayBuffer !== 'function') {
    console.error('[saveSnapAction] bad blob', {
      hasBlob: !!blob,
      typeOf: typeof blob,
      constructor:
        blob && (blob as { constructor?: { name?: string } }).constructor?.name,
    });
    return { error: 'Missing image bytes' };
  }
  const size = (blob as Blob).size;
  if (!Number.isFinite(size) || size === 0) {
    return { error: 'Missing image bytes' };
  }
  if (size > MAX_SNAP_BYTES) {
    return { error: 'Edited snap exceeds the per-snap size cap.' };
  }
  const snap = await getSnapForUser(cleanId, userId);
  if (!snap) return { error: 'Snap not found' };

  const buffer = (await (blob as Blob).arrayBuffer()) as ArrayBuffer;
  const byteLength = buffer.byteLength;

  // On the first save the primary key still holds the original pixels, so
  // snapshot them to the pristine source sidecar before we overwrite.
  const sourceKey = sourceKeyFor(snap.storageKey);
  const stateKey = stateKeyFor(snap.storageKey);
  try {
    const sourceAlreadyExists = await objectExists(sourceKey);
    if (!sourceAlreadyExists) {
      const original = await getObjectBytes(snap.storageKey);
      if (original) {
        await putObject(sourceKey, original, 'image/png');
      }
    }
  } catch {
    // Best-effort: a failed source snapshot must not block the save.
  }

  try {
    await putObject(snap.storageKey, buffer, 'image/png');
  } catch (err) {
    return {
      error: `Could not save the snap: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  try {
    const stateJson = JSON.stringify({
      background: state.background,
      annotations: state.annotations,
    });
    const encoder = new TextEncoder();
    const stateBytes = encoder.encode(stateJson);
    await putObject(
      stateKey,
      stateBytes.buffer.slice(
        stateBytes.byteOffset,
        stateBytes.byteOffset + stateBytes.byteLength
      ) as ArrayBuffer,
      'application/json'
    );
  } catch {
    // Best-effort: a sidecar miss must not block the save.
  }

  // Validate dimensions before persisting so a malformed client can't
  // NaN-corrupt the row.
  const w =
    Number.isFinite(state.width) && state.width > 0
      ? Math.round(state.width)
      : null;
  const h =
    Number.isFinite(state.height) && state.height > 0
      ? Math.round(state.height)
      : null;
  if (w === null || h === null) {
    return { error: 'Save failed: invalid canvas dimensions' };
  }
  await updateSnapAfterEdit(cleanId, userId, byteLength, w, h);
  revalidatePath(`/snaps/${cleanId}/edit`);
  revalidatePath('/snaps');
  return { error: null };
}
