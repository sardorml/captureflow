/// <reference types="@cloudflare/workers-types" />

/*
 * Storage pools per workspace, whoever uploaded. `state = 'ready'` excludes
 * abandoned multipart uploads still being reaped by the hourly GC.
 */
export async function totalStorageForWorkspace(
  db: D1Database,
  workspaceId: string,
): Promise<number> {
  const r = await db
    .prepare(
      `SELECT
         COALESCE((SELECT SUM(size_bytes + webcam_size_bytes) FROM recordings
                    WHERE workspace_id = ?1 AND state = 'ready'), 0) +
         COALESCE((SELECT SUM(size_bytes) FROM screenshots
                    WHERE workspace_id = ?1 AND state = 'ready'), 0)
         AS total`,
    )
    .bind(workspaceId)
    .first<{ total: number }>();
  return r?.total ?? 0;
}

// The free tier's per-person cap counts a member's recordings in one
// workspace; pending rows count too, or a burst of starts would slip past it.
export async function countUserRecordingsInWorkspace(
  db: D1Database,
  workspaceId: string,
  userId: string,
): Promise<number> {
  const r = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM recordings
        WHERE workspace_id = ?1 AND user_id = ?2 AND state != 'failed'`,
    )
    .bind(workspaceId, userId)
    .first<{ n: number }>();
  return r?.n ?? 0;
}
