/// <reference types="@cloudflare/workers-types" />

import {
  STORAGE_PLANS,
  getEffectiveLimitsForUser,
  isGrantActive,
  isProActive,
  listActiveGrantedUserIds,
  listPaidUserIds,
  totalStorageForUser,
  type GrantedPlan,
  type ProSubscriptionStatus,
} from "@captureflow/quota";

/*
 * Cross-tenant reads for the admin panel. Storage follows quota attribution —
 * ready artifacts in workspaces the user owns, webcam streams included — so
 * the number an operator sees is the one the upload gates enforce.
 */

export type AdminPlanSummary = {
  source: "subscription" | "granted" | "free";
  isPro: boolean;
  label: string;
  subscriptionStatus: ProSubscriptionStatus | null;
  grantExpiresAt: number | null;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: number;
  lastActiveAt: number | null;
  workspaceCount: number;
  recordingCount: number;
  screenshotCount: number;
  storageBytes: number;
  plan: AdminPlanSummary;
};

export type AdminUserDetail = AdminUserRow & {
  image: string | null;
  providers: string[];
  activeSessions: number;
  activeDevices: number;
};

export type AdminQuotaRow = {
  storageBytesOverride: number | null;
  note: string | null;
  grant: GrantedPlan | null;
  updatedAt: number | null;
};

export type AdminSubscriptionRow = {
  id: string;
  variantId: string;
  planLabel: string;
  status: ProSubscriptionStatus;
  isActive: boolean;
  cycle: string;
  customerEmail: string;
  currentPeriodEnd: number | null;
  cancelledAt: number | null;
  createdAt: number;
};

export type AdminWorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  kind: "personal" | "team";
  createdAt: number;
  owner: { id: string; name: string; email: string };
  allowPublicLinks: boolean;
  allowMemberUploads: boolean;
  memberCount: number;
  pendingInvites: number;
  recordingCount: number;
  screenshotCount: number;
  storageBytes: number;
  role: "owner" | "member" | null;
};

export type AdminMemberRow = {
  userId: string;
  name: string;
  email: string;
  role: "owner" | "member";
  joinedAt: number;
  lastActiveAt: number | null;
  recordingCount: number;
  screenshotCount: number;
  storageBytes: number;
};

export type AdminInviteStatus = "pending" | "accepted" | "expired";

export type AdminWorkspaceInviteRow = {
  id: string;
  email: string;
  invitedBy: string | null;
  createdAt: number;
  expiresAt: number;
  acceptedAt: number | null;
  status: AdminInviteStatus;
};

export type AdminTotals = {
  users: number;
  proUsers: number;
  grantedUsers: number;
  workspaces: number;
  teamWorkspaces: number;
  recordings: number;
  screenshots: number;
  storageBytes: number;
};

export type PlanFilter = "all" | "pro" | "free" | "granted";

export type UserSort = "newest" | "storage" | "active";

export type AdminRecentRecording = {
  slug: string;
  title: string | null;
  state: string;
  visibility: string;
  sizeBytes: number;
  durationMs: number | null;
  viewCount: number;
  createdAt: number;
  workspaceName: string | null;
};

export type AdminUserActivity = {
  totalViews: number;
  totalDurationMs: number;
  recordings30d: number;
  screenshots30d: number;
  weekly: { recordings: number[]; screenshots: number[] };
  recent: AdminRecentRecording[];
};

export type Page<T> = { rows: T[]; total: number };

export const ADMIN_PAGE_SIZE = 50;

export function planLabel(variantId: string): string {
  return (
    STORAGE_PLANS.find((p) => p.variantId === variantId)?.label ??
    STORAGE_PLANS[0].label
  );
}

/*
 * One user's plan as the product sees it: an active subscription wins, then
 * an unexpired grant. A lapsed subscription still reports its status so an
 * operator can tell "never paid" from "card declined".
 */
