import { getAppWebEnv } from "@/lib/cf-env";
import { DAY_MS, type DayCount } from "./dashboard-metrics";

export type DashboardActivity = {
  recordings: DayCount[];
  viewers: DayCount[];
};

export type DashboardTotals = {
  recordings: number;
  views: number;
  recordedMs: number;
  screenshots: number;
};

export type ActivityItem = {
  id: number;
  slug: string;
  title: string | null;
  kind: "reaction" | "comment";
  emoji: string | null;
  body: string | null;
  userName: string | null;
  createdAt: number;
};

// The lists' scope: the workspace's items, minus other people's private ones.
const VISIBLE_RECORDINGS =
  "r.workspace_id = ?1 AND (r.visibility != 'private' OR r.user_id = ?2)";

// Counts per UTC day since `sinceMs`.
export async function loadDashboardActivity(
  workspaceId: string,
  viewerUserId: string,
  sinceMs: number,
): Promise<DashboardActivity> {
  const env = await getAppWebEnv();
  if (!env?.DB) return { recordings: [], viewers: [] };
  const [recordings, viewers] = await Promise.all([
    env.DB.prepare(
      `SELECT r.created_at / ${DAY_MS} AS day, COUNT(*) AS n
         FROM recordings r
         WHERE ${VISIBLE_RECORDINGS} AND r.created_at >= ?3
         GROUP BY day`,
    )
      .bind(workspaceId, viewerUserId, sinceMs)
      .all<DayCount>(),
    env.DB.prepare(
      `SELECT v.first_viewed_at / ${DAY_MS} AS day, COUNT(*) AS n
         FROM recording_views v
         JOIN recordings r ON r.slug = v.slug
         WHERE ${VISIBLE_RECORDINGS} AND v.first_viewed_at >= ?3
         GROUP BY day`,
    )
      .bind(workspaceId, viewerUserId, sinceMs)
      .all<DayCount>(),
  ]);
  return { recordings: recordings.results, viewers: viewers.results };
}

export async function loadDashboardTotals(
  workspaceId: string,
  viewerUserId: string,
): Promise<DashboardTotals> {
  const env = await getAppWebEnv();
  if (!env?.DB)
    return { recordings: 0, views: 0, recordedMs: 0, screenshots: 0 };
  const [recordings, screenshots] = await Promise.all([
    env.DB.prepare(
      `SELECT COUNT(*) AS n,
              COALESCE(SUM(r.view_count), 0) AS views,
              COALESCE(SUM(r.duration_ms), 0) AS recordedMs
         FROM recordings r
         WHERE ${VISIBLE_RECORDINGS}`,
    )
      .bind(workspaceId, viewerUserId)
      .first<{ n: number; views: number; recordedMs: number }>(),
    env.DB.prepare(
      `SELECT COUNT(*) AS n
         FROM screenshots
         WHERE workspace_id = ?1
           AND state = 'ready'
           AND (visibility != 'private' OR user_id = ?2)`,
    )
      .bind(workspaceId, viewerUserId)
      .first<{ n: number }>(),
  ]);
  return {
    recordings: recordings?.n ?? 0,
    views: recordings?.views ?? 0,
    recordedMs: recordings?.recordedMs ?? 0,
    screenshots: screenshots?.n ?? 0,
  };
}

export async function listRecentActivity(
  workspaceId: string,
  viewerUserId: string,
  limit: number,
): Promise<ActivityItem[]> {
  const env = await getAppWebEnv();
  if (!env?.DB) return [];
  const res = await env.DB.prepare(
    `SELECT a.id, a.slug, r.title, a.kind, a.emoji, a.body,
            a.user_name AS userName, a.created_at AS createdAt
       FROM recording_activity a
       JOIN recordings r ON r.slug = a.slug
       WHERE ${VISIBLE_RECORDINGS}
       ORDER BY a.created_at DESC
       LIMIT ?3`,
  )
    .bind(workspaceId, viewerUserId, limit)
    .all<ActivityItem>();
  return res.results;
}
