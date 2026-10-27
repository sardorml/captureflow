/// <reference types="@cloudflare/workers-types" />

import { isAssignableRole, type AssignableRole } from "./roles";

export type NotificationKind =
  | "member_joined"
  | "seat_requested"
  | "seat_denied"
  | "role_changed"
  | "downgrade_scheduled"
  | "removed";

const NOTIFICATION_KINDS: readonly NotificationKind[] = [
  "member_joined",
  "seat_requested",
  "seat_denied",
  "role_changed",
  "downgrade_scheduled",
  "removed",
];

export type NotificationRow = {
  id: string;
  workspace_id: string;
  workspace_name: string;
  kind: NotificationKind;
  actor_name: string | null;
  actor_email: string | null;
  actor_image: string | null;
  role: AssignableRole | null;
  effective_at: number | null;
  created_at: number;
  read_at: number | null;
};

type NotificationD1Row = Omit<NotificationRow, "kind" | "role"> & {
  kind: string;
  role: string | null;
};

export async function addNotification(
  db: D1Database,
  args: {
    userId: string;
    workspaceId: string;
    kind: NotificationKind;
    actorUserId: string | null;
    role?: AssignableRole | null;
    effectiveAt?: number | null;
    now: number;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO notification
         (id, user_id, workspace_id, kind, actor_user_id, role, effective_at,
          created_at, read_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, NULL)`,
    )
    .bind(
      crypto.randomUUID().replace(/-/g, ""),
      args.userId,
      args.workspaceId,
      args.kind,
      args.actorUserId,
      args.role ?? null,
      args.effectiveAt ?? null,
      args.now,
    )
    .run();
}

// Rows of a kind this build doesn't know are dropped rather than mislabelled.
export async function listNotifications(
  db: D1Database,
  userId: string,
  limit: number,
): Promise<NotificationRow[]> {
  const { results } = await db
    .prepare(
      `SELECT n.id, n.workspace_id, w.name AS workspace_name, n.kind,
              a.name AS actor_name, a.email AS actor_email,
              a.image AS actor_image, n.role, n.effective_at, n.created_at,
              n.read_at
         FROM notification n
         JOIN workspace w ON w.id = n.workspace_id
         LEFT JOIN users a ON a.id = n.actor_user_id
        WHERE n.user_id = ?1
        ORDER BY n.created_at DESC
        LIMIT ?2`,
    )
    .bind(userId, limit)
    .all<NotificationD1Row>();
  return (results ?? []).flatMap((row) => {
    const kind = NOTIFICATION_KINDS.find((k) => k === row.kind);
    if (!kind) return [];
    return [
      {
        ...row,
        kind,
        role: row.role && isAssignableRole(row.role) ? row.role : null,
      },
    ];
  });
}

export async function countUnreadNotifications(
  db: D1Database,
  userId: string,
): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM notification
        WHERE user_id = ?1 AND read_at IS NULL`,
    )
    .bind(userId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function markNotificationsRead(
  db: D1Database,
  userId: string,
  now: number,
): Promise<void> {
  await db
    .prepare(
      `UPDATE notification SET read_at = ?2
        WHERE user_id = ?1 AND read_at IS NULL`,
    )
    .bind(userId, now)
    .run();
}
