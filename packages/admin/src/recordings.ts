/// <reference types="@cloudflare/workers-types" />

import { ADMIN_PAGE_SIZE, weeklyBuckets, type Page } from "./directory";

export type RecordingVisibilityFilter =
  | "all"
  | "public"
  | "workspace"
  | "private";

export type RecordingSort = "newest" | "views" | "storage";

export type AdminRecordingRow = {
  slug: string;
  title: string | null;
  state: string;
  visibility: string;
  sizeBytes: number;
  durationMs: number | null;
  viewCount: number;
  viewerCount: number;
  commentCount: number;
  reactionCount: number;
  createdAt: number;
  lastViewedAt: number | null;
  owner: { id: string; name: string; email: string } | null;
  workspace: { id: string; name: string } | null;
};

export type AdminRecordingTotals = {
  views: number;
  viewers: number;
  recordedMs: number;
  recordingBytes: number;
  publicRecordings: number;
};

const WEEK_MS = 7 * 24 * 3600 * 1000;

const RECORDING_SELECT = `
  SELECT r.slug, r.title, r.state, r.visibility,
         r.size_bytes + r.webcam_size_bytes AS size_bytes, r.duration_ms,
         r.view_count, r.created_at,
         (SELECT COUNT(*) FROM recording_views v WHERE v.slug = r.slug) AS viewer_count,
         (SELECT MAX(v.last_viewed_at) FROM recording_views v WHERE v.slug = r.slug) AS last_viewed_at,
         (SELECT COUNT(*) FROM recording_activity a
           WHERE a.slug = r.slug AND a.kind = 'comment') AS comment_count,
         (SELECT COUNT(*) FROM recording_activity a
           WHERE a.slug = r.slug AND a.kind = 'reaction') AS reaction_count,
         u.id AS owner_id, u.name AS owner_name, u.email AS owner_email,
         w.id AS workspace_id, w.name AS workspace_name
    FROM recordings r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN workspace w ON w.id = r.workspace_id`;

const RECORDING_WHERE = `
  WHERE (?1 = '' OR r.title LIKE ?2 OR r.slug LIKE ?2
         OR u.email LIKE ?2 OR u.name LIKE ?2 OR w.name LIKE ?2)
    AND (?3 = 'all' OR r.visibility = ?3)`;

const RECORDING_ORDER: Record<RecordingSort, string> = {
  newest: "r.created_at DESC",
  views: "r.view_count DESC, r.created_at DESC",
  storage: "size_bytes DESC, r.created_at DESC",
};

type RecordingD1Row = {
  slug: string;
  title: string | null;
  state: string;
  visibility: string;
  size_bytes: number;
  duration_ms: number | null;
  view_count: number;
  created_at: number;
  viewer_count: number;
  last_viewed_at: number | null;
  comment_count: number;
  reaction_count: number;
  owner_id: string | null;
  owner_name: string | null;
  owner_email: string | null;
  workspace_id: string | null;
  workspace_name: string | null;
};

function recordingFromD1(r: RecordingD1Row): AdminRecordingRow {
  return {
    slug: r.slug,
    title: r.title,
    state: r.state,
    visibility: r.visibility,
    sizeBytes: r.size_bytes,
    durationMs: r.duration_ms,
    viewCount: r.view_count,
    viewerCount: r.viewer_count,
    commentCount: r.comment_count,
    reactionCount: r.reaction_count,
    createdAt: r.created_at,
    lastViewedAt: r.last_viewed_at,
    owner: r.owner_id
      ? {
          id: r.owner_id,
          name: r.owner_name ?? "",
          email: r.owner_email ?? "",
        }
      : null,
    workspace: r.workspace_id
      ? { id: r.workspace_id, name: r.workspace_name ?? "" }
      : null,
  };
}

export async function listAdminRecordings(
  db: D1Database,
  opts: {
    search: string;
    page: number;
    visibility: RecordingVisibilityFilter;
    sort?: RecordingSort;
    pageSize?: number;
  },
): Promise<Page<AdminRecordingRow>> {
  const pageSize = opts.pageSize ?? ADMIN_PAGE_SIZE;
  const term = opts.search.trim();
  const args = [term, `%${term}%`, opts.visibility];
  const [{ results }, count] = await Promise.all([
    db
      .prepare(
        `${RECORDING_SELECT} ${RECORDING_WHERE}
         ORDER BY ${RECORDING_ORDER[opts.sort ?? "newest"]} LIMIT ?4 OFFSET ?5`,
      )
      .bind(...args, pageSize, Math.max(0, opts.page - 1) * pageSize)
      .all<RecordingD1Row>(),
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM recordings r
           LEFT JOIN users u ON u.id = r.user_id
           LEFT JOIN workspace w ON w.id = r.workspace_id
         ${RECORDING_WHERE}`,
      )
      .bind(...args)
      .first<{ n: number }>(),
  ]);
  return {
    rows: (results ?? []).map(recordingFromD1),
    total: count?.n ?? 0,
  };
}

export async function getRecordingTotals(
  db: D1Database,
): Promise<AdminRecordingTotals> {
  const row = await db
    .prepare(
      `SELECT
         (SELECT COALESCE(SUM(view_count), 0) FROM recordings
           WHERE state = 'ready') AS views,
         (SELECT COUNT(*) FROM recording_views) AS viewers,
         (SELECT COALESCE(SUM(duration_ms), 0) FROM recordings
           WHERE state = 'ready') AS recorded_ms,
         (SELECT COALESCE(SUM(size_bytes + webcam_size_bytes), 0) FROM recordings
           WHERE state = 'ready') AS recording_bytes,
         (SELECT COUNT(*) FROM recordings
           WHERE state = 'ready' AND visibility = 'public') AS public_recordings`,
    )
    .first<{
      views: number;
      viewers: number;
      recorded_ms: number;
      recording_bytes: number;
      public_recordings: number;
    }>();
  return {
    views: row?.views ?? 0,
    viewers: row?.viewers ?? 0,
    recordedMs: row?.recorded_ms ?? 0,
    recordingBytes: row?.recording_bytes ?? 0,
    publicRecordings: row?.public_recordings ?? 0,
  };
}

// Finished recordings and first-time viewers, a bucket a week, oldest first.
export async function getRecordingActivityByWeek(
  db: D1Database,
  weeks = 12,
): Promise<{ recordings: number[]; viewers: number[] }> {
  const now = Date.now();
  const since = now - weeks * WEEK_MS;
  const [recordings, viewers] = await Promise.all([
    db
      .prepare(
        `SELECT created_at AS t FROM recordings
          WHERE state = 'ready' AND created_at > ?1`,
      )
      .bind(since)
      .all<{ t: number }>(),
    db
      .prepare(
        `SELECT first_viewed_at AS t FROM recording_views WHERE first_viewed_at > ?1`,
      )
      .bind(since)
      .all<{ t: number }>(),
  ]);
  const times = (rows: { t: number }[] | undefined) =>
    (rows ?? []).map((r) => r.t);
  return {
    recordings: weeklyBuckets(times(recordings.results), weeks, now),
    viewers: weeklyBuckets(times(viewers.results), weeks, now),
  };
}
