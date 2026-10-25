/// <reference types="@cloudflare/workers-types" />

export type StorageItemKind = "recording" | "screenshot";

export type StorageItem = {
  kind: StorageItemKind;
  id: string;
  title: string | null;
  bytes: number;
  createdAt: number;
  workspaceName: string;
};

type Row = {
  kind: StorageItemKind;
  id: string;
  title: string | null;
  bytes: number;
  created_at: number;
  workspace_name: string;
};

// Same ownership scope as totalStorageForUser, largest first, so the page
// shows exactly what the meter counts.
export async function listStorageItemsForUser(
  db: D1Database,
  userId: string,
  limit: number,
): Promise<StorageItem[]> {
  const res = await db
    .prepare(
      `SELECT kind, id, title, bytes, created_at, workspace_name FROM (
         SELECT 'recording' AS kind, r.slug AS id, r.title AS title,
                r.size_bytes + r.webcam_size_bytes AS bytes,
                r.created_at AS created_at, w.name AS workspace_name
           FROM recordings r JOIN workspace w ON w.id = r.workspace_id
          WHERE w.owner_user_id = ?1 AND r.state = 'ready'
         UNION ALL
         SELECT 'screenshot', s.id, s.title, s.size_bytes, s.created_at, w.name
           FROM screenshots s JOIN workspace w ON w.id = s.workspace_id
          WHERE w.owner_user_id = ?1 AND s.state = 'ready'
       )
       ORDER BY bytes DESC, created_at DESC
       LIMIT ?2`,
    )
    .bind(userId, limit)
    .all<Row>();
  return res.results.map((r) => ({
    kind: r.kind,
    id: r.id,
    title: r.title,
    bytes: r.bytes,
    createdAt: r.created_at,
    workspaceName: r.workspace_name,
  }));
}
