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

// Every action revalidates the session first. Middleware
// redirects unauthenticated requests
// before they reach a page, but a direct action invocation
// (forged cookie, replayed RSC payload) lands here unchecked
// otherwise.
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
  // getShareForAdmin authorises uploader OR workspace owner — so a
  // workspace owner managing storage on a teammate's row resolves
  // here and the subsequent delete is permitted by the same gate.
  const row = await getShareForAdmin(userId, cleanSlug);
  if (!row) {
    return { error: 'Share not found' };
  }
  // R2 objects first, then reactions, then the row. Same order as
  // the admin app — leaves at worst a row pointing at a missing
  // object on R2 failure, which the user can re-trigger by clicking
  // delete again.
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

// Persist the share's presentation config to its R2 sidecar. The
// public viewer + dashboard edit page both read the same file, so a
// single PUT here updates every surface on next fetch. No D1
// migration — this is presentation-layer state (bg, cam PiP, mute
// toggles) and lives alongside the immutable video bytes.
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

// ── Snap actions ──────────────────────────────────────────────────

// Soft-deletes the snap row (state → 'deleted') and drops the R2
// object so the public view 404s and the bytes stop counting against
// quota. Soft-delete-first means we never strand bytes on R2 without
// a row pointing at them.
export async function deleteSnapAction(snapId: string): Promise<{
  error: string | null;
}> {
  const userId = await requireUserId();
  const cleanId = typeof snapId === 'string' ? snapId.trim() : '';
  if (!cleanId) return { error: 'Missing snap id' };
  // Admin gate — uploader OR workspace owner can wipe the snap so
  // the owner can free up cap on teammate uploads.
  const snap = await getSnapForAdmin(cleanId, userId);
  if (!snap) return { error: 'Snap not found' };
  const ok = await softDeleteSnapForAdmin(cleanId, userId);
  if (!ok) return { error: 'Snap not found' };
  // Best-effort cleanup of every R2 object associated with this snap —
  // the baked PNG, the pristine source sidecar (only present once the
  // user has saved at least one edit), and the state JSON. Failures
  // are non-fatal: the row is already soft-deleted and the retention
  // cron will pick up any stranded bytes.
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
  // Dashboard list, editor header, and the public viewer all read
  // `snaps.title` — revalidate every surface so the rename is visible
  // immediately (the public viewer is a separate Worker but Next still
  // tags its data fetcher when we hit the route here).
  revalidatePath('/snaps');
  revalidatePath(`/snaps/${cleanId}/edit`);
  return { error: null };
}

// Editor save: replaces the PNG bytes in R2 and bumps edited_at +
// size_bytes. Bytes come in as a Uint8Array from the client (canvas
// → toBlob → arrayBuffer → server action). Cap at the per-snap size
// limit so the editor can't blow past the upload cap by adding a
// pile of high-res annotations.
const MAX_SNAP_BYTES = 8 * 1024 * 1024;

// Saved editor state — kept tiny on purpose: just enough so the
// editor can rehydrate a session without forking a database schema.
// `background` is the picker key; `annotations` is the JSON-able
// annotation array (rect / arrow / text). The client serialises this
// before posting so we don't pull a Konva dependency into the action.
export type SnapEditState = {
  background: string;
  annotations: unknown[];
  // Pixel dimensions of the composed PNG. The editor may grow the
  // canvas beyond the original upload (background padding adds
  // `2 * pad` on each axis), so the server has to refresh D1's
  // width/height columns to keep the public viewer's aspect ratio
  // in sync with the bytes that actually live in R2.
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
    // Server actions that throw bubble up as a 500 + Next's
    // "Server Components render" error banner with the message
    // stripped in production. Funnel every throw through this
    // catch so the client gets a readable string AND we leave a
    // breadcrumb in `wrangler tail` for diagnosis.
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
  // The client wraps the PNG in a Blob so React's server-action
  // serializer takes the binary path. Past ~1 MB a raw Uint8Array
  // trips React's "Maximum array nesting exceeded" guard.
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

  // Snapshot the unedited screenshot to the source sidecar on the
  // first save. The current primary key still holds the original
  // pixels (we haven't overwritten yet), so we copy those bytes
  // verbatim. Subsequent saves skip this — the source stays
  // pristine forever and the editor reloads from it every time.
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
    // Snapshotting the source is best-effort — if it fails we don't
    // block the user from saving their edit. Worst case the next
    // edit starts from the baked PNG (existing behaviour).
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

  // Persist the editor state alongside the saved PNG. JSON sidecar
  // (rather than a D1 column) so we avoid a schema migration —
  // R2 is already the storage of record for snap pixels.
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
    // Same posture as the source snapshot — don't block save on a
    // sidecar miss. Reloads just won't restore that single state.
  }

  // Width/height may not match the original upload (background pad
  // grows the canvas). Validate before persisting so a malformed
  // client can't NaN-corrupt the row.
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