export function summarizePlan(input: {
  subscription: {
    variantId: string;
    status: ProSubscriptionStatus;
    currentPeriodEnd: number | null;
  } | null;
  grant: GrantedPlan | null;
  nowMs: number;
}): AdminPlanSummary {
  const sub = input.subscription;
  const subActive =
    sub !== null &&
    isProActive(
      { status: sub.status, current_period_end: sub.currentPeriodEnd },
      Math.floor(input.nowMs / 1000),
    );
  const status = sub?.status ?? null;
  if (sub && subActive) {
    return {
      source: "subscription",
      isPro: true,
      label: planLabel(sub.variantId),
      subscriptionStatus: status,
      grantExpiresAt: null,
    };
  }
  if (isGrantActive(input.grant, input.nowMs)) {
    return {
      source: "granted",
      isPro: true,
      label: planLabel(input.grant.variantId),
      subscriptionStatus: status,
      grantExpiresAt: input.grant.expiresAt,
    };
  }
  return {
    source: "free",
    isPro: false,
    label: "Free",
    subscriptionStatus: status,
    grantExpiresAt: null,
  };
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

// Oldest week first; the last bucket is the seven days ending at `nowMs`.
export function weeklyBuckets(
  timestamps: readonly number[],
  weeks: number,
  nowMs: number,
): number[] {
  const buckets = new Array<number>(weeks).fill(0);
  for (const t of timestamps) {
    const age = Math.floor((nowMs - t) / WEEK_MS);
    if (age >= 0 && age < weeks) buckets[weeks - 1 - age]! += 1;
  }
  return buckets;
}

export function inviteStatus(
  invite: { acceptedAt: number | null; expiresAt: number },
  nowMs: number,
): AdminInviteStatus {
  if (invite.acceptedAt !== null) return "accepted";
  return invite.expiresAt > nowMs ? "pending" : "expired";
}

const OWNED_STORAGE = (uid: string) => `
  COALESCE((SELECT SUM(r.size_bytes + r.webcam_size_bytes) FROM recordings r
              JOIN workspace w ON w.id = r.workspace_id
             WHERE w.owner_user_id = ${uid} AND r.state = 'ready'), 0)
  + COALESCE((SELECT SUM(s.size_bytes) FROM screenshots s
              JOIN workspace w ON w.id = s.workspace_id
             WHERE w.owner_user_id = ${uid} AND s.state = 'ready'), 0)`;

const LAST_ACTIVE = (uid: string) => `
  NULLIF(MAX(
    COALESCE((SELECT MAX(updatedAt) FROM sessions WHERE userId = ${uid}), 0),
    COALESCE((SELECT MAX(last_used_at) FROM device_tokens WHERE user_id = ${uid}), 0)
  ), 0)`;

const USER_SELECT = `
  WITH latest_sub AS (
    SELECT user_id, ls_variant_id, status, current_period_end,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) AS rn
      FROM pro_subscription WHERE user_id IS NOT NULL
  )
  SELECT u.id, u.name, u.email, u.image, u.emailVerified AS email_verified,
         u.createdAt AS created_at,
         (SELECT COUNT(*) FROM workspace_member m WHERE m.user_id = u.id) AS workspace_count,
         (SELECT COUNT(*) FROM recordings r
           WHERE r.user_id = u.id AND r.state = 'ready') AS recording_count,
         (SELECT COUNT(*) FROM screenshots s
           WHERE s.user_id = u.id AND s.state = 'ready') AS screenshot_count,
         ${OWNED_STORAGE("u.id")} AS storage_bytes,
         ${LAST_ACTIVE("u.id")} AS last_active_at,
         ls.ls_variant_id AS sub_variant_id, ls.status AS sub_status,
         ls.current_period_end AS sub_period_end,
         q.granted_plan_variant_id, q.granted_plan_expires_at
    FROM users u
    LEFT JOIN latest_sub ls ON ls.user_id = u.id AND ls.rn = 1
    LEFT JOIN user_quotas q ON q.user_id = u.id`;

type UserD1Row = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  email_verified: number;
  created_at: number;
  workspace_count: number;
  recording_count: number;
  screenshot_count: number;
  storage_bytes: number;
  last_active_at: number | null;
  sub_variant_id: string | null;
  sub_status: string | null;
  sub_period_end: number | null;
  granted_plan_variant_id: string | null;
  granted_plan_expires_at: number | null;
};

