/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv } from "./cf-env";

export type ScreenshotState = "ready" | "deleted";
export type ScreenshotVisibility = "public" | "workspace" | "private";

export type DashboardScreenshotRow = {
  id: string;
  userId: string;
  storageKey: string;
  sizeBytes: number;
  width: number;
  height: number;
  title: string | null;
  state: ScreenshotState;
  visibility: ScreenshotVisibility;
  createdAt: number;
  updatedAt: number;
  editedAt: number | null;
  lastViewedAt: number | null;
  viewCount: number;
};

export type DashboardScreenshotWithOwnerRow = DashboardScreenshotRow & {
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

function rowFromD1(r: D1Row): DashboardScreenshotRow {
  return {
    id: r.id,
    userId: r.user_id,
    storageKey: r.storage_key,
    sizeBytes: r.size_bytes,
    width: r.width,
    height: r.height,
    title: r.title,
    state: r.state as ScreenshotState,
    visibility: (r.visibility as ScreenshotVisibility) ?? "public",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    editedAt: r.edited_at,
    lastViewedAt: r.last_viewed_at,
    viewCount: r.view_count ?? 0,
  };
}

const COLUMNS =
  "id, user_id, storage_key, size_bytes, width, height, title, state, visibility, " +
  "created_at, updated_at, edited_at, last_viewed_at, view_count";

export async function listScreenshotsForUser(
  userId: string,
): Promise<DashboardScreenshotRow[]> {
  const env = await getAppWebEnv();
  if (!env?.DB) return [];
  const res = await env.DB.prepare(
    `SELECT ${COLUMNS}
       FROM screenshots
       WHERE user_id = ?1 AND state = 'ready'
       ORDER BY created_at DESC`,
  )
    .bind(userId)
    .all<D1Row>();
  return res.results.map(rowFromD1);
}

export async function listScreenshotsForWorkspace(
  workspaceId: string,
  viewerUserId: string,
): Promise<DashboardScreenshotRow[]> {
  const env = await getAppWebEnv();
  if (!env?.DB) return [];
  const res = await env.DB.prepare(
    `SELECT ${COLUMNS}
       FROM screenshots
       WHERE workspace_id = ?1
         AND state = 'ready'
         AND (visibility != 'private' OR user_id = ?2)
       ORDER BY created_at DESC`,
  )
    .bind(workspaceId, viewerUserId)
    .all<D1Row>();
  return res.results.map(rowFromD1);
}

export async function getScreenshotForUser(
  screenshotId: string,
  userId: string,
): Promise<DashboardScreenshotWithOwnerRow | null> {
  const env = await getAppWebEnv();
  if (!env?.DB) return null;
  type WithOwner = D1Row & {
    owner_name: string | null;
    owner_email: string | null;
  };
  const aliased = COLUMNS.split(", ")
    .map((c) => `s.${c}`)
    .join(", ");
  const r = await env.DB.prepare(
    `SELECT ${aliased},
            u.name  AS owner_name,
            u.email AS owner_email
       FROM screenshots s
       LEFT JOIN users u ON u.id = s.user_id
      WHERE s.id = ?1 AND s.user_id = ?2
      LIMIT 1`,
  )
    .bind(screenshotId, userId)
    .first<WithOwner>();
  if (!r) return null;
  return {
    ...rowFromD1(r),
    ownerName: r.owner_name,
    ownerEmail: r.owner_email,
  };
}

export async function softDeleteScreenshot(
  screenshotId: string,
  userId: string,
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE screenshots
       SET state = 'deleted', updated_at = ?3
       WHERE id = ?1 AND user_id = ?2 AND state = 'ready'`,
  )
    .bind(screenshotId, userId, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function updateScreenshotVisibilityForUser(
  userId: string,
  screenshotId: string,
  visibility: ScreenshotVisibility,
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE screenshots
       SET visibility = ?3, updated_at = ?4
       WHERE id = ?1 AND user_id = ?2 AND state = 'ready'`,
  )
    .bind(screenshotId, userId, visibility, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function renameScreenshot(
  screenshotId: string,
  userId: string,
  title: string | null,
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE screenshots
       SET title = ?3, updated_at = ?4
       WHERE id = ?1 AND user_id = ?2 AND state = 'ready'`,
  )
    .bind(screenshotId, userId, title, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function getScreenshotForAdmin(
  screenshotId: string,
  actorUserId: string,
): Promise<DashboardScreenshotWithOwnerRow | null> {
  const env = await getAppWebEnv();
  if (!env?.DB) return null;
  type WithOwner = D1Row & {
    owner_name: string | null;
    owner_email: string | null;
  };
  const aliased = COLUMNS.split(", ")
    .map((c) => `s.${c}`)
    .join(", ");
  const r = await env.DB.prepare(
    `SELECT ${aliased},
            u.name  AS owner_name,
            u.email AS owner_email
       FROM screenshots s
       LEFT JOIN users u ON u.id = s.user_id
      WHERE s.id = ?1
        AND (
          s.user_id = ?2
          OR s.workspace_id IN (
            SELECT id FROM workspace WHERE owner_user_id = ?2
          )
        )
      LIMIT 1`,
  )
    .bind(screenshotId, actorUserId)
    .first<WithOwner>();
  if (!r) return null;
  return {
    ...rowFromD1(r),
    ownerName: r.owner_name,
    ownerEmail: r.owner_email,
  };
}

export async function softDeleteScreenshotForAdmin(
  screenshotId: string,
  actorUserId: string,
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE screenshots
       SET state = 'deleted', updated_at = ?3
       WHERE id = ?1
         AND state = 'ready'
         AND (
           user_id = ?2
           OR workspace_id IN (
             SELECT id FROM workspace WHERE owner_user_id = ?2
           )
         )`,
  )
    .bind(screenshotId, actorUserId, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function updateScreenshotVisibilityForAdmin(
  actorUserId: string,
  screenshotId: string,
  visibility: ScreenshotVisibility,
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const res = await env.DB.prepare(
    `UPDATE screenshots
       SET visibility = ?3, updated_at = ?4
       WHERE id = ?1
         AND state = 'ready'
         AND (
           user_id = ?2
           OR workspace_id IN (
             SELECT id FROM workspace WHERE owner_user_id = ?2
           )
         )`,
  )
    .bind(screenshotId, actorUserId, visibility, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// Composed PNG can have different pixel dims than the original upload, so
// width/height must update alongside the bytes or the viewer letterboxes.
export async function updateScreenshotAfterEdit(
  screenshotId: string,
  userId: string,
  sizeBytes: number,
  width: number,
  height: number,
): Promise<boolean> {
  const env = await getAppWebEnv();
  if (!env?.DB) return false;
  const now = Date.now();
  const res = await env.DB.prepare(
    `UPDATE screenshots
       SET size_bytes = ?3, width = ?5, height = ?6, updated_at = ?4, edited_at = ?4
       WHERE id = ?1 AND user_id = ?2 AND state = 'ready'`,
  )
    .bind(screenshotId, userId, sizeBytes, now, width, height)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}
