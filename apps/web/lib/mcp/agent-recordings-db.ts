/// <reference types="@cloudflare/workers-types" />

import type { AgentUsage } from "@captureflow/quota";

export const MAX_RECORDING_MS = 10 * 60_000;
export const IDLE_MS = 2 * 60_000;
// Past this a session can't still be running: the recorder ends it at its length limit.
export const SESSION_LIFETIME_MS = MAX_RECORDING_MS + IDLE_MS + 5 * 60_000;

export type AgentRecordingRow = {
  id: string;
  userId: string;
  deviceTokenId: string;
  workspaceId: string | null;
  slug: string | null;
  createdAt: number;
};

type D1Row = {
  id: string;
  user_id: string;
  device_token_id: string;
  workspace_id: string | null;
  slug: string | null;
  created_at: number;
};

const toRow = (r: D1Row): AgentRecordingRow => ({
  id: r.id,
  userId: r.user_id,
  deviceTokenId: r.device_token_id,
  workspaceId: r.workspace_id,
  slug: r.slug,
  createdAt: r.created_at,
});

export async function insertAgentRecording(
  db: D1Database,
  row: {
    id: string;
    userId: string;
    deviceTokenId: string;
    workspaceId: string;
    now: number;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO agent_recordings
         (id, user_id, device_token_id, workspace_id, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    )
    .bind(row.id, row.userId, row.deviceTokenId, row.workspaceId, row.now)
    .run();
}

// A running session counts up to now, and never past the length it can run.
export async function getAgentUsage(
  db: D1Database,
  workspaceId: string,
  since: number,
  now: number,
): Promise<AgentUsage> {
  const row = await db
    .prepare(
      `SELECT
         COALESCE(SUM(MIN(COALESCE(ended_at, ?3), created_at + ?4) - created_at), 0) AS agent_ms,
         COALESCE(SUM(narrated_chars), 0) AS narrated_chars
         FROM agent_recordings
        WHERE workspace_id = ?1 AND created_at >= ?2`,
    )
    .bind(workspaceId, since, now, SESSION_LIFETIME_MS)
    .first<{ agent_ms: number; narrated_chars: number }>();
  return {
    agentMs: Math.max(0, row?.agent_ms ?? 0),
    narratedChars: row?.narrated_chars ?? 0,
  };
}

export async function addNarratedChars(
  db: D1Database,
  id: string,
  chars: number,
): Promise<void> {
  await db
    .prepare(
      `UPDATE agent_recordings SET narrated_chars = narrated_chars + ?2 WHERE id = ?1`,
    )
    .bind(id, chars)
    .run();
}

export async function setAgentRecordingSlug(
  db: D1Database,
  id: string,
  slug: string,
): Promise<void> {
  await db
    .prepare(`UPDATE agent_recordings SET slug = ?2 WHERE id = ?1`)
    .bind(id, slug)
    .run();
}

export async function getRunningAgentRecording(
  db: D1Database,
  userId: string,
  id: string,
): Promise<AgentRecordingRow | null> {
  const row = await db
    .prepare(
      `SELECT id, user_id, device_token_id, workspace_id, slug, created_at
         FROM agent_recordings
        WHERE id = ?1 AND user_id = ?2 AND ended_at IS NULL`,
    )
    .bind(id, userId)
    .first<D1Row>();
  return row ? toRow(row) : null;
}

export async function findRunningAgentRecording(
  db: D1Database,
  userId: string,
  since: number,
): Promise<AgentRecordingRow | null> {
  const row = await db
    .prepare(
      `SELECT id, user_id, device_token_id, workspace_id, slug, created_at
         FROM agent_recordings
        WHERE user_id = ?1 AND ended_at IS NULL AND created_at > ?2
        ORDER BY created_at DESC
        LIMIT 1`,
    )
    .bind(userId, since)
    .first<D1Row>();
  return row ? toRow(row) : null;
}

// Ends the session and revokes the token its upload used, in one batch.
export async function endAgentRecording(
  db: D1Database,
  id: string,
  now: number,
): Promise<void> {
  await db.batch([
    db
      .prepare(
        `UPDATE device_tokens SET revoked_at = ?2
          WHERE revoked_at IS NULL
            AND id = (SELECT device_token_id FROM agent_recordings WHERE id = ?1)`,
      )
      .bind(id, now),
    db
      .prepare(
        `UPDATE agent_recordings SET ended_at = ?2
          WHERE id = ?1 AND ended_at IS NULL`,
      )
      .bind(id, now),
  ]);
}

// A session the agent never stopped ended on its own in the recorder; this
// revokes its token once it can no longer be running.
export async function sweepAgentRecordings(
  db: D1Database,
  now: number,
): Promise<void> {
  const startedBefore = now - SESSION_LIFETIME_MS;
  await db.batch([
    db
      .prepare(
        `UPDATE device_tokens SET revoked_at = ?2
          WHERE revoked_at IS NULL
            AND id IN (SELECT device_token_id FROM agent_recordings
                        WHERE ended_at IS NULL AND created_at < ?1)`,
      )
      .bind(startedBefore, now),
    db
      .prepare(
        `UPDATE agent_recordings SET ended_at = ?2
          WHERE ended_at IS NULL AND created_at < ?1`,
      )
      .bind(startedBefore, now),
  ]);
}
