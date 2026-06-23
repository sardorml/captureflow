/// <reference types="@cloudflare/workers-types" />

import { getCloudflareEnv } from './cf-env';
import type { SnapRow, SnapState, SnapVisibility } from './types';

type D1SnapRow = {
  id: string;
  user_id: string;
  workspace_id: string | null;
  device_id: string | null;
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

function rowFromD1(r: D1SnapRow): SnapRow {
  return {
    id: r.id,
    userId: r.user_id,
    workspaceId: r.workspace_id ?? null,
    deviceId: r.device_id,
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
  'id, user_id, workspace_id, device_id, storage_key, size_bytes, width, height, ' +
  'title, state, visibility, created_at, updated_at, edited_at, last_viewed_at, view_count';

async function db(): Promise<D1Database> {
  const env = await getCloudflareEnv();
  if (!env?.DB) {
    throw new Error(
      'D1 binding (DB) not available. Ensure OpenNext / Cloudflare runtime.'
    );
  }
  return env.DB;
}

export async function insertSnap(row: SnapRow): Promise<void> {
  const d = await db();
  await d
    .prepare(
      `INSERT INTO snaps (${COLUMNS})
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)`
    )
    .bind(
      row.id,
      row.userId,
      row.workspaceId,
      row.deviceId,
      row.storageKey,
      row.sizeBytes,
      row.width,
      row.height,
      row.title,
      row.state,
      row.visibility,
      row.createdAt,
      row.updatedAt,
      row.editedAt,
      row.lastViewedAt,
      row.viewCount
    )
    .run();
}

export async function getSnap(id: string): Promise<SnapRow | null> {
  const d = await db();
  const r = await d
    .prepare(`SELECT ${COLUMNS} FROM snaps WHERE id = ?1 LIMIT 1`)
    .bind(id)
    .first<D1SnapRow>();
  return r ? rowFromD1(r) : null;
}

// name + email are nullable: the LEFT JOIN can miss if the user was hard-deleted.
export type SnapWithOwner = SnapRow & {
  ownerName: string | null;
  ownerEmail: string | null;
};

export async function getSnapWithOwner(
  id: string
): Promise<SnapWithOwner | null> {
  const d = await db();
  type Row = D1SnapRow & {
    owner_name: string | null;
    owner_email: string | null;
  };
  const aliased = COLUMNS.split(', ')
    .map((c) => `s.${c}`)
    .join(', ');
  const r = await d
    .prepare(
      `SELECT ${aliased},
              u.name  AS owner_name,
              u.email AS owner_email
         FROM snaps s
         LEFT JOIN users u ON u.id = s.user_id
        WHERE s.id = ?1
        LIMIT 1`
    )
    .bind(id)
    .first<Row>();
  if (!r) return null;
  return {
    ...rowFromD1(r),
    ownerName: r.owner_name,
    ownerEmail: r.owner_email,
  };
}

export async function updateSnapAfterEdit(
  id: string,
  patch: { sizeBytes: number; title?: string | null }
): Promise<SnapRow | null> {
  const d = await db();
  const now = Date.now();
  const sets = ['size_bytes = ?2', 'updated_at = ?3', 'edited_at = ?3'];
  const binds: unknown[] = [id, patch.sizeBytes, now];
  if (patch.title !== undefined) {
    sets.push(`title = ?${binds.length + 1}`);
    binds.push(patch.title);
  }
  const sql = `UPDATE snaps SET ${sets.join(
    ', '
  )} WHERE id = ?1 RETURNING ${COLUMNS}`;
  const r = await d
    .prepare(sql)
    .bind(...binds)
    .first<D1SnapRow>();
  return r ? rowFromD1(r) : null;
}

// Callers must already have confirmed the requesting user owns the row.
export async function updateSnapVisibility(
  id: string,
  visibility: 'public' | 'workspace' | 'private'
): Promise<SnapRow | null> {
  const d = await db();
  const r = await d
    .prepare(
      `UPDATE snaps SET visibility = ?2, updated_at = ?3 WHERE id = ?1 RETURNING ${COLUMNS}`
    )
    .bind(id, visibility, Date.now())
    .first<D1SnapRow>();
  return r ? rowFromD1(r) : null;
}

export async function softDeleteSnap(id: string): Promise<boolean> {
  const d = await db();
  const res = await d
    .prepare(
      `UPDATE snaps SET state = 'deleted', updated_at = ?2 WHERE id = ?1`
    )
    .bind(id, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function bumpSnapLastViewed(id: string): Promise<void> {
  const d = await db();
  await d
    .prepare(
      `UPDATE snaps
         SET last_viewed_at = ?2, view_count = view_count + 1
         WHERE id = ?1`
    )
    .bind(id, Date.now())
    .run();
}
