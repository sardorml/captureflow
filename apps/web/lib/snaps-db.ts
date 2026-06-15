/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv } from './cf-env';

// User-dashboard view of the snaps table. Parallel to shares-db.ts:
// every query requires a userId so we never expose other people's
// rows. Snaps live in the same D1 the snap upload handler writes to;
// this module just reads + soft-deletes from the dashboard side, never
// inserts. New rows only come from the snap /api/upload route.

export type SnapState = 'ready' | 'deleted';
export type SnapVisibility = 'public' | 'workspace' | 'private';

export type DashboardSnapRow = {
  id: string;
  // Owner of the snap. Same role as DashboardShareRow.userId — lets
  // the workspace-scoped list mark teammate-owned snaps with an
  // attribution pill.
  userId: string;
  storageKey: string;
  sizeBytes: number;
  width: number;
  height: number;
  title: string | null;
  state: SnapState;
  visibility: SnapVisibility;
  createdAt: number;
  updatedAt: number;
  editedAt: number | null;
  lastViewedAt: number | null;
  viewCount: number;
};

// `getSnapForUser` returns this shape when called for the editor —
// the join surfaces the same `name`/`email` fields the public viewer
// uses so both pages can drive the shared SnapNavbar's posted-by
// strip without a second round trip.
export type DashboardSnapWithOwnerRow = DashboardSnapRow & {
  ownerName: string | null;
  ownerEmail: string | null;
};

type D1Row = {
  id: string;
  user_id: string;
  storage_key: string;
  size_bytes: number;
  width: number;
  height: number;
  title: string | null;
  state: string;
  visibility: string;
  created_at: number;
  updated_at: number;
  edited_at: number | null;
  last_viewed_at: number | null;
  view_count: number;
};

function rowFromD1(r: D1Row): DashboardSnapRow {
  return {
    id: r.id,
    userId: r.user_id,
    storageKey: r.storage_key,
    sizeBytes: r.size_bytes,
    width: r.width,
    height: r.height,
    title: r.title,
    state: r.state as SnapState,
    visibility: (r.visibility as SnapVisibility) ?? 'public',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    editedAt: r.edited_at,
    lastViewedAt: r.last_viewed_at,
    viewCount: r.view_count ?? 0,
  };
}

const COLUMNS =
  'id, user_id, storage_key, size_bytes, width, height, title, state, visibility, ' +
  'created_at, updated_at, edited_at, last_viewed_at, view_count';

export async function listSnapsForUser(
  userId: string
): Promise<DashboardSnapRow[]> {
  const env = await getAppWebEnv();
  if (!env?.DB) return [];
  const res = await env.DB.prepare(
    `SELECT ${COLUMNS}
       FROM snaps
       WHERE user_id = ?1 AND state = 'ready'
       ORDER BY created_at DESC`
  )
    .bind(userId)
    .all<D1Row>();
  return res.results.map(rowFromD1);
}

// Workspace-scoped listing. Mirrors listSharesForWorkspace —
// private rows stay owner-only across workspace context switches.
export async function listSnapsForWorkspace(
  workspaceId: string,
  viewerUserId: string
): Promise<DashboardSnapRow[]> {
  const env = await getAppWebEnv();
  if (!env?.DB) return [];
  const res = await env.DB.prepare(
    `SELECT ${COLUMNS}
       FROM snaps
       WHERE workspace_id = ?1
         AND state = 'ready'
         AND (visibility != 'private' OR user_id = ?2)
       ORDER BY created_at DESC`
  )
    .bind(workspaceId, viewerUserId)
    .all<D1Row>();
  return res.results.map(rowFromD1);
}

export async function getSnapForUser(
  snapId: string,
  userId: string
): Promise<DashboardSnapWithOwnerRow | null> {
  const env = await getAppWebEnv();
  if (!env?.DB) return null;
  type WithOwner = D1Row & {
    owner_name: string | null;
    owner_email: string | null;
  };
  const aliased = COLUMNS.split(', ')
    .map((c) => `s.${c}`)
    .join(', ');
  const r = await env.DB.prepare(
    `SELECT ${aliased},
            u.name  AS owner_name,
            u.email AS owner_email
       FROM snaps s
       LEFT JOIN users u ON u.id = s.user_id
      WHERE s.id = ?1 AND s.user_id = ?2
      LIMIT 1`
  )
    .bind(snapId, userId)
    .first<WithOwner>();
  if (!r) return null;
  return {
    ...rowFromD1(r),
    ownerName: r.owner_name,
    ownerEmail: r.owner_email,
  };
}

