/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv } from './cf-env';

// User-dashboard view of the shares table. Parallel to the share
// API's own db layer but scoped to the signed-in user: every query
// requires a userId so we never expose other people's rows by accident.

export type ShareVisibility = 'public' | 'workspace' | 'private';
export type ShareState = 'pending' | 'ready' | 'failed';
export type ShareSource = 'instant' | 'edited';
export type SharePreset = 'share';
export type WebcamState = 'none' | 'pending' | 'ready' | 'failed';

export type DashboardShareRow = {
  slug: string;
  // Owner of the share. Surfaced so the row can render an owner-name
  // pill when the dashboard is currently scoped to a workspace where
  // the viewer is not the author.
  userId: string;
  storageKey: string;
  posterKey: string | null;
  sizeBytes: number;
  durationMs: number | null;
  width: number | null;
  height: number | null;
  source: ShareSource;
  preset: SharePreset;
  createdAt: number;
  lastViewedAt: number;
  viewCount: number;
  // Aggregate counts for the dashboard row. Sourced via subselect
  // against share_comments / share_reactions so the list view doesn't
  // need a follow-up N+1.
  commentCount: number;
  reactionCount: number;
  title: string | null;
  state: ShareState;
  visibility: ShareVisibility;
  webcamStorageKey: string | null;
  webcamSizeBytes: number;
  webcamState: WebcamState;
  workspaceId: string | null;
};

type D1Row = {
  slug: string;
  user_id: string;
  storage_key: string;
  poster_key: string | null;
  size_bytes: number;
  duration_ms: number | null;
  width: number | null;
  height: number | null;
  source: string;
  preset: string;
  created_at: number;
  last_viewed_at: number;
  view_count: number;
  comment_count: number;
  reaction_count: number;
  title: string | null;
  state: string;
  visibility: string;
  webcam_storage_key: string | null;
  webcam_size_bytes: number;
  webcam_state: string;
  workspace_id: string | null;
};

const COLUMNS_SELECT =
  'slug, user_id, storage_key, poster_key, size_bytes, duration_ms, width, height, ' +
  'source, preset, created_at, last_viewed_at, view_count, title, state, ' +
  'visibility, webcam_storage_key, webcam_size_bytes, webcam_state, workspace_id, ' +
  "(SELECT COUNT(*) FROM share_activity WHERE share_activity.slug = shares.slug AND share_activity.kind = 'comment') AS comment_count, " +
  "(SELECT COUNT(*) FROM share_activity WHERE share_activity.slug = shares.slug AND share_activity.kind = 'reaction') AS reaction_count";

function rowFromD1(r: D1Row): DashboardShareRow {
  return {
    slug: r.slug,
    userId: r.user_id,
    storageKey: r.storage_key,
    posterKey: r.poster_key,
    sizeBytes: r.size_bytes,
    durationMs: r.duration_ms,
    width: r.width,
    height: r.height,
    source: r.source as ShareSource,
    preset: r.preset as SharePreset,
    createdAt: r.created_at,
    lastViewedAt: r.last_viewed_at,
    viewCount: r.view_count ?? 0,
    commentCount: r.comment_count ?? 0,
    reactionCount: r.reaction_count ?? 0,
    title: r.title ?? null,
    state: r.state as ShareState,
    visibility: (r.visibility as ShareVisibility) ?? 'public',
    webcamStorageKey: r.webcam_storage_key ?? null,
    webcamSizeBytes: r.webcam_size_bytes ?? 0,
    webcamState: (r.webcam_state as WebcamState) ?? 'none',
    workspaceId: r.workspace_id ?? null,
  };
}

async function getDb(): Promise<D1Database> {
  const env = await getAppWebEnv();
  if (!env?.DB) {
    throw new Error(
      'D1 binding (DB) not available. Run under OpenNext / Cloudflare.'
    );
  }
  return env.DB;
}

