import { getAppWebEnv } from "@/lib/cf-env";

export type DashboardTotals = {
  recordings: number;
  views: number;
  recordedMs: number;
  screenshots: number;
};

// The lists' scope: the workspace's items, minus other people's private ones.
const VISIBLE_RECORDINGS =
  "r.workspace_id = ?1 AND (r.visibility != 'private' OR r.user_id = ?2)";

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