// Soft-delete: state → 'deleted' so quota math drops it and the
// public view 404s. The R2 object is dropped opportunistically; if
// that fails the daily retention cron picks it up.
export async function softDeleteSnap(
  snapId: string,
  userId: string
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE snaps
       SET state = 'deleted', updated_at = ?3
       WHERE id = ?1 AND user_id = ?2 AND state = 'ready'`
  )
    .bind(snapId, userId, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function updateSnapVisibilityForUser(
  userId: string,
  snapId: string,
  visibility: SnapVisibility
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE snaps
       SET visibility = ?3, updated_at = ?4
       WHERE id = ?1 AND user_id = ?2 AND state = 'ready'`
  )
    .bind(snapId, userId, visibility, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function renameSnap(
  snapId: string,
  userId: string,
  title: string | null
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE snaps
       SET title = ?3, updated_at = ?4
       WHERE id = ?1 AND user_id = ?2 AND state = 'ready'`
  )
    .bind(snapId, userId, title, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// Admin variants — uploader OR workspace owner can act. Used by the
// dashboard so a workspace owner can delete + flip visibility on a
// teammate's snap in their workspace. Renames stay author-only.

export async function getSnapForAdmin(
  snapId: string,
  actorUserId: string
): Promise<DashboardSnapWithOwnerRow | null> {
  const env = await getAppWebEnv();
  if (!env?.DB) return null;
  type WithOwner = D1Row & {
    owner_name: string | null;
    owner_email: string | null;
  };
  const aliased = COLUMNS.split(', ')
    .map((c) => `s.${c}`)
    .join(', ');
  const r = await env.DB.prepare(
    `SELECT ${aliased},
            u.name  AS owner_name,
            u.email AS owner_email
       FROM snaps s
       LEFT JOIN users u ON u.id = s.user_id
      WHERE s.id = ?1
        AND (
          s.user_id = ?2
          OR s.workspace_id IN (
            SELECT id FROM workspace WHERE owner_user_id = ?2
          )
        )
      LIMIT 1`
  )
    .bind(snapId, actorUserId)
    .first<WithOwner>();
  if (!r) return null;
  return {
    ...rowFromD1(r),
    ownerName: r.owner_name,
    ownerEmail: r.owner_email,
  };
}

export async function softDeleteSnapForAdmin(
  snapId: string,
  actorUserId: string
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE snaps
       SET state = 'deleted', updated_at = ?3
       WHERE id = ?1
         AND state = 'ready'
         AND (
           user_id = ?2
           OR workspace_id IN (
             SELECT id FROM workspace WHERE owner_user_id = ?2
           )
         )`
  )
    .bind(snapId, actorUserId, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function updateSnapVisibilityForAdmin(
  actorUserId: string,
  snapId: string,
  visibility: SnapVisibility
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE snaps
       SET visibility = ?3, updated_at = ?4
       WHERE id = ?1
         AND state = 'ready'
         AND (
           user_id = ?2
           OR workspace_id IN (
             SELECT id FROM workspace WHERE owner_user_id = ?2
           )
         )`
  )
    .bind(snapId, actorUserId, visibility, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// Replace the PNG bytes of an existing snap (editor save flow) and
// touch updated_at + edited_at + size_bytes + dimensions. The editor's
// composed PNG can have different pixel dims than the original upload
// (bg adds `2 * pad` to each axis), so width/height update alongside
// the bytes — otherwise the public viewer keeps the old aspect ratio
// in its `aspectRatio` container and the saved PNG letterboxes.
export async function updateSnapAfterEdit(
  snapId: string,
  userId: string,
  sizeBytes: number,
  width: number,
  height: number
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const now = Date.now();
  const res = await env.DB.prepare(
    `UPDATE snaps
       SET size_bytes = ?3, width = ?5, height = ?6, updated_at = ?4, edited_at = ?4
       WHERE id = ?1 AND user_id = ?2 AND state = 'ready'`
  )
    .bind(snapId, userId, sizeBytes, now, width, height)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}
