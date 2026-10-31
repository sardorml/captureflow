const DAY_MS = 24 * 3600 * 1000;
const WEEK_MS = 7 * DAY_MS;

export type ActivationUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: number;
  recordings: number;
  firstRecordingAt: number | null;
  firstClient: string | null;
  lastActiveAt: number | null;
  activeWeeks: number[];
};

export type ActivationFunnel = {
  signedUp: number;
  recorded: number;
  recordedTwice: number;
  returned: number;
};

export type CohortRow = {
  weekStart: number;
  size: number;
  retained: (number | null)[];
};

export type Bucket = { label: string; count: number };

export type OneAndDoneUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: number;
  firstRecordingAt: number;
};

export type AdminActivation = {
  weeks: number;
  funnel: ActivationFunnel;
  cohorts: CohortRow[];
  timeToFirstRecording: Bucket[];
  firstClient: Bucket[];
  oneAndDone: OneAndDoneUser[];
};

// "Came back" means any activity after the day they signed up.
export function cameBack(user: ActivationUser): boolean {
  return (
    user.lastActiveAt !== null && user.lastActiveAt > user.createdAt + DAY_MS
  );
}

export function activationFunnel(users: ActivationUser[]): ActivationFunnel {
  return {
    signedUp: users.length,
    recorded: users.filter((u) => u.recordings >= 1).length,
    recordedTwice: users.filter((u) => u.recordings >= 2).length,
    returned: users.filter(cameBack).length,
  };
}

/*
 * One row per signup week, newest first. retained[i] counts the cohort's users
 * active in their i-th week after signing up. A week that hasn't started yet for
 * every member is null rather than a misleading low number.
 */
export function cohortRetention(
  users: ActivationUser[],
  weeks: number,
  nowMs: number,
): CohortRow[] {
  const start = nowMs - weeks * WEEK_MS;
  const rows: CohortRow[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = start + w * WEEK_MS;
    const cohort = users.filter(
      (u) => u.createdAt >= weekStart && u.createdAt < weekStart + WEEK_MS,
    );
    const retained = Array.from({ length: weeks }, (_, i) => {
      if (weekStart + (i + 1) * WEEK_MS > nowMs) return null;
      return cohort.filter((u) => u.activeWeeks.includes(i)).length;
    });
    rows.push({ weekStart, size: cohort.length, retained });
  }
  return rows;
}

const TIME_TO_FIRST: [string, number][] = [
  ["Under 10 min", 10 * 60 * 1000],
  ["Under 1 hour", 3600 * 1000],
  ["Same day", DAY_MS],
  ["Within a week", WEEK_MS],
  ["Later", Infinity],
];

export function timeToFirstRecording(users: ActivationUser[]): Bucket[] {
  const counts = TIME_TO_FIRST.map(([label]) => ({ label, count: 0 }));
  let never = 0;
  for (const u of users) {
    if (u.firstRecordingAt === null) {
      never += 1;
      continue;
    }
    const wait = Math.max(0, u.firstRecordingAt - u.createdAt);
    const i = TIME_TO_FIRST.findIndex(([, limit]) => wait < limit);
    counts[i]!.count += 1;
  }
  return [...counts, { label: "Never recorded", count: never }];
}

const CLIENT_LABEL: Record<string, string> = {
  extension: "Chrome extension",
  desktop: "Mac app",
  agent: "AI agent",
};

export function firstClientSplit(users: ActivationUser[]): Bucket[] {
  const counts = new Map<string, number>();
  for (const u of users) {
    if (u.firstRecordingAt === null) continue;
    const label = CLIENT_LABEL[u.firstClient ?? ""] ?? "Other";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

// Recorded exactly once, then nothing after the signup day, given long enough
// (three days) that "not back yet" isn't the same as "gone".
export function oneAndDone(
  users: ActivationUser[],
  nowMs: number,
  limit = 25,
): OneAndDoneUser[] {
  return users
    .filter(
      (u) =>
        u.recordings === 1 &&
        u.firstRecordingAt !== null &&
        u.createdAt < nowMs - 3 * DAY_MS &&
        !cameBack(u),
    )
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      firstRecordingAt: u.firstRecordingAt!,
    }));
}

