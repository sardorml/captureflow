/// <reference types="@cloudflare/workers-types" />

import type { AdminRole, AdminStatus } from "./roles";

export type AdminAccount = {
  id: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: number;
  lastLoginAt: number | null;
};

export type AdminInvite = {
  tokenHash: string;
  email: string;
  role: AdminRole;
  invitedBy: string;
  createdAt: number;
  expiresAt: number;
  acceptedAt: number | null;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  recordingCount: number;
  screenshotCount: number;
  storageBytes: number;
};

export type AdminQuotaRow = {
  storageBytesOverride: number | null;
  note: string | null;
  updatedAt: number | null;
};

export type AdminAuditRow = {
  id: number;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string | null;
  createdAt: number;
};

export type AdminTotals = {
  users: number;
  recordings: number;
  screenshots: number;
  storageBytes: number;
};

const ACCOUNT_COLUMNS = "id, email, role, status, created_at, last_login_at";

type AccountD1Row = {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: number;
  last_login_at: number | null;
};

function accountFromD1(r: AccountD1Row): AdminAccount {
  return {
    id: r.id,
    email: r.email,
    role: r.role as AdminRole,
    status: r.status as AdminStatus,
    createdAt: r.created_at,
    lastLoginAt: r.last_login_at,
  };
}

export async function countAdmins(db: D1Database): Promise<number> {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM admin_users`)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function listAdmins(db: D1Database): Promise<AdminAccount[]> {
  const { results } = await db
    .prepare(`SELECT ${ACCOUNT_COLUMNS} FROM admin_users ORDER BY created_at`)
    .all<AccountD1Row>();
  return (results ?? []).map(accountFromD1);
}

export async function getAdmin(
  db: D1Database,
  id: string,
): Promise<AdminAccount | null> {
  const row = await db
    .prepare(`SELECT ${ACCOUNT_COLUMNS} FROM admin_users WHERE id = ?1 LIMIT 1`)
    .bind(id)
    .first<AccountD1Row>();
  return row ? accountFromD1(row) : null;
}

export async function getAdminCredentials(
  db: D1Database,
  email: string,
): Promise<{ account: AdminAccount; passwordHash: string } | null> {
  const row = await db
    .prepare(
      `SELECT ${ACCOUNT_COLUMNS}, password_hash FROM admin_users
       WHERE email = ?1 LIMIT 1`,
    )
    .bind(email)
    .first<AccountD1Row & { password_hash: string }>();
  return row
    ? { account: accountFromD1(row), passwordHash: row.password_hash }
    : null;
}

export async function createAdmin(
  db: D1Database,
  admin: { id: string; email: string; passwordHash: string; role: AdminRole },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO admin_users
       (id, email, password_hash, role, status, created_at)
     VALUES (?1, ?2, ?3, ?4, 'active', ?5)`,
    )
    .bind(admin.id, admin.email, admin.passwordHash, admin.role, Date.now())
    .run();
}

export async function updateAdminRole(
  db: D1Database,
  id: string,
  role: AdminRole,
): Promise<void> {
  await db
    .prepare(`UPDATE admin_users SET role = ?2 WHERE id = ?1`)
    .bind(id, role)
    .run();
}

export async function setAdminStatus(
  db: D1Database,
  id: string,
  status: AdminStatus,
): Promise<void> {
  await db
    .prepare(`UPDATE admin_users SET status = ?2 WHERE id = ?1`)
    .bind(id, status)
    .run();
}

export async function deleteAdmin(db: D1Database, id: string): Promise<void> {
  await db.prepare(`DELETE FROM admin_users WHERE id = ?1`).bind(id).run();
}

export async function touchAdminLogin(
  db: D1Database,
  id: string,
): Promise<void> {
  await db
    .prepare(`UPDATE admin_users SET last_login_at = ?2 WHERE id = ?1`)
    .bind(id, Date.now())
    .run();
}

const INVITE_COLUMNS =
  "token_hash, email, role, invited_by, created_at, expires_at, accepted_at";

type InviteD1Row = {
  token_hash: string;
  email: string;
  role: string;
  invited_by: string;
  created_at: number;
  expires_at: number;
  accepted_at: number | null;
};

function inviteFromD1(r: InviteD1Row): AdminInvite {
  return {
    tokenHash: r.token_hash,
    email: r.email,
    role: r.role as AdminRole,
    invitedBy: r.invited_by,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    acceptedAt: r.accepted_at,
  };
}

