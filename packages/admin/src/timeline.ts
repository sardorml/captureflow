/*
 * One person's history across the instance, newest first: sign-ups and
 * sign-ins, devices, what they recorded, watched and commented on, the
 * workspaces and seats they touched, and what admins did to them. Read from
 * the tables that already hold those facts; nothing is logged for this.
 */
export type AdminTimelineKind =
  | "signup"
  | "signin"
  | "device"
  | "recording"
  | "screenshot"
  | "agent"
  | "workspace"
  | "member"
  | "invite"
  | "subscription"
  | "seats"
  | "seatRequest"
  | "comment"
  | "reaction"
  | "view"
  | "contact"
  | "admin";

export type AdminTimelineEvent = {
  key: string;
  kind: AdminTimelineKind;
  at: number;
  // "signed in from Chrome on macOS"; the person's name goes in front of it,
  // or `actor` when someone else did it to them.
  text: string;
  actor?: string;
  // The recording, workspace or email the event is about, if any.
  subject?: string;
  workspaceId?: string;
  slug?: string;
};

export const TIMELINE_LIMIT = 60;

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];
const SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPad/, "iOS"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Windows/, "Windows"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

// "Chrome on macOS", or null when the string names neither.
export function describeUserAgent(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const browser = BROWSERS.find(([re]) => re.test(userAgent))?.[1];
  const system = SYSTEMS.find(([re]) => re.test(userAgent))?.[1];
  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system ?? null;
}

export function mergeTimeline(
  lists: AdminTimelineEvent[][],
  limit = TIMELINE_LIMIT,
): AdminTimelineEvent[] {
  return lists
    .flat()
    .sort((a, b) => b.at - a.at)
    .slice(0, limit);
}

function humanize(action: string): string {
  return action.replaceAll("_", " ").replaceAll(".", " ");
}

const untitled = (title: string | null) => title || "an untitled recording";

