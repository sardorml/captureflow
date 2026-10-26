import { getAppWebEnv } from "@/lib/cf-env";
import { DAY_MS, type DayCount } from "./dashboard-metrics";

export type DashboardActivity = {
  recordings: DayCount[];
  screenshots: DayCount[];
  viewers: DayCount[];
};

const EMPTY: DashboardActivity = {
  recordings: [],
  screenshots: [],
  viewers: [],
};

// Counts per UTC day since `sinceMs`, scoped the way the lists are: the
// workspace's items, minus other people's private ones.
export async function loadDashboardActivity(
  workspaceId: string,
  viewerUserId: string,
  sinceMs: number,
): Promise<DashboardActivity> {
  const env = await getAppWebEnv();
  if (!env?.DB) return EMPTY;
  const [recordings, screenshots, viewers] = await Promise.all([
    env.DB.prepare(
      `SELECT created_at / ${DAY_MS} AS day, COUNT(*) AS n
         FROM recordings
         WHERE workspace_id = ?1
           AND (visibility != 'private' OR user_id = ?2)
           AND created_at >= ?3
         GROUP BY day`,
    )
      .bind(workspaceId, viewerUserId, sinceMs)
      .all<DayCount>(),
    env.DB.prepare(
      `SELECT created_at / ${DAY_MS} AS day, COUNT(*) AS n
         FROM screenshots
         WHERE workspace_id = ?1
           AND state = 'ready'
           AND (visibility != 'private' OR user_id = ?2)
           AND created_at >= ?3
         GROUP BY day`,
    )
      .bind(workspaceId, viewerUserId, sinceMs)
      .all<DayCount>(),
    env.DB.prepare(
      `SELECT v.first_viewed_at / ${DAY_MS} AS day, COUNT(*) AS n
         FROM recording_views v
         JOIN recordings r ON r.slug = v.slug
         WHERE r.workspace_id = ?1
           AND (r.visibility != 'private' OR r.user_id = ?2)
           AND v.first_viewed_at >= ?3
         GROUP BY day`,
    )
      .bind(workspaceId, viewerUserId, sinceMs)
      .all<DayCount>(),
  ]);
  return {
    recordings: recordings.results,
    screenshots: screenshots.results,
    viewers: viewers.results,
  };
}