function userFromD1(r: UserD1Row, nowMs: number): AdminUserRow {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    emailVerified: r.email_verified === 1,
    createdAt: r.created_at,
    lastActiveAt: r.last_active_at,
    workspaceCount: r.workspace_count,
    recordingCount: r.recording_count,
    screenshotCount: r.screenshot_count,
    storageBytes: r.storage_bytes,
    plan: summarizePlan({
      subscription:
        r.sub_variant_id && r.sub_status
          ? {
              variantId: r.sub_variant_id,
              status: r.sub_status as ProSubscriptionStatus,
              currentPeriodEnd: r.sub_period_end,
            }
          : null,
      grant: r.granted_plan_variant_id
        ? {
            variantId: r.granted_plan_variant_id,
            expiresAt: r.granted_plan_expires_at,
          }
        : null,
      nowMs,
    }),
  };
}

/*
 * The plan filter matches against the quota package's paid and granted id
 * sets, so it applies the same rule the retention sweep does instead of a
 * second copy of it in SQL.
 */
const USER_ORDER: Record<UserSort, string> = {
  newest: "u.createdAt DESC",
  storage: "storage_bytes DESC, u.createdAt DESC",
  active: "last_active_at IS NULL, last_active_at DESC",
};

export async function listAdminUsers(
  db: D1Database,
  opts: {
    search: string;
    page: number;
    plan: PlanFilter;
    sort?: UserSort;
    pageSize?: number;
  },
): Promise<Page<AdminUserRow>> {
  const pageSize = opts.pageSize ?? ADMIN_PAGE_SIZE;
  const planUserIds =
    opts.plan === "all"
      ? null
      : opts.plan === "granted"
        ? await listActiveGrantedUserIds(db)
        : await listPaidUserIds(db);
  const term = opts.search.trim();
  const where = `WHERE (?1 = '' OR u.email LIKE ?2 OR u.name LIKE ?2)
    AND (?3 IS NULL OR (u.id IN (SELECT value FROM json_each(?3))) = ?4)`;
  const args = [
    term,
    `%${term}%`,
    planUserIds ? JSON.stringify(planUserIds) : null,
    opts.plan === "free" ? 0 : 1,
  ];
  const [{ results }, count] = await Promise.all([
    db
      .prepare(
        `${USER_SELECT} ${where}
         ORDER BY ${USER_ORDER[opts.sort ?? "newest"]} LIMIT ?5 OFFSET ?6`,
      )
      .bind(...args, pageSize, Math.max(0, opts.page - 1) * pageSize)
      .all<UserD1Row>(),
    db
      .prepare(`SELECT COUNT(*) AS n FROM users u ${where}`)
      .bind(...args)
      .first<{ n: number }>(),
  ]);
  const now = Date.now();
  return {
    rows: (results ?? []).map((r) => userFromD1(r, now)),
    total: count?.n ?? 0,
  };
}