export async function createInvite(
  db: D1Database,
  invite: {
    tokenHash: string;
    email: string;
    role: AdminRole;
    invitedBy: string;
    expiresAt: number;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO admin_invites
       (token_hash, email, role, invited_by, created_at, expires_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(
      invite.tokenHash,
      invite.email,
      invite.role,
      invite.invitedBy,
      Date.now(),
      invite.expiresAt,
    )
    .run();
}

// Returns the invite only while it is still claimable, so callers cannot forget
// to check expiry or reuse.
export async function getPendingInvite(
  db: D1Database,
  tokenHash: string,
): Promise<AdminInvite | null> {
  const row = await db
    .prepare(
      `SELECT ${INVITE_COLUMNS} FROM admin_invites
       WHERE token_hash = ?1 AND accepted_at IS NULL AND expires_at > ?2
       LIMIT 1`,
    )
    .bind(tokenHash, Date.now())
    .first<InviteD1Row>();
  return row ? inviteFromD1(row) : null;
}

export async function listPendingInvites(
  db: D1Database,
): Promise<AdminInvite[]> {
  const { results } = await db
    .prepare(
      `SELECT ${INVITE_COLUMNS} FROM admin_invites
       WHERE accepted_at IS NULL AND expires_at > ?1
       ORDER BY created_at DESC`,
    )
    .bind(Date.now())
    .all<InviteD1Row>();
  return (results ?? []).map(inviteFromD1);
}

/*
 * Marks the invite claimed only if it is still pending, and reports whether it
 * won. Two people opening the same link race here, and the loser must not get
 * an account.
 */
export async function claimInvite(
  db: D1Database,
  tokenHash: string,
): Promise<boolean> {
  const res = await db
    .prepare(
      `UPDATE admin_invites SET accepted_at = ?2
       WHERE token_hash = ?1 AND accepted_at IS NULL AND expires_at > ?2`,
    )
    .bind(tokenHash, Date.now())
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function deleteInvite(
  db: D1Database,
  tokenHash: string,
): Promise<void> {
  await db
    .prepare(`DELETE FROM admin_invites WHERE token_hash = ?1`)
    .bind(tokenHash)
    .run();
}

export async function createSetupToken(
  db: D1Database,
  tokenHash: string,
  expiresAt: number,
): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO admin_setup_tokens
       (token_hash, created_at, expires_at) VALUES (?1, ?2, ?3)`,
    )
    .bind(tokenHash, Date.now(), expiresAt)
    .run();
}

/*
 * Single-use: the row is deleted as it is checked, so a token cannot be spent
 * twice even if two requests arrive together.
 */
export async function consumeSetupToken(
  db: D1Database,
  tokenHash: string,
): Promise<boolean> {
  const res = await db
    .prepare(
      `DELETE FROM admin_setup_tokens
       WHERE token_hash = ?1 AND expires_at > ?2`,
    )
    .bind(tokenHash, Date.now())
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function clearSetupTokens(db: D1Database): Promise<void> {
  await db.prepare(`DELETE FROM admin_setup_tokens`).run();
}

/*
 * Storage is summed from both artifact tables in one pass per user. Rows in a
 * deleted state still occupy R2 until the retention sweep runs, so they are
 * excluded here to match what the quota code counts as live.
 */
const USER_SELECT = `
  SELECT u.id, u.name, u.email, u.createdAt AS created_at,
         COALESCE(r.n, 0)  AS recording_count,
         COALESCE(s.n, 0)  AS screenshot_count,
         COALESCE(r.b, 0) + COALESCE(s.b, 0) AS storage_bytes
    FROM users u
    LEFT JOIN (SELECT user_id, COUNT(*) n, SUM(size_bytes) b
                 FROM recordings WHERE state != 'deleted' GROUP BY user_id) r
      ON r.user_id = u.id
    LEFT JOIN (SELECT user_id, COUNT(*) n, SUM(size_bytes) b
                 FROM screenshots WHERE state != 'deleted' GROUP BY user_id) s
      ON s.user_id = u.id`;

type UserD1Row = {
  id: string;
  name: string;
  email: string;
  created_at: number;
  recording_count: number;
  screenshot_count: number;
  storage_bytes: number;
};

function userFromD1(r: UserD1Row): AdminUserRow {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    createdAt: r.created_at,
    recordingCount: r.recording_count,
    screenshotCount: r.screenshot_count,
    storageBytes: r.storage_bytes,
  };
}

export async function listAdminUsers(
  db: D1Database,
  search: string,
  limit = 50,
): Promise<AdminUserRow[]> {
  const term = search.trim();
  const stmt = term
    ? db
        .prepare(
          `${USER_SELECT} WHERE u.email LIKE ?1 OR u.name LIKE ?1
         ORDER BY u.createdAt DESC LIMIT ?2`,
        )
        .bind(`%${term}%`, limit)
    : db
        .prepare(`${USER_SELECT} ORDER BY u.createdAt DESC LIMIT ?1`)
        .bind(limit);
  const { results } = await stmt.all<UserD1Row>();
  return (results ?? []).map(userFromD1);
}

export async function getAdminUser(
  db: D1Database,
  id: string,
): Promise<AdminUserRow | null> {
  const row = await db
    .prepare(`${USER_SELECT} WHERE u.id = ?1 LIMIT 1`)
    .bind(id)
    .first<UserD1Row>();
  return row ? userFromD1(row) : null;
}

export async function getUserQuota(
  db: D1Database,
  userId: string,
): Promise<AdminQuotaRow> {
  const empty: AdminQuotaRow = {
    storageBytesOverride: null,
    note: null,
    updatedAt: null,
  };
  const row = await db
    .prepare(
      `SELECT storage_bytes_override, note, updated_at
       FROM user_quotas WHERE user_id = ?1 LIMIT 1`,
    )
    .bind(userId)
    .first<{
      storage_bytes_override: number | null;
      note: string | null;
      updated_at: number;
    }>();
  return row
    ? {
        storageBytesOverride: row.storage_bytes_override,
        note: row.note,
        updatedAt: row.updated_at,
      }
    : empty;
}

export async function setUserQuota(
  db: D1Database,
  userId: string,
  quota: Omit<AdminQuotaRow, "updatedAt">,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO user_quotas
       (user_id, storage_bytes_override, note, updated_at)
     VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(user_id) DO UPDATE SET
       storage_bytes_override = excluded.storage_bytes_override,
       note = excluded.note,
       updated_at = excluded.updated_at`,
    )
    .bind(userId, quota.storageBytesOverride, quota.note, Date.now())
    .run();
}

export async function getAdminTotals(db: D1Database): Promise<AdminTotals> {
  const empty = { users: 0, recordings: 0, screenshots: 0, storageBytes: 0 };
  const row = await db
    .prepare(
      `SELECT
       (SELECT COUNT(*) FROM users) AS users,
       (SELECT COUNT(*) FROM recordings WHERE state != 'deleted') AS recordings,
       (SELECT COUNT(*) FROM screenshots WHERE state != 'deleted') AS screenshots,
       (SELECT COALESCE(SUM(size_bytes), 0) FROM recordings WHERE state != 'deleted')
       + (SELECT COALESCE(SUM(size_bytes), 0) FROM screenshots WHERE state != 'deleted')
         AS storage_bytes`,
    )
    .first<{
      users: number;
      recordings: number;
      screenshots: number;
      storage_bytes: number;
    }>();
  return row
    ? {
        users: row.users,
        recordings: row.recordings,
        screenshots: row.screenshots,
        storageBytes: row.storage_bytes,
      }
    : empty;
}

export async function writeAudit(
  db: D1Database,
  entry: {
    actor: string;
    action: string;
    targetType: string;
    targetId: string;
    detail?: string | null;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO admin_audit
       (actor, action, target_type, target_id, detail, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(
      entry.actor,
      entry.action,
      entry.targetType,
      entry.targetId,
      entry.detail ?? null,
      Date.now(),
    )
    .run();
}

export async function listAudit(
  db: D1Database,
  limit = 100,
): Promise<AdminAuditRow[]> {
  const { results } = await db
    .prepare(
      `SELECT id, actor, action, target_type, target_id, detail, created_at
       FROM admin_audit ORDER BY created_at DESC LIMIT ?1`,
    )
    .bind(limit)
    .all<{
      id: number;
      actor: string;
      action: string;
      target_type: string;
      target_id: string;
      detail: string | null;
      created_at: number;
    }>();
  return (results ?? []).map((r) => ({
    id: r.id,
    actor: r.actor,
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id,
    detail: r.detail,
    createdAt: r.created_at,
  }));
}
