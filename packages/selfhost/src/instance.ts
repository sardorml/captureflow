/// <reference types="@cloudflare/workers-types" />

import { findInviteByToken, listInvitesForEmail } from "@captureflow/quota";

/*
 * Who runs a self-hosted instance and who may sign up. The hosted product
 * never calls any of this: the admin app only exists in the Docker image, and
 * the web app reaches it through the hooks the Docker server injects.
 */

export type InstanceUser = {
  id: string;
  name: string | null;
  email: string;
  is_admin: boolean;
};

export type InstanceTeam = {
  id: string;
  name: string;
  owner_name: string | null;
  owner_email: string;
  member_count: number;
};

export type InstanceSignupState = { firstRun: boolean; open: boolean };

export async function isInstanceAdmin(
  db: D1Database,
  userId: string,
): Promise<boolean> {
  const row = await db
    .prepare(`SELECT 1 AS yes FROM instance_admin WHERE user_id = ?1 LIMIT 1`)
    .bind(userId)
    .first<{ yes: number }>();
  return row !== null;
}

// One statement, so two people signing up at once can't both become the admin.
export async function claimFirstInstanceAdmin(
  db: D1Database,
  userId: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO instance_admin (user_id, granted_at)
         SELECT ?1, ?2 WHERE NOT EXISTS (SELECT 1 FROM instance_admin)`,
    )
    .bind(userId, Date.now())
    .run();
}

export async function grantInstanceAdmin(
  db: D1Database,
  userId: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO instance_admin (user_id, granted_at)
         SELECT id, ?2 FROM users WHERE id = ?1`,
    )
    .bind(userId, Date.now())
    .run();
}

// False when this is the last admin: without one, nobody could run the instance.
export async function revokeInstanceAdmin(
  db: D1Database,
  userId: string,
): Promise<boolean> {
  const res = await db
    .prepare(
      `DELETE FROM instance_admin
         WHERE user_id = ?1
           AND (SELECT COUNT(*) FROM instance_admin) > 1`,
    )
    .bind(userId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function getInstanceSignupState(
  db: D1Database,
): Promise<InstanceSignupState> {
  const [anyone, settings] = await Promise.all([
    db.prepare(`SELECT 1 AS yes FROM users LIMIT 1`).first<{ yes: number }>(),
    db
      .prepare(`SELECT open_signup FROM instance_settings WHERE id = 1`)
      .first<{ open_signup: number }>(),
  ]);
  return { firstRun: anyone === null, open: settings?.open_signup === 1 };
}

export async function setInstanceOpenSignup(
  db: D1Database,
  open: boolean,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO instance_settings (id, open_signup) VALUES (1, ?1)
         ON CONFLICT(id) DO UPDATE SET open_signup = excluded.open_signup`,
    )
    .bind(open ? 1 : 0)
    .run();
}

/*
 * Self-hosted instances don't confirm addresses by email, so a pending invite
 * alone can't open sign-up: anyone who guessed the address could claim it. A
 * password sign-up must hold the invite's link. A provider's verified address
 * already proves ownership.
 */
export async function instanceSignupAllowed(
  db: D1Database,
  user: { email: string; emailVerified?: unknown },
  inviteToken: string | null,
): Promise<boolean> {
  const { firstRun, open } = await getInstanceSignupState(db);
  if (firstRun || open) return true;
  if (user.emailVerified === true) {
    return (await listInvitesForEmail(db, user.email)).length > 0;
  }
  if (!inviteToken) return false;
  const invite = await findInviteByToken(db, inviteToken);
  return invite?.email.toLowerCase() === user.email.toLowerCase();
}

export async function listInstanceUsers(
  db: D1Database,
): Promise<InstanceUser[]> {
  const { results } = await db
    .prepare(
      `SELECT u.id, u.name, u.email, a.user_id IS NOT NULL AS is_admin
         FROM users u
         LEFT JOIN instance_admin a ON a.user_id = u.id
         ORDER BY u.createdAt ASC`,
    )
    .all<Omit<InstanceUser, "is_admin"> & { is_admin: number }>();
  return (results ?? []).map((u) => ({ ...u, is_admin: u.is_admin === 1 }));
}

export async function listInstanceTeams(
  db: D1Database,
): Promise<InstanceTeam[]> {
  const { results } = await db
    .prepare(
      `SELECT w.id, w.name, u.name AS owner_name, u.email AS owner_email,
              (SELECT COUNT(*) FROM workspace_member m
                WHERE m.workspace_id = w.id) AS member_count
         FROM workspace w
         JOIN users u ON u.id = w.owner_user_id
         WHERE w.kind = 'team'
         ORDER BY w.created_at ASC`,
    )
    .all<InstanceTeam>();
  return results ?? [];
}

export async function createTeamWorkspace(
  db: D1Database,
  args: { name: string; ownerUserId: string },
): Promise<string> {
  const id = crypto.randomUUID().replace(/-/g, "");
  const slug = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const now = Date.now();
  await db.batch([
    db
      .prepare(
        `INSERT INTO workspace
           (id, slug, kind, name, owner_user_id, created_at, updated_at)
           VALUES (?1, ?2, 'team', ?3, ?4, ?5, ?5)`,
      )
      .bind(id, slug, args.name, args.ownerUserId, now),
    db
      .prepare(
        `INSERT INTO workspace_member (workspace_id, user_id, role, joined_at)
           VALUES (?1, ?2, 'owner', ?3)`,
      )
      .bind(id, args.ownerUserId, now),
  ]);
  return id;
}