export async function getAdminUser(
  db: D1Database,
  id: string,
): Promise<AdminUserDetail | null> {
  const now = Date.now();
  const [row, providers, counts] = await Promise.all([
    db
      .prepare(`${USER_SELECT} WHERE u.id = ?1 LIMIT 1`)
      .bind(id)
      .first<UserD1Row>(),
    db
      .prepare(`SELECT DISTINCT providerId FROM accounts WHERE userId = ?1`)
      .bind(id)
      .all<{ providerId: string }>(),
    db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM sessions WHERE userId = ?1 AND expiresAt > ?2) AS sessions,
           (SELECT COUNT(*) FROM device_tokens WHERE user_id = ?1 AND revoked_at IS NULL) AS devices`,
      )
      .bind(id, now)
      .first<{ sessions: number; devices: number }>(),
  ]);
  if (!row) return null;
  return {
    ...userFromD1(row, now),
    image: row.image,
    providers: (providers.results ?? []).map((p) => p.providerId),
    activeSessions: counts?.sessions ?? 0,
    activeDevices: counts?.devices ?? 0,
  };
}

export async function getUserStorage(
  db: D1Database,
  userId: string,
): Promise<{ usedBytes: number; limitBytes: number }> {
  const [usedBytes, limits] = await Promise.all([
    totalStorageForUser(db, userId),
    getEffectiveLimitsForUser(db, userId),
  ]);
  return { usedBytes, limitBytes: limits.storageBytes };
}

export async function getUserActivity(
  db: D1Database,
  userId: string,
): Promise<AdminUserActivity> {
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 3600 * 1000;
  const [totals, created, recent] = await Promise.all([
    db
      .prepare(
        `SELECT
           (SELECT COALESCE(SUM(view_count), 0) FROM recordings
             WHERE user_id = ?1 AND state = 'ready')
           + (SELECT COALESCE(SUM(view_count), 0) FROM screenshots
             WHERE user_id = ?1 AND state = 'ready') AS views,
           (SELECT COALESCE(SUM(duration_ms), 0) FROM recordings
             WHERE user_id = ?1 AND state = 'ready') AS duration,
           (SELECT COUNT(*) FROM recordings
             WHERE user_id = ?1 AND state = 'ready' AND created_at > ?2) AS recs,
           (SELECT COUNT(*) FROM screenshots
             WHERE user_id = ?1 AND state = 'ready' AND created_at > ?2) AS shots`,
      )
      .bind(userId, monthAgo)
      .first<{
        views: number;
        duration: number;
        recs: number;
        shots: number;
      }>(),
    db
      .prepare(
        `SELECT 'recording' AS kind, created_at FROM recordings
          WHERE user_id = ?1 AND created_at > ?2
         UNION ALL
         SELECT 'screenshot' AS kind, created_at FROM screenshots
          WHERE user_id = ?1 AND created_at > ?2`,
      )
      .bind(userId, now - 12 * WEEK_MS)
      .all<{ kind: string; created_at: number }>(),
    db
      .prepare(
        `SELECT r.slug, r.title, r.state, r.visibility,
                r.size_bytes + r.webcam_size_bytes AS size_bytes, r.duration_ms,
                r.view_count, r.created_at, w.name AS workspace_name
           FROM recordings r
           LEFT JOIN workspace w ON w.id = r.workspace_id
          WHERE r.user_id = ?1
          ORDER BY r.created_at DESC LIMIT 12`,
      )
      .bind(userId)
      .all<{
        slug: string;
        title: string | null;
        state: string;
        visibility: string;
        size_bytes: number;
        duration_ms: number | null;
        view_count: number;
        created_at: number;
        workspace_name: string | null;
      }>(),
  ]);
  return {
    totalViews: totals?.views ?? 0,
    totalDurationMs: totals?.duration ?? 0,
    recordings30d: totals?.recs ?? 0,
    screenshots30d: totals?.shots ?? 0,
    weekly: {
      recordings: weeklyBuckets(
        (created.results ?? [])
          .filter((r) => r.kind === "recording")
          .map((r) => r.created_at),
        12,
        now,
      ),
      screenshots: weeklyBuckets(
        (created.results ?? [])
          .filter((r) => r.kind === "screenshot")
          .map((r) => r.created_at),
        12,
        now,
      ),
    },
    recent: (recent.results ?? []).map((r) => ({
      slug: r.slug,
      title: r.title,
      state: r.state,
      visibility: r.visibility,
      sizeBytes: r.size_bytes,
      durationMs: r.duration_ms,
      viewCount: r.view_count,
      createdAt: r.created_at,
      workspaceName: r.workspace_name,
    })),
  };
}

/*
 * Ends every browser session and revokes every device token, so the desktop
 * app and the extension have to sign in again. Their next request with the old
 * token fails on its own; nothing else needs notifying.
 */
export async function revokeUserAccess(
  db: D1Database,
  userId: string,
): Promise<{ sessions: number; devices: number }> {
  const [sessions, devices] = await db.batch([
    db.prepare(`DELETE FROM sessions WHERE userId = ?1`).bind(userId),
    db
      .prepare(
        `UPDATE device_tokens SET revoked_at = ?2
          WHERE user_id = ?1 AND revoked_at IS NULL`,
      )
      .bind(userId, Date.now()),
  ]);
  return {
    sessions: sessions?.meta.changes ?? 0,
    devices: devices?.meta.changes ?? 0,
  };
}

export async function getSignupsByWeek(
  db: D1Database,
  weeks = 12,
): Promise<number[]> {
  const now = Date.now();
  const { results } = await db
    .prepare(`SELECT createdAt AS t FROM users WHERE createdAt > ?1`)
    .bind(now - weeks * WEEK_MS)
    .all<{ t: number }>();
  return weeklyBuckets(
    (results ?? []).map((r) => r.t),
    weeks,
    now,
  );
}

export async function listUserSubscriptions(
  db: D1Database,
  userId: string,
): Promise<AdminSubscriptionRow[]> {
  const { results } = await db
    .prepare(
      `SELECT ls_subscription_id, ls_variant_id, status, cycle, ls_customer_email,
              current_period_end, cancelled_at, created_at
         FROM pro_subscription WHERE user_id = ?1
        ORDER BY updated_at DESC`,
    )
    .bind(userId)
    .all<{
      ls_subscription_id: string;
      ls_variant_id: string;
      status: string;
      cycle: string;
      ls_customer_email: string;
      current_period_end: number | null;
      cancelled_at: number | null;
      created_at: number;
    }>();
  const nowSeconds = Math.floor(Date.now() / 1000);
  return (results ?? []).map((r) => {
    const status = r.status as ProSubscriptionStatus;
    return {
      id: r.ls_subscription_id,
      variantId: r.ls_variant_id,
      planLabel: planLabel(r.ls_variant_id),
      status,
      isActive: isProActive(
        { status, current_period_end: r.current_period_end },
        nowSeconds,
      ),
      cycle: r.cycle,
      customerEmail: r.ls_customer_email,
      currentPeriodEnd: r.current_period_end,
      cancelledAt: r.cancelled_at,
      createdAt: r.created_at,
    };
  });
}

export async function getUserQuota(
  db: D1Database,
  userId: string,
): Promise<AdminQuotaRow> {
  const row = await db
    .prepare(
      `SELECT storage_bytes_override, note, granted_plan_variant_id,
              granted_plan_expires_at, updated_at
         FROM user_quotas WHERE user_id = ?1 LIMIT 1`,
    )
    .bind(userId)
    .first<{
      storage_bytes_override: number | null;
      note: string | null;
      granted_plan_variant_id: string | null;
      granted_plan_expires_at: number | null;
      updated_at: number;
    }>();
  if (!row) {
    return {
      storageBytesOverride: null,
      note: null,
      grant: null,
      updatedAt: null,
    };
  }
  return {
    storageBytesOverride: row.storage_bytes_override,
    note: row.note,
    grant: row.granted_plan_variant_id
      ? {
          variantId: row.granted_plan_variant_id,
          expiresAt: row.granted_plan_expires_at,
        }
      : null,
    updatedAt: row.updated_at,
  };
}

export async function setUserQuota(
  db: D1Database,
  userId: string,
  quota: { storageBytesOverride: number | null; note: string | null },
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

export async function setGrantedPlan(
  db: D1Database,
  userId: string,
  grant: GrantedPlan | null,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO user_quotas
       (user_id, granted_plan_variant_id, granted_plan_expires_at, updated_at)
     VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(user_id) DO UPDATE SET
       granted_plan_variant_id = excluded.granted_plan_variant_id,
       granted_plan_expires_at = excluded.granted_plan_expires_at,
       updated_at = excluded.updated_at`,
    )
    .bind(
      userId,
      grant?.variantId ?? null,
      grant?.expiresAt ?? null,
      Date.now(),
    )
    .run();
}