export async function listSharesForUser(
  userId: string
): Promise<DashboardShareRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT ${COLUMNS_SELECT} FROM shares
         WHERE user_id = ?1
         ORDER BY created_at DESC`
    )
    .bind(userId)
    .all<D1Row>();
  return res.results.map(rowFromD1);
}

// Workspace-scoped listing for the dashboard's current-workspace
// context. Returns shares owned by anyone in the workspace, with
// private rows hidden from non-owners (the workspace owner sees
// everyone's public+workspace plus their own private; teammates see
// public+workspace).
export async function listSharesForWorkspace(
  workspaceId: string,
  viewerUserId: string
): Promise<DashboardShareRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT ${COLUMNS_SELECT} FROM shares
         WHERE workspace_id = ?1
           AND (visibility != 'private' OR user_id = ?2)
         ORDER BY created_at DESC`
    )
    .bind(workspaceId, viewerUserId)
    .all<D1Row>();
  return res.results.map(rowFromD1);
}

// Owner-scoped getter. Used as a precondition by the mutation
// actions — fetch then verify the user_id matches before touching
// the row, so a forged slug from another user is rejected.
export async function getShareForUser(
  userId: string,
  slug: string
): Promise<
  (DashboardShareRow & { posterKey: string | null; storageKey: string }) | null
> {
  const db = await getDb();
  const r = await db
    .prepare(
      `SELECT ${COLUMNS_SELECT} FROM shares
         WHERE slug = ?1 AND user_id = ?2
         LIMIT 1`
    )
    .bind(slug, userId)
    .first<D1Row>();
  return r ? rowFromD1(r) : null;
}

export async function updateShareTitleForUser(
  userId: string,
  slug: string,
  title: string | null
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(
      `UPDATE shares SET title = ?3
         WHERE slug = ?1 AND user_id = ?2`
    )
    .bind(slug, userId, title)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function updateShareVisibilityForUser(
  userId: string,
  slug: string,
  visibility: ShareVisibility
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(
      `UPDATE shares SET visibility = ?3
         WHERE slug = ?1 AND user_id = ?2`
    )
    .bind(slug, userId, visibility)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function deleteShareForUser(
  userId: string,
  slug: string
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(`DELETE FROM shares WHERE slug = ?1 AND user_id = ?2`)
    .bind(slug, userId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// Admin variants — uploader OR workspace owner can act. Used by the
// dashboard so a workspace owner can manage storage / visibility on
// teammates' uploads in their workspace. Renames stay author-only
// (edits are authoring, not administration).

export async function getShareForAdmin(
  actorUserId: string,
  slug: string
): Promise<DashboardShareRow | null> {
  const db = await getDb();
  const r = await db
    .prepare(
      `SELECT ${COLUMNS_SELECT}
         FROM shares
         WHERE slug = ?1
           AND (
             user_id = ?2
             OR workspace_id IN (
               SELECT id FROM workspace WHERE owner_user_id = ?2
             )
           )
         LIMIT 1`
    )
    .bind(slug, actorUserId)
    .first<D1Row>();
  return r ? rowFromD1(r) : null;
}

export async function updateShareVisibilityForAdmin(
  actorUserId: string,
  slug: string,
  visibility: ShareVisibility
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(
      `UPDATE shares SET visibility = ?3
         WHERE slug = ?1
           AND (
             user_id = ?2
             OR workspace_id IN (
               SELECT id FROM workspace WHERE owner_user_id = ?2
             )
           )`
    )
    .bind(slug, actorUserId, visibility)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function deleteShareForAdmin(
  actorUserId: string,
  slug: string
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(
      `DELETE FROM shares
         WHERE slug = ?1
           AND (
             user_id = ?2
             OR workspace_id IN (
               SELECT id FROM workspace WHERE owner_user_id = ?2
             )
           )`
    )
    .bind(slug, actorUserId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// Sweep both reactions + comments for a share. Used by the cascade
// path when a share is deleted from the dashboard — keeps the unified
// `share_activity` table tidy. Name preserved so existing callers
// don't churn even though it now removes comments too.
export async function deleteReactionsForShare(slug: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare(`DELETE FROM share_activity WHERE slug = ?1`)
    .bind(slug)
    .run();
}