// D1 caps a compound SELECT at five terms, so the activity sources are split
// across two queries and merged per user.
export const ACTIVITY_SOURCES = [
  [
    "SELECT user_id, created_at AS t FROM recordings WHERE state = 'ready'",
    "SELECT userId, createdAt FROM sessions",
    "SELECT userId, updatedAt FROM sessions",
    "SELECT user_id, last_used_at FROM device_tokens WHERE last_used_at IS NOT NULL",
  ],
  [
    "SELECT user_id, created_at AS t FROM screenshots WHERE state = 'ready'",
    "SELECT user_id, created_at FROM recording_activity WHERE user_id IS NOT NULL",
    "SELECT user_id, last_viewed_at FROM recording_views WHERE user_id IS NOT NULL",
  ],
];

type ActivityRow = { user_id: string; last_at: number; weeks: string | null };

function activityQuery(db: D1Database, sources: string[], sinceMs: number) {
  return db
    .prepare(
      `WITH events(user_id, t) AS (${sources.join(" UNION ALL ")})
       SELECT e.user_id AS user_id, MAX(e.t) AS last_at,
              GROUP_CONCAT(DISTINCT (e.t - u.createdAt) / ${WEEK_MS}) AS weeks
         FROM events e
         JOIN users u ON u.id = e.user_id
        WHERE u.createdAt >= ?1 AND e.t >= u.createdAt
        GROUP BY e.user_id`,
    )
    .bind(sinceMs)
    .all<ActivityRow>();
}

export async function listActivationUsers(
  db: D1Database,
  sinceMs: number,
): Promise<ActivationUser[]> {
  const [people, ...activity] = await Promise.all([
    db
      .prepare(
        `SELECT u.id, u.name, u.email, u.createdAt AS created_at,
                (SELECT COUNT(*) FROM recordings r
                  WHERE r.user_id = u.id AND r.state = 'ready') AS recordings,
                (SELECT MIN(r.created_at) FROM recordings r
                  WHERE r.user_id = u.id AND r.state = 'ready') AS first_recording_at,
                (SELECT r.client FROM recordings r
                  WHERE r.user_id = u.id AND r.state = 'ready'
                  ORDER BY r.created_at LIMIT 1) AS first_client
           FROM users u
          WHERE u.createdAt >= ?1`,
      )
      .bind(sinceMs)
      .all<{
        id: string;
        name: string | null;
        email: string;
        created_at: number;
        recordings: number;
        first_recording_at: number | null;
        first_client: string | null;
      }>(),
    ...ACTIVITY_SOURCES.map((sources) => activityQuery(db, sources, sinceMs)),
  ]);
  const byUser = new Map<string, { lastAt: number; weeks: Set<number> }>();
  for (const a of activity.flatMap((q) => q.results ?? [])) {
    const entry = byUser.get(a.user_id) ?? { lastAt: 0, weeks: new Set() };
    entry.lastAt = Math.max(entry.lastAt, a.last_at);
    for (const w of a.weeks?.split(",") ?? []) entry.weeks.add(Number(w));
    byUser.set(a.user_id, entry);
  }
  return (people.results ?? []).map((p) => {
    const a = byUser.get(p.id);
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      createdAt: p.created_at,
      recordings: p.recordings,
      firstRecordingAt: p.first_recording_at,
      firstClient: p.first_client,
      lastActiveAt: a?.lastAt ?? null,
      activeWeeks: a ? [...a.weeks].sort((x, y) => x - y) : [],
    };
  });
}

export async function getActivation(
  db: D1Database,
  weeks = 8,
  nowMs = Date.now(),
): Promise<AdminActivation> {
  const users = await listActivationUsers(db, nowMs - weeks * WEEK_MS);
  return {
    weeks,
    funnel: activationFunnel(users),
    cohorts: cohortRetention(users, weeks, nowMs),
    timeToFirstRecording: timeToFirstRecording(users),
    firstClient: firstClientSplit(users),
    oneAndDone: oneAndDone(users, nowMs),
  };
}