export async function getUserTimeline(
  db: D1Database,
  userId: string,
  limit = TIMELINE_LIMIT,
): Promise<AdminTimelineEvent[]> {
  const q = <T>(sql: string) =>
    db
      .prepare(sql)
      .bind(userId, limit)
      .all<T>()
      .then((r) => r.results ?? []);

  const [
    user,
    sessions,
    devices,
    recordings,
    screenshots,
    agent,
    owned,
    joined,
    invites,
    subscriptions,
    seatChanges,
    seatRequests,
    activity,
    views,
    contacts,
    audit,
  ] = await Promise.all([
    db
      .prepare(`SELECT createdAt FROM users WHERE id = ?1`)
      .bind(userId)
      .first<{ createdAt: number }>(),
    q<{ id: string; createdAt: number; userAgent: string | null }>(
      `SELECT id, createdAt, userAgent FROM sessions
        WHERE userId = ?1 ORDER BY createdAt DESC LIMIT ?2`,
    ),
    q<{
      id: string;
      label: string | null;
      created_at: number;
      revoked_at: number | null;
    }>(
      `SELECT id, label, created_at, revoked_at FROM device_tokens
        WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2`,
    ),
    q<{ slug: string; title: string | null; created_at: number }>(
      `SELECT slug, title, created_at FROM recordings
        WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2`,
    ),
    q<{ id: string; title: string | null; created_at: number }>(
      `SELECT id, title, created_at FROM screenshots
        WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2`,
    ),
    q<{
      id: string;
      slug: string | null;
      title: string | null;
      created_at: number;
    }>(
      `SELECT a.id, a.slug, r.title, a.created_at FROM agent_recordings a
         LEFT JOIN recordings r ON r.slug = a.slug
        WHERE a.user_id = ?1 ORDER BY a.created_at DESC LIMIT ?2`,
    ),
    q<{ id: string; name: string; created_at: number }>(
      `SELECT id, name, created_at FROM workspace
        WHERE owner_user_id = ?1 AND kind = 'team'
        ORDER BY created_at DESC LIMIT ?2`,
    ),
    q<{ workspace_id: string; name: string; role: string; joined_at: number }>(
      `SELECT m.workspace_id, w.name, m.role, m.joined_at
         FROM workspace_member m JOIN workspace w ON w.id = m.workspace_id
        WHERE m.user_id = ?1 AND m.role != 'owner'
        ORDER BY m.joined_at DESC LIMIT ?2`,
    ),
    q<{
      id: string;
      email: string;
      workspace_id: string;
      name: string;
      created_at: number;
    }>(
      `SELECT i.id, i.email, i.workspace_id, w.name, i.created_at
         FROM workspace_invite i JOIN workspace w ON w.id = i.workspace_id
        WHERE i.invited_by_user_id = ?1
        ORDER BY i.created_at DESC LIMIT ?2`,
    ),
    q<{
      id: string;
      workspace_id: string;
      name: string;
      cycle: string;
      quantity: number;
      created_at: number;
      cancelled_at: number | null;
    }>(
      `SELECT s.ls_subscription_id AS id, s.workspace_id, w.name, s.cycle,
              s.quantity, s.created_at, s.cancelled_at
         FROM workspace_subscription s JOIN workspace w ON w.id = s.workspace_id
        WHERE w.owner_user_id = ?1
        ORDER BY s.created_at DESC LIMIT ?2`,
    ),
    q<{
      id: number;
      workspace_id: string;
      name: string;
      from_quantity: number;
      to_quantity: number;
      changed_at: number;
    }>(
      `SELECT c.id, w.id AS workspace_id, w.name, c.from_quantity,
              c.to_quantity, c.changed_at
         FROM seat_change c
         JOIN workspace_subscription s ON s.ls_subscription_id = c.ls_subscription_id
         JOIN workspace w ON w.id = s.workspace_id
        WHERE w.owner_user_id = ?1
        ORDER BY c.changed_at DESC LIMIT ?2`,
    ),
    q<{ workspace_id: string; name: string; created_at: number }>(
      `SELECT r.workspace_id, w.name, r.created_at
         FROM seat_request r JOIN workspace w ON w.id = r.workspace_id
        WHERE r.user_id = ?1 ORDER BY r.created_at DESC LIMIT ?2`,
    ),
    q<{
      id: number;
      kind: string;
      slug: string;
      emoji: string | null;
      title: string | null;
      created_at: number;
    }>(
      `SELECT a.id, a.kind, a.slug, a.emoji, r.title, a.created_at
         FROM recording_activity a LEFT JOIN recordings r ON r.slug = a.slug
        WHERE a.user_id = ?1 ORDER BY a.created_at DESC LIMIT ?2`,
    ),
    q<{ slug: string; title: string | null; first_viewed_at: number }>(
      `SELECT v.slug, r.title, v.first_viewed_at
         FROM recording_views v LEFT JOIN recordings r ON r.slug = v.slug
        WHERE v.user_id = ?1 AND (r.user_id IS NULL OR r.user_id != ?1)
        ORDER BY v.first_viewed_at DESC LIMIT ?2`,
    ),
    q<{ id: string; kind: string; subject: string; created_at: number }>(
      `SELECT id, kind, subject, created_at FROM contact_requests
        WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2`,
    ),
    q<{ id: number; actor: string; action: string; created_at: number }>(
      `SELECT id, actor, action, created_at FROM admin_audit
        WHERE target_type = 'user' AND target_id = ?1
        ORDER BY created_at DESC LIMIT ?2`,
    ),
  ]);

  const lists: AdminTimelineEvent[][] = [
    user
      ? [
          {
            key: "signup",
            kind: "signup",
            at: user.createdAt,
            text: "signed up",
          },
        ]
      : [],
    sessions.map((s) => {
      const from = describeUserAgent(s.userAgent);
      return {
        key: `session-${s.id}`,
        kind: "signin",
        at: s.createdAt,
        text: from ? `signed in from ${from}` : "signed in",
      };
    }),
    devices.flatMap((d) => {
      const what = d.label ? `${d.label}` : "a device";
      const events: AdminTimelineEvent[] = [
        {
          key: `device-${d.id}`,
          kind: "device",
          at: d.created_at,
          text: "connected",
          subject: what,
        },
      ];
      if (d.revoked_at) {
        events.push({
          key: `device-${d.id}-off`,
          kind: "device",
          at: d.revoked_at,
          text: "disconnected",
          subject: what,
        });
      }
      return events;
    }),
    recordings.map((r) => ({
      key: `rec-${r.slug}`,
      kind: "recording",
      at: r.created_at,
      text: "recorded",
      subject: untitled(r.title),
      slug: r.slug,
    })),
    screenshots.map((s) => ({
      key: `shot-${s.id}`,
      kind: "screenshot",
      at: s.created_at,
      text: "took a screenshot",
      subject: s.title ?? undefined,
    })),
    agent.map((a) => ({
      key: `agent-${a.id}`,
      kind: "agent",
      at: a.created_at,
      text: "had an agent record",
      subject: a.slug ? untitled(a.title) : undefined,
      slug: a.slug ?? undefined,
    })),
    owned.map((w) => ({
      key: `ws-${w.id}`,
      kind: "workspace",
      at: w.created_at,
      text: "created the workspace",
      subject: w.name,
      workspaceId: w.id,
    })),
    joined.map((m) => ({
      key: `member-${m.workspace_id}`,
      kind: "member",
      at: m.joined_at,
      text: `joined as ${m.role}`,
      subject: m.name,
      workspaceId: m.workspace_id,
    })),
    invites.map((i) => ({
      key: `invite-${i.id}`,
      kind: "invite",
      at: i.created_at,
      text: `invited ${i.email} to`,
      subject: i.name,
      workspaceId: i.workspace_id,
    })),
    subscriptions.flatMap((s) => {
      const seats = s.quantity === 1 ? "1 seat" : `${s.quantity} seats`;
      const events: AdminTimelineEvent[] = [
        {
          key: `sub-${s.id}`,
          kind: "subscription",
          at: s.created_at * 1000,
          text: `subscribed ${seats}, ${s.cycle}, for`,
          subject: s.name,
          workspaceId: s.workspace_id,
        },
      ];
      if (s.cancelled_at) {
        events.push({
          key: `sub-${s.id}-end`,
          kind: "subscription",
          at: s.cancelled_at * 1000,
          text: "cancelled the subscription for",
          subject: s.name,
          workspaceId: s.workspace_id,
        });
      }
      return events;
    }),
    seatChanges.map((c) => ({
      key: `seats-${c.id}`,
      kind: "seats",
      at: c.changed_at,
      text: `went from ${c.from_quantity} to ${c.to_quantity} seats in`,
      subject: c.name,
      workspaceId: c.workspace_id,
    })),
    seatRequests.map((r) => ({
      key: `seatreq-${r.workspace_id}`,
      kind: "seatRequest",
      at: r.created_at,
      text: "asked for a seat in",
      subject: r.name,
      workspaceId: r.workspace_id,
    })),
    activity.map((a) => ({
      key: `activity-${a.id}`,
      kind: a.kind === "reaction" ? "reaction" : "comment",
      at: a.created_at,
      text:
        a.kind === "reaction"
          ? `reacted ${a.emoji ?? ""} to`.replace("  ", " ")
          : "commented on",
      subject: untitled(a.title),
      slug: a.slug,
    })),
    views.map((v) => ({
      key: `view-${v.slug}`,
      kind: "view",
      at: v.first_viewed_at,
      text: "watched",
      subject: untitled(v.title),
      slug: v.slug,
    })),
    contacts.map((c) => ({
      key: `contact-${c.id}`,
      kind: "contact",
      at: c.created_at,
      text: `sent a ${c.kind.replaceAll("_", " ")}:`,
      subject: c.subject,
    })),
    audit.map((a) => ({
      key: `audit-${a.id}`,
      kind: "admin",
      at: a.created_at,
      actor: a.actor,
      text: humanize(a.action),
    })),
  ];
  return mergeTimeline(lists, limit);
}
