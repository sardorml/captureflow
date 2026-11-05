/// <reference types="@cloudflare/workers-types" />

import type { WorkspaceEntitlement } from "./seat-plans";

/*
 * Free-tier recording limits that staff raised from the admin dashboard, for
 * one person wherever they record or for everyone in one workspace. A null
 * field keeps the default. Paid and self-hosted workspaces have no caps, so
 * nothing here applies to them.
 */
export type LimitOverride = {
  recordings: number | null;
  maxRecordingMs: number | null;
};

export type LimitOverrideScope = "user" | "workspace";

export const LIMIT_OVERRIDE_MAX = { recordings: 10_000, minutes: 180 } as const;

const TABLES: Record<LimitOverrideScope, { table: string; key: string }> = {
  user: { table: "user_limit_override", key: "user_id" },
  workspace: { table: "workspace_limit_override", key: "workspace_id" },
};

type OverrideRow = {
  recordings: number | null;
  max_recording_ms: number | null;
};

const fromRow = (row: OverrideRow): LimitOverride => ({
  recordings: row.recordings,
  maxRecordingMs: row.max_recording_ms,
});

// An override only ever raises a cap: the largest value wins, and one below
// the default is ignored.
export function applyLimitOverrides(
  entitlement: WorkspaceEntitlement,
  overrides: LimitOverride[],
): WorkspaceEntitlement {
  if (entitlement.tier !== "free") return entitlement;
  const raise = (base: number | null, values: (number | null)[]) =>
    base === null ? null : Math.max(base, ...values.map((v) => v ?? 0));
  const recordingsPerPerson = raise(
    entitlement.recordingsPerPerson,
    overrides.map((o) => o.recordings),
  );
  const maxRecordingMs = raise(
    entitlement.maxRecordingMs,
    overrides.map((o) => o.maxRecordingMs),
  );
  // The byte ceiling is sized for the length cap, so it grows with it.
  const maxRecordingBytes =
    entitlement.maxRecordingBytes === null ||
    entitlement.maxRecordingMs === null ||
    maxRecordingMs === null
      ? entitlement.maxRecordingBytes
      : Math.ceil(
          entitlement.maxRecordingBytes *
            (maxRecordingMs / entitlement.maxRecordingMs),
        );
  return {
    ...entitlement,
    recordingsPerPerson,
    maxRecordingMs,
    maxRecordingBytes,
  };
}

export async function getLimitOverride(
  db: D1Database,
  scope: LimitOverrideScope,
  id: string,
): Promise<LimitOverride | null> {
  const { table, key } = TABLES[scope];
  const row = await db
    .prepare(
      `SELECT recordings, max_recording_ms FROM ${table} WHERE ${key} = ?1`,
    )
    .bind(id)
    .first<OverrideRow>();
  return row ? fromRow(row) : null;
}

// The workspace's override and, when a person is named, theirs: one round trip.
export async function listLimitOverrides(
  db: D1Database,
  args: { workspaceId: string; userId?: string | null },
): Promise<LimitOverride[]> {
  const { results } = await db
    .prepare(
      `SELECT recordings, max_recording_ms FROM workspace_limit_override
        WHERE workspace_id = ?1
       UNION ALL
       SELECT recordings, max_recording_ms FROM user_limit_override
        WHERE user_id = ?2`,
    )
    .bind(args.workspaceId, args.userId ?? null)
    .all<OverrideRow>();
  return (results ?? []).map(fromRow);
}

// Clearing both fields removes the row, which puts the defaults back.
export async function setLimitOverride(
  db: D1Database,
  scope: LimitOverrideScope,
  id: string,
  override: LimitOverride,
  updatedBy: string,
): Promise<void> {
  const { table, key } = TABLES[scope];
  if (override.recordings === null && override.maxRecordingMs === null) {
    await db.prepare(`DELETE FROM ${table} WHERE ${key} = ?1`).bind(id).run();
    return;
  }
  await db
    .prepare(
      `INSERT INTO ${table}
         (${key}, recordings, max_recording_ms, updated_at, updated_by)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT (${key}) DO UPDATE SET
           recordings = excluded.recordings,
           max_recording_ms = excluded.max_recording_ms,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`,
    )
    .bind(
      id,
      override.recordings,
      override.maxRecordingMs,
      Date.now(),
      updatedBy,
    )
    .run();
}
