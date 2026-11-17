/// <reference types="@cloudflare/workers-types" />

import type { AgentUsage } from "./seat-plans";

export const AGENT_MAX_RECORDING_MS = 10 * 60_000;
export const AGENT_IDLE_MS = 2 * 60_000;
// Past this a session can't still be running: the recorder ends it at its length limit.
export const AGENT_SESSION_LIFETIME_MS =
  AGENT_MAX_RECORDING_MS + AGENT_IDLE_MS + 5 * 60_000;

// A running session counts up to now, and never past the length it can run.
// Sessions from before staff last reset the workspace's usage don't count.
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
        WHERE workspace_id = ?1
          AND created_at >= MAX(?2, COALESCE((SELECT reset_at FROM workspace_agent_usage_reset
                                               WHERE workspace_id = ?1), 0))`,
    )
    .bind(workspaceId, since, now, AGENT_SESSION_LIFETIME_MS)
    .first<{ agent_ms: number; narrated_chars: number }>();
  return {
    agentMs: Math.max(0, row?.agent_ms ?? 0),
    narratedChars: row?.narrated_chars ?? 0,
  };
}

export async function resetAgentUsage(
  db: D1Database,
  workspaceId: string,
  resetBy: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO workspace_agent_usage_reset (workspace_id, reset_at, reset_by)
         VALUES (?1, ?2, ?3)
         ON CONFLICT (workspace_id) DO UPDATE SET
           reset_at = excluded.reset_at,
           reset_by = excluded.reset_by`,
    )
    .bind(workspaceId, Date.now(), resetBy)
    .run();
}
