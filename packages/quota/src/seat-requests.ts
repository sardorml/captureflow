/// <reference types="@cloudflare/workers-types" />

/*
 * Paid seats change only by the owner's decision: a viewer asks, the owner
 * approves or denies. A member moved to viewer in a paid workspace keeps the
 * seat until the period they were billed for ends.
 */

export type SeatRequest = {
  user_id: string;
  name: string;
  email: string;
  image: string | null;
  created_at: number;
};

export async function requestSeat(
  db: D1Database,
  args: { workspaceId: string; userId: string; now: number },
): Promise<{ created: boolean }> {
  const result = await db
    .prepare(
      `INSERT OR IGNORE INTO seat_request (workspace_id, user_id, created_at)
       SELECT ?1, ?2, ?3
        WHERE EXISTS (
          SELECT 1 FROM workspace_member
           WHERE workspace_id = ?1 AND user_id = ?2 AND role = 'viewer'
        )`,
    )
    .bind(args.workspaceId, args.userId, args.now)
    .run();
  return { created: (result.meta?.changes ?? 0) > 0 };
}

export async function hasSeatRequest(
  db: D1Database,
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT 1 AS found FROM seat_request
        WHERE workspace_id = ?1 AND user_id = ?2 LIMIT 1`,
    )
    .bind(workspaceId, userId)
    .first<{ found: number }>();
  return row !== null;
}

export async function listSeatRequests(
  db: D1Database,
  workspaceId: string,
): Promise<SeatRequest[]> {
  const { results } = await db
    .prepare(
      `SELECT u.id AS user_id, u.name AS name, u.email AS email,
              u.image AS image, r.created_at AS created_at
         FROM seat_request r
         JOIN workspace_member m
           ON m.workspace_id = r.workspace_id AND m.user_id = r.user_id
         JOIN users u ON u.id = r.user_id
        WHERE r.workspace_id = ?1 AND m.role = 'viewer'
        ORDER BY r.created_at ASC`,
    )
    .bind(workspaceId)
    .all<SeatRequest>();
  return results ?? [];
}

export async function clearSeatRequest(
  db: D1Database,
  workspaceId: string,
  userId: string,
): Promise<void> {
  await db
    .prepare(
      `DELETE FROM seat_request WHERE workspace_id = ?1 AND user_id = ?2`,
    )
    .bind(workspaceId, userId)
    .run();
}

export async function scheduleMemberDowngrade(
  db: D1Database,
  args: { workspaceId: string; userId: string; at: number },
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE workspace_member SET downgrade_at = ?3
        WHERE workspace_id = ?1 AND user_id = ?2 AND role = 'member'`,
    )
    .bind(args.workspaceId, args.userId, args.at)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

export async function cancelMemberDowngrade(
  db: D1Database,
  workspaceId: string,
  userId: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE workspace_member SET downgrade_at = NULL
        WHERE workspace_id = ?1 AND user_id = ?2`,
    )
    .bind(workspaceId, userId)
    .run();
}

// Returns the workspaces whose seat count changed, for the caller to sync.
export async function applyDueDowngrades(
  db: D1Database,
  now: number,
): Promise<string[]> {
  const { results } = await db
    .prepare(
      `SELECT DISTINCT workspace_id FROM workspace_member
        WHERE downgrade_at IS NOT NULL AND downgrade_at <= ?1`,
    )
    .bind(now)
    .all<{ workspace_id: string }>();
  if (!results?.length) return [];
  await db
    .prepare(
      `UPDATE workspace_member SET role = 'viewer', downgrade_at = NULL
        WHERE downgrade_at IS NOT NULL AND downgrade_at <= ?1
          AND role = 'member'`,
    )
    .bind(now)
    .run();
  return results.map((r) => r.workspace_id);
}