const WORKSPACE_SELECT = (roleFor: string) => `
  SELECT w.id, w.name, w.slug, w.kind, w.created_at,
         w.allow_public_links, w.allow_member_uploads,
         o.id AS owner_id, o.name AS owner_name, o.email AS owner_email,
         (SELECT COUNT(*) FROM workspace_member m WHERE m.workspace_id = w.id) AS member_count,
         (SELECT COUNT(*) FROM workspace_invite i
           WHERE i.workspace_id = w.id AND i.accepted_at IS NULL
             AND i.expires_at > ?1) AS pending_invites,
         (SELECT COUNT(*) FROM recordings r
           WHERE r.workspace_id = w.id AND r.state = 'ready') AS recording_count,
         (SELECT COUNT(*) FROM screenshots s
           WHERE s.workspace_id = w.id AND s.state = 'ready') AS screenshot_count,
         COALESCE((SELECT SUM(r.size_bytes + r.webcam_size_bytes) FROM recordings r
                    WHERE r.workspace_id = w.id AND r.state = 'ready'), 0)
         + COALESCE((SELECT SUM(s.size_bytes) FROM screenshots s
                    WHERE s.workspace_id = w.id AND s.state = 'ready'), 0) AS storage_bytes,
         ${roleFor} AS role
    FROM workspace w
    JOIN users o ON o.id = w.owner_user_id`;

