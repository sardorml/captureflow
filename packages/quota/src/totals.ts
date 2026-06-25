/// <reference types="@cloudflare/workers-types" />

/*
 * Quota is scoped by workspace ownership: every artifact in a workspace the
 * user owns counts toward their cap regardless of uploader, so a Pro owner
 * pays for teammates' uploads into their workspace. `state = 'ready'` excludes
 * abandoned multipart uploads still being reaped by the hourly GC.
 */

export async function totalStorageForUser(
  db: D1Database,
  userId: string,
): Promise<number> {
  const r = await db
    .prepare(
      `SELECT
         COALESCE((SELECT SUM(s.size_bytes) FROM recordings s
                    JOIN workspace w ON w.id = s.workspace_id
                    WHERE w.owner_user_id = ?1 AND s.state = 'ready'), 0) +
         COALESCE((SELECT SUM(s.size_bytes) FROM screenshots s
                    JOIN workspace w ON w.id = s.workspace_id
                    WHERE w.owner_user_id = ?1 AND s.state = 'ready'), 0)
         AS total`,
    )
    .bind(userId)
    .first<{ total: number }>();
  return r?.total ?? 0;
}

export async function activeArtifactCountForUser(
  db: D1Database,
  userId: string,
): Promise<number> {
  const r = await db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM recordings s
            JOIN workspace w ON w.id = s.workspace_id
            WHERE w.owner_user_id = ?1 AND s.state = 'ready') +
         (SELECT COUNT(*) FROM screenshots s
            JOIN workspace w ON w.id = s.workspace_id
            WHERE w.owner_user_id = ?1 AND s.state = 'ready')
         AS n`,
    )
    .bind(userId)
    .first<{ n: number }>();
  return r?.n ?? 0;
}
