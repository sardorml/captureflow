/// <reference types="@cloudflare/workers-types" />

// Aggregate bytes and counts across `shares` ∪ `snaps` for a user,
// scoped by workspace ownership: every artifact in a workspace the user
// owns counts toward their cap, regardless of who uploaded it. So a Pro
// owner who invites teammates pays for team uploads into their workspace;
// the uploader's own tier only governs their personal workspace.
//
// `state = 'ready'` excludes abandoned multipart uploads (the hourly GC
// reaps stale `pending` rows), so this only sees committed bytes.
//
// Both helpers run two scalar subqueries in one statement to keep the
// call to a single D1 round trip.

export async function totalStorageForUser(
  db: D1Database,
  userId: string
): Promise<number> {
  const r = await db
    .prepare(
      `SELECT
         COALESCE((SELECT SUM(s.size_bytes) FROM shares s
                    JOIN workspace w ON w.id = s.workspace_id
                    WHERE w.owner_user_id = ?1 AND s.state = 'ready'), 0) +
         COALESCE((SELECT SUM(s.size_bytes) FROM snaps s
                    JOIN workspace w ON w.id = s.workspace_id
                    WHERE w.owner_user_id = ?1 AND s.state = 'ready'), 0)
         AS total`
    )
    .bind(userId)
    .first<{ total: number }>();
  return r?.total ?? 0;
}

export async function activeArtifactCountForUser(
  db: D1Database,
  userId: string
): Promise<number> {
  const r = await db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM shares s
            JOIN workspace w ON w.id = s.workspace_id
            WHERE w.owner_user_id = ?1 AND s.state = 'ready') +
         (SELECT COUNT(*) FROM snaps s
            JOIN workspace w ON w.id = s.workspace_id
            WHERE w.owner_user_id = ?1 AND s.state = 'ready')
         AS n`
    )
    .bind(userId)
    .first<{ n: number }>();
  return r?.n ?? 0;
}