type WorkspaceD1Row = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  created_at: number;
  allow_public_links: number;
  allow_member_uploads: number;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  member_count: number;
  pending_invites: number;
  recording_count: number;
  screenshot_count: number;
  storage_bytes: number;
  role: string | null;
};

function workspaceFromD1(r: WorkspaceD1Row): AdminWorkspaceRow {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    kind: r.kind === "team" ? "team" : "personal",
    createdAt: r.created_at,
    owner: { id: r.owner_id, name: r.owner_name, email: r.owner_email },
    allowPublicLinks: r.allow_public_links === 1,
    allowMemberUploads: r.allow_member_uploads === 1,
    memberCount: r.member_count,
    pendingInvites: r.pending_invites,
    recordingCount: r.recording_count,
    screenshotCount: r.screenshot_count,
    storageBytes: r.storage_bytes,
    role: r.role === "owner" || r.role === "member" ? r.role : null,
  };
}

export async function listAdminWorkspaces(
  db: D1Database,
  opts: { search: string; page: number; kind: "all" | "personal" | "team" },
): Promise<Page<AdminWorkspaceRow>> {
  const term = opts.search.trim();
  const where = `WHERE (?2 = '' OR w.name LIKE ?3 OR w.slug LIKE ?3
                        OR o.email LIKE ?3 OR o.name LIKE ?3)
                   AND (?4 = 'all' OR w.kind = ?4)`;
  const args = [Date.now(), term, `%${term}%`, opts.kind];
  const [{ results }, count] = await Promise.all([
    db
      .prepare(
        `${WORKSPACE_SELECT("NULL")} ${where}
         ORDER BY w.created_at DESC LIMIT ?5 OFFSET ?6`,
      )
      .bind(
        ...args,
        ADMIN_PAGE_SIZE,
        Math.max(0, opts.page - 1) * ADMIN_PAGE_SIZE,
      )
      .all<WorkspaceD1Row>(),
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM workspace w
           JOIN users o ON o.id = w.owner_user_id ${where}`,
      )
      .bind(...args)
      .first<{ n: number }>(),
  ]);
  return {
    rows: (results ?? []).map(workspaceFromD1),
    total: count?.n ?? 0,
  };
}

export async function getAdminWorkspace(
  db: D1Database,
  id: string,
): Promise<AdminWorkspaceRow | null> {
  const row = await db
    .prepare(`${WORKSPACE_SELECT("NULL")} WHERE w.id = ?2 LIMIT 1`)
    .bind(Date.now(), id)
    .first<WorkspaceD1Row>();
  return row ? workspaceFromD1(row) : null;
}

export async function listUserWorkspaces(
  db: D1Database,
  userId: string,
): Promise<AdminWorkspaceRow[]> {
  const { results } = await db
    .prepare(
      `${WORKSPACE_SELECT(
        "(SELECT role FROM workspace_member WHERE workspace_id = w.id AND user_id = ?2)",
      )}
       WHERE w.id IN (SELECT workspace_id FROM workspace_member WHERE user_id = ?2)
       ORDER BY (w.owner_user_id = ?2) DESC, w.kind = 'personal' DESC, w.created_at`,
    )
    .bind(Date.now(), userId)
    .all<WorkspaceD1Row>();
  return (results ?? []).map(workspaceFromD1);
}

export async function listWorkspaceMembers(
  db: D1Database,
  workspaceId: string,
): Promise<AdminMemberRow[]> {
  const { results } = await db
    .prepare(
      `SELECT u.id, u.name, u.email, m.role, m.joined_at,
              ${LAST_ACTIVE("u.id")} AS last_active_at,
              (SELECT COUNT(*) FROM recordings r WHERE r.workspace_id = ?1
                 AND r.user_id = u.id AND r.state = 'ready') AS recording_count,
              (SELECT COUNT(*) FROM screenshots s WHERE s.workspace_id = ?1
                 AND s.user_id = u.id AND s.state = 'ready') AS screenshot_count,
              COALESCE((SELECT SUM(r.size_bytes + r.webcam_size_bytes) FROM recordings r
                         WHERE r.workspace_id = ?1 AND r.user_id = u.id
                           AND r.state = 'ready'), 0)
              + COALESCE((SELECT SUM(s.size_bytes) FROM screenshots s
                         WHERE s.workspace_id = ?1 AND s.user_id = u.id
                           AND s.state = 'ready'), 0) AS storage_bytes
         FROM workspace_member m
         JOIN users u ON u.id = m.user_id
        WHERE m.workspace_id = ?1
        ORDER BY m.role = 'owner' DESC, m.joined_at`,
    )
    .bind(workspaceId)
    .all<{
      id: string;
      name: string;
      email: string;
      role: string;
      joined_at: number;
      last_active_at: number | null;
      recording_count: number;
      screenshot_count: number;
      storage_bytes: number;
    }>();
  return (results ?? []).map((r) => ({
    userId: r.id,
    name: r.name,
    email: r.email,
    role: r.role === "owner" ? "owner" : "member",
    joinedAt: r.joined_at,
    lastActiveAt: r.last_active_at,
    recordingCount: r.recording_count,
    screenshotCount: r.screenshot_count,
    storageBytes: r.storage_bytes,
  }));
}

export async function listWorkspaceInvites(
  db: D1Database,
  workspaceId: string,
): Promise<AdminWorkspaceInviteRow[]> {
  const { results } = await db
    .prepare(
      `SELECT i.id, i.email, i.created_at, i.expires_at, i.accepted_at,
              u.email AS invited_by
         FROM workspace_invite i
         LEFT JOIN users u ON u.id = i.invited_by_user_id
        WHERE i.workspace_id = ?1
        ORDER BY i.created_at DESC
        LIMIT 100`,
    )
    .bind(workspaceId)
    .all<{
      id: string;
      email: string;
      created_at: number;
      expires_at: number;
      accepted_at: number | null;
      invited_by: string | null;
    }>();
  const now = Date.now();
  return (results ?? []).map((r) => {
    const invite = {
      id: r.id,
      email: r.email,
      invitedBy: r.invited_by,
      createdAt: r.created_at,
      expiresAt: r.expires_at,
      acceptedAt: r.accepted_at,
    };
    return { ...invite, status: inviteStatus(invite, now) };
  });
}

export async function getAdminTotals(db: D1Database): Promise<AdminTotals> {
  const [paid, granted] = await Promise.all([
    listPaidUserIds(db),
    listActiveGrantedUserIds(db),
  ]);
  const row = await db
    .prepare(
      `SELECT
       (SELECT COUNT(*) FROM users) AS users,
       (SELECT COUNT(*) FROM workspace) AS workspaces,
       (SELECT COUNT(*) FROM workspace WHERE kind = 'team') AS team_workspaces,
       (SELECT COUNT(*) FROM recordings WHERE state = 'ready') AS recordings,
       (SELECT COUNT(*) FROM screenshots WHERE state = 'ready') AS screenshots,
       (SELECT COALESCE(SUM(size_bytes + webcam_size_bytes), 0) FROM recordings
         WHERE state = 'ready')
       + (SELECT COALESCE(SUM(size_bytes), 0) FROM screenshots WHERE state = 'ready')
         AS storage_bytes`,
    )
    .first<{
      users: number;
      workspaces: number;
      team_workspaces: number;
      recordings: number;
      screenshots: number;
      storage_bytes: number;
    }>();
  return {
    users: row?.users ?? 0,
    proUsers: paid.length,
    grantedUsers: granted.length,
    workspaces: row?.workspaces ?? 0,
    teamWorkspaces: row?.team_workspaces ?? 0,
    recordings: row?.recordings ?? 0,
    screenshots: row?.screenshots ?? 0,
    storageBytes: row?.storage_bytes ?? 0,
  };
}
