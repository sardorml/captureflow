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

export type AdminAuditRow = {
  id: number;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string | null;
  createdAt: number;
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

type AuditD1Row = {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  detail: string | null;
  created_at: number;
};

const AUDIT_COLUMNS =
  "id, actor, action, target_type, target_id, detail, created_at";

function auditFromD1(r: AuditD1Row): AdminAuditRow {
  return {
    id: r.id,
    actor: r.actor,
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id,
    detail: r.detail,
    createdAt: r.created_at,
  };
}

export async function listAudit(
  db: D1Database,
  limit = 100,
): Promise<AdminAuditRow[]> {
  const { results } = await db
    .prepare(
      `SELECT ${AUDIT_COLUMNS} FROM admin_audit ORDER BY created_at DESC LIMIT ?1`,
    )
    .bind(limit)
    .all<AuditD1Row>();
  return (results ?? []).map(auditFromD1);
}

export async function listAuditForTarget(
  db: D1Database,
  targetType: string,
  targetId: string,
  limit = 20,
): Promise<AdminAuditRow[]> {
  const { results } = await db
    .prepare(
      `SELECT ${AUDIT_COLUMNS} FROM admin_audit
        WHERE target_type = ?1 AND target_id = ?2
        ORDER BY created_at DESC LIMIT ?3`,
    )
    .bind(targetType, targetId, limit)
    .all<AuditD1Row>();
  return (results ?? []).map(auditFromD1);
}
