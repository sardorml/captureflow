/// <reference types="@cloudflare/workers-types" />

import { ensurePersonalWorkspace } from "@captureflow/quota";
import { isInstanceAdmin } from "./instance";

/*
 * Accounts as a self-hosted administrator manages them: added without a
 * workspace, handed a link to choose a password, suspended and restored. The
 * hosted product never calls any of this.
 */

export type InstanceUserOption = { id: string; name: string; email: string };

export type CreateUserResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "email_taken" };

export type PasswordLinkKind = "new" | "reset";

const HOUR_MS = 3600 * 1000;
const PASSWORD_LINK_TTL_MS: Record<PasswordLinkKind, number> = {
  new: 7 * 24 * HOUR_MS,
  reset: 24 * HOUR_MS,
};

export const SUSPENDED_MESSAGE =
  "This account is suspended. Ask an administrator to restore it.";

export const NEEDS_ACCOUNT_MESSAGE =
  "That address has no account here yet. Ask an administrator to add the user first.";

function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function findUserIdByEmail(
  db: D1Database,
  email: string,
): Promise<string | null> {
  const row = await db
    .prepare(`SELECT id FROM users WHERE lower(email) = ?1 LIMIT 1`)
    .bind(email.trim().toLowerCase())
    .first<{ id: string }>();
  return row?.id ?? null;
}

// The account has no password until its owner follows a password link.
export async function createInstanceUser(
  db: D1Database,
  args: { name: string; email: string },
): Promise<CreateUserResult> {
  const email = args.email.trim().toLowerCase();
  if (await findUserIdByEmail(db, email)) {
    return { ok: false, reason: "email_taken" };
  }
  const userId = randomHex(16);
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO users (id, name, email, emailVerified, createdAt, updatedAt)
         VALUES (?1, ?2, ?3, 0, ?4, ?4)`,
    )
    .bind(userId, args.name.trim() || email, email, now)
    .run();
  await ensurePersonalWorkspace(db, userId, args.name);
  return { ok: true, userId };
}

/*
 * The row is the one the sign-in library writes for its own password reset
 * (`reset-password:<token>` naming the user), so its /reset-password endpoint
 * redeems the token and creates the password if the account has none. A new
 * link replaces any earlier one for the same account.
 */
export async function issuePasswordLink(
  db: D1Database,
  userId: string,
  kind: PasswordLinkKind,
): Promise<string> {
  const token = randomHex(24);
  const now = Date.now();
  await db.batch([
    db
      .prepare(
        `DELETE FROM verifications
           WHERE value = ?1 AND identifier LIKE 'reset-password:%'`,
      )
      .bind(userId),
    db
      .prepare(
        `INSERT INTO verifications
           (id, identifier, value, expiresAt, createdAt, updatedAt)
           VALUES (?1, ?2, ?3, ?4, ?5, ?5)`,
      )
      .bind(
        randomHex(16),
        `reset-password:${token}`,
        userId,
        now + PASSWORD_LINK_TTL_MS[kind],
        now,
      ),
  ]);
  return token;
}

// The address a live password link belongs to, or null once used or expired.
export async function getPasswordLinkEmail(
  db: D1Database,
  token: string,
): Promise<string | null> {
  const row = await db
    .prepare(
      `SELECT u.email FROM verifications v JOIN users u ON u.id = v.value
         WHERE v.identifier = ?1 AND v.expiresAt > ?2
         LIMIT 1`,
    )
    .bind(`reset-password:${token}`, Date.now())
    .first<{ email: string }>();
  return row?.email ?? null;
}

export async function isSuspended(
  db: D1Database,
  userId: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT 1 AS yes FROM instance_suspension WHERE user_id = ?1 LIMIT 1`,
    )
    .bind(userId)
    .first<{ yes: number }>();
  return row !== null;
}

export async function listSuspendedUserIds(db: D1Database): Promise<string[]> {
  const { results } = await db
    .prepare(`SELECT user_id FROM instance_suspension`)
    .all<{ user_id: string }>();
  return (results ?? []).map((r) => r.user_id);
}

/*
 * Ends the account's sessions, device tokens and agent tokens along with the
 * suspension, so nothing already signed in keeps working. Nobody suspends
 * themselves, which keeps one administrator able to sign in. Returns the
 * message to show when refused, or null.
 */
export async function suspendInstanceUser(
  db: D1Database,
  args: { userId: string; byUserId: string },
): Promise<string | null> {
  if (args.userId === args.byUserId) return "You can't suspend yourself.";
  const now = Date.now();
  await db.batch([
    db
      .prepare(
        `INSERT OR IGNORE INTO instance_suspension (user_id, suspended_at)
           SELECT id, ?2 FROM users WHERE id = ?1`,
      )
      .bind(args.userId, now),
    db.prepare(`DELETE FROM sessions WHERE userId = ?1`).bind(args.userId),
    db
      .prepare(
        `UPDATE device_tokens SET revoked_at = ?2
           WHERE user_id = ?1 AND revoked_at IS NULL`,
      )
      .bind(args.userId, now),
    db
      .prepare(`DELETE FROM oauth_access_tokens WHERE userId = ?1`)
      .bind(args.userId),
  ]);
  return null;
}

export async function unsuspendInstanceUser(
  db: D1Database,
  userId: string,
): Promise<void> {
  await db
    .prepare(`DELETE FROM instance_suspension WHERE user_id = ?1`)
    .bind(userId)
    .run();
}

export async function signinRefusal(
  db: D1Database,
  userId: string,
): Promise<string | null> {
  return (await isSuspended(db, userId)) ? SUSPENDED_MESSAGE : null;
}

/*
 * An invite to a new address lets its holder create an account, so only
 * administrators send those. Anyone allowed to invite into a workspace may
 * invite someone who already has an account. Returns the message to show
 * when refused, or null.
 */
export async function inviteRefusal(
  db: D1Database,
  inviterUserId: string,
  email: string,
): Promise<string | null> {
  if (await isInstanceAdmin(db, inviterUserId)) return null;
  return (await findUserIdByEmail(db, email)) ? null : NEEDS_ACCOUNT_MESSAGE;
}

export async function listInstanceUserOptions(
  db: D1Database,
): Promise<InstanceUserOption[]> {
  const { results } = await db
    .prepare(
      `SELECT id, name, email FROM users
         ORDER BY name COLLATE NOCASE, email
         LIMIT 500`,
    )
    .all<InstanceUserOption>();
  return results ?? [];
}
