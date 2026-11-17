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
// Recordings from before staff last reset the count don't count.
export async function countUserRecordingsInWorkspace(
  db: D1Database,
  workspaceId: string,
  userId: string,
): Promise<number> {
  const r = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM recordings
        WHERE workspace_id = ?1 AND user_id = ?2 AND state != 'failed'
          AND created_at > COALESCE((SELECT reset_at FROM user_recording_count_reset
                                      WHERE user_id = ?2), 0)`,
    )
    .bind(workspaceId, userId)
    .first<{ n: number }>();
  return r?.n ?? 0;
}

export async function getRecordingCountReset(
  db: D1Database,
  userId: string,
): Promise<number | null> {
  const r = await db
    .prepare(
      `SELECT reset_at FROM user_recording_count_reset WHERE user_id = ?1`,
    )
    .bind(userId)
    .first<{ reset_at: number }>();
  return r?.reset_at ?? null;
}

export async function resetRecordingCount(
  db: D1Database,
  userId: string,
  resetBy: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO user_recording_count_reset (user_id, reset_at, reset_by)
         VALUES (?1, ?2, ?3)
         ON CONFLICT (user_id) DO UPDATE SET
           reset_at = excluded.reset_at,
           reset_by = excluded.reset_by`,
    )
    .bind(userId, Date.now(), resetBy)
    .run();
}
