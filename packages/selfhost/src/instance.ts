/// <reference types="@cloudflare/workers-types" />

import { findInviteByToken, listInvitesForEmail } from "@captureflow/quota";

/*
 * Who runs a self-hosted instance and who may sign up. The hosted product
 * never calls any of this: the admin app only exists in the Docker image, and
 * the web app reaches it through the hooks the Docker server injects.
 */

// Addresses on `domains` may sign up without an invite; empty means invite-only.
export type InstanceSignupState = {
  firstRun: boolean;
  domains: string[];
  setupCompleted: boolean;
};

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
      .prepare(
        `SELECT signup_domains, setup_completed FROM instance_settings WHERE id = 1`,
      )
      .first<{ signup_domains: string; setup_completed: number }>(),
  ]);
  return {
    firstRun: anyone === null,
    domains: parseDomains(settings?.signup_domains),
    setupCompleted: settings?.setup_completed === 1,
  };
}

export function parseDomains(raw: string | undefined | null): string[] {
  return [
    ...new Set(
      (raw ?? "")
        .split(/[\s,;]+/)
        .map((d) => d.trim().toLowerCase().replace(/^@/, ""))
        .filter((d) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)),
    ),
  ];
}

export async function setInstanceSignupDomains(
  db: D1Database,
  domains: string[],
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO instance_settings (id, signup_domains) VALUES (1, ?1)
         ON CONFLICT(id) DO UPDATE SET signup_domains = excluded.signup_domains`,
    )
    .bind(parseDomains(domains.join(",")).join(","))
    .run();
}

export async function markInstanceSetupCompleted(
  db: D1Database,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO instance_settings (id, setup_completed) VALUES (1, 1)
         ON CONFLICT(id) DO UPDATE SET setup_completed = 1`,
    )
    .run();
}

export const INVITE_ONLY_MESSAGE =
  "This CaptureFlow is invite-only. Ask an admin for an invite.";

export function domainsMessage(domains: string[]): string {
  return `Sign up with an address on ${domains.map((d) => `@${d}`).join(" or ")}, or ask an admin for an invite.`;
}

/*
 * After the first account, sign-up needs an invite or an address on one of the
 * instance's domains. Self-hosted instances don't confirm addresses by email,
 * so a pending invite alone can't open sign-up: anyone who guessed the address
 * could claim it. A password sign-up must hold the invite's link. A provider's
 * verified address already proves ownership. Returns the message to show when
 * refused, or null.
 */
export async function instanceSignupRefusal(
  db: D1Database,
  user: { email: string; emailVerified?: unknown },
  inviteToken: string | null,
): Promise<string | null> {
  const { firstRun, domains } = await getInstanceSignupState(db);
  if (firstRun) return null;
  const email = user.email.toLowerCase();
  if (domains.includes(email.split("@")[1] ?? "")) return null;
  const refused =
    domains.length > 0 ? domainsMessage(domains) : INVITE_ONLY_MESSAGE;
  if (user.emailVerified === true) {
    return (await listInvitesForEmail(db, email)).length > 0 ? null : refused;
  }
  if (!inviteToken) return refused;
  const invite = await findInviteByToken(db, inviteToken);
  return invite?.email.toLowerCase() === email ? null : refused;
}

export async function listInstanceAdminIds(db: D1Database): Promise<string[]> {
  const { results } = await db
    .prepare(`SELECT user_id FROM instance_admin`)
    .all<{ user_id: string }>();
  return (results ?? []).map((r) => r.user_id);
}

export async function countInstanceAdmins(db: D1Database): Promise<number> {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM instance_admin`)
    .first<{ n: number }>();
  return row?.n ?? 0;
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
