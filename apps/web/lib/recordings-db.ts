/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv } from "./cf-env";

export type RecordingVisibility = "public" | "workspace" | "private";
export type RecordingState = "pending" | "ready" | "failed";
export type RecordingSource = "instant" | "edited";
export type RecordingPreset = "recording";
export type WebcamState = "none" | "pending" | "ready" | "failed";

export type DashboardRecordingRow = {
  slug: string;
  userId: string;
  storageKey: string;
  posterKey: string | null;
  sizeBytes: number;
  durationMs: number | null;
  width: number | null;
  height: number | null;
  source: RecordingSource;
  preset: RecordingPreset;
  createdAt: number;
  lastViewedAt: number;
  viewCount: number;
  commentCount: number;
  reactionCount: number;
  title: string | null;
  state: RecordingState;
  visibility: RecordingVisibility;
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
  "slug, user_id, storage_key, poster_key, size_bytes, duration_ms, width, height, " +
  "source, preset, created_at, last_viewed_at, view_count, title, state, " +
  "visibility, webcam_storage_key, webcam_size_bytes, webcam_state, workspace_id, " +
  "(SELECT COUNT(*) FROM recording_activity WHERE recording_activity.slug = recordings.slug AND recording_activity.kind = 'comment') AS comment_count, " +
  "(SELECT COUNT(*) FROM recording_activity WHERE recording_activity.slug = recordings.slug AND recording_activity.kind = 'reaction') AS reaction_count";

function rowFromD1(r: D1Row): DashboardRecordingRow {
  return {
    slug: r.slug,
    userId: r.user_id,
    storageKey: r.storage_key,
    posterKey: r.poster_key,
    sizeBytes: r.size_bytes,
    durationMs: r.duration_ms,
    width: r.width,
    height: r.height,
    source: r.source as RecordingSource,
    preset: r.preset as RecordingPreset,
    createdAt: r.created_at,
    lastViewedAt: r.last_viewed_at,
    viewCount: r.view_count ?? 0,
    commentCount: r.comment_count ?? 0,
    reactionCount: r.reaction_count ?? 0,
    title: r.title ?? null,
    state: r.state as RecordingState,
    visibility: (r.visibility as RecordingVisibility) ?? "public",
    webcamStorageKey: r.webcam_storage_key ?? null,
    webcamSizeBytes: r.webcam_size_bytes ?? 0,
    webcamState: (r.webcam_state as WebcamState) ?? "none",
    workspaceId: r.workspace_id ?? null,
  };
}

async function getDb(): Promise<D1Database> {
  const env = await getAppWebEnv();
  if (!env?.DB) {
    throw new Error(
      "D1 binding (DB) not available. Run under OpenNext / Cloudflare.",
    );
  }
  return env.DB;
}

export async function listRecordingsForUser(
  userId: string,
): Promise<DashboardRecordingRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT ${COLUMNS_SELECT} FROM recordings
         WHERE user_id = ?1
         ORDER BY created_at DESC`,
    )
    .bind(userId)
    .all<D1Row>();
  return res.results.map(rowFromD1);
}

export async function listRecordingsForWorkspace(
  workspaceId: string,
  viewerUserId: string,
): Promise<DashboardRecordingRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT ${COLUMNS_SELECT} FROM recordings
         WHERE workspace_id = ?1
           AND (visibility != 'private' OR user_id = ?2)
         ORDER BY created_at DESC`,
    )
    .bind(workspaceId, viewerUserId)
    .all<D1Row>();
  return res.results.map(rowFromD1);
}

export async function getRecordingForUser(
  userId: string,
  slug: string,
): Promise<
  | (DashboardRecordingRow & { posterKey: string | null; storageKey: string })
  | null
> {
  const db = await getDb();
  const r = await db
    .prepare(
      `SELECT ${COLUMNS_SELECT} FROM recordings
         WHERE slug = ?1 AND user_id = ?2
         LIMIT 1`,
    )
    .bind(slug, userId)
    .first<D1Row>();
  return r ? rowFromD1(r) : null;
}

export async function updateRecordingTitleForUser(
  userId: string,
  slug: string,
  title: string | null,
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(
      `UPDATE recordings SET title = ?3
         WHERE slug = ?1 AND user_id = ?2`,
    )
    .bind(slug, userId, title)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function updateRecordingVisibilityForUser(
  userId: string,
  slug: string,
  visibility: RecordingVisibility,
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(
      `UPDATE recordings SET visibility = ?3
         WHERE slug = ?1 AND user_id = ?2`,
    )
    .bind(slug, userId, visibility)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function deleteRecordingForUser(
  userId: string,
  slug: string,
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(`DELETE FROM recordings WHERE slug = ?1 AND user_id = ?2`)
    .bind(slug, userId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function getRecordingForAdmin(
  actorUserId: string,
  slug: string,
): Promise<DashboardRecordingRow | null> {
  const db = await getDb();
  const r = await db
    .prepare(
      `SELECT ${COLUMNS_SELECT}
         FROM recordings
         WHERE slug = ?1
           AND (
             user_id = ?2
             OR workspace_id IN (
               SELECT id FROM workspace WHERE owner_user_id = ?2
             )
           )
         LIMIT 1`,
    )
    .bind(slug, actorUserId)
    .first<D1Row>();
  return r ? rowFromD1(r) : null;
}

export async function updateRecordingVisibilityForAdmin(
  actorUserId: string,
  slug: string,
  visibility: RecordingVisibility,
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(
      `UPDATE recordings SET visibility = ?3
         WHERE slug = ?1
           AND (
             user_id = ?2
             OR workspace_id IN (
               SELECT id FROM workspace WHERE owner_user_id = ?2
             )
           )`,
    )
    .bind(slug, actorUserId, visibility)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function deleteRecordingForAdmin(
  actorUserId: string,
  slug: string,
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(
      `DELETE FROM recordings
         WHERE slug = ?1
           AND (
             user_id = ?2
             OR workspace_id IN (
               SELECT id FROM workspace WHERE owner_user_id = ?2
             )
           )`,
    )
    .bind(slug, actorUserId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// Despite the name, removes all recording_activity (reactions + comments).
export async function deleteReactionsForRecording(slug: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare(`DELETE FROM recording_activity WHERE slug = ?1`)
    .bind(slug)
    .run();
}
