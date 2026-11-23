/*
 * How someone came to be "active": their web sessions, their device tokens
 * (extension, desktop app, local MCP) and the hourly access log the web app
 * keeps of every signed-in request, so a background check can be told apart
 * from a person actually using the product.
 */
import { describeUserAgent } from "./timeline";

export type AdminAccessVia = "session" | "device";

export type AdminRouteInfo = {
  label: string;
  isBackground: boolean;
};

export type AdminSessionRow = {
  id: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  ipAddress: string | null;
  userAgent: string | null;
  client: string;
  isLive: boolean;
  lastSeenAt: number | null;
  requests: number;
};

export type AdminDeviceRow = {
  id: string;
  label: string;
  createdAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;
  requests: number;
};

export type AdminAccessRow = {
  key: string;
  via: AdminAccessVia;
  credentialId: string;
  credential: string;
  route: string;
  routeLabel: string;
  isBackground: boolean;
  hits: number;
  firstAt: number;
  lastAt: number;
  ip: string | null;
  place: string | null;
  client: string | null;
};

export type AdminActiveCause = {
  at: number;
  via: AdminAccessVia;
  credential: string;
  // Present when the access log saw the request that set it.
  access: AdminAccessRow | null;
  explanation: string;
};

export type AdminUserAccess = {
  lastActive: AdminActiveCause | null;
  lastForeground: AdminAccessRow | null;
  lastBackground: AdminAccessRow | null;
  sessions: AdminSessionRow[];
  devices: AdminDeviceRow[];
  access: AdminAccessRow[];
  totals: {
    requests30d: number;
    backgroundRequests30d: number;
    activeDays30d: number;
    foregroundDays30d: number;
  };
  hasLog: boolean;
};

export const ACCESS_LIMIT = 300;
const DAY_MS = 24 * 60 * 60 * 1000;
// A session's updatedAt or a token's last_used_at is written by the same
// request the log records, a moment apart.
const SAME_REQUEST_MS = 2 * 60 * 1000;

const ROUTES: [RegExp, string, boolean][] = [
  [/^GET \/api\/auth\/get-session$/, "Browser checked its session", true],
  [/^GET \/api\/r\/auth\/check$/, "Checked it is still signed in", true],
  [/^GET \/api\/r\/usage$/, "Checked recording usage", true],
  [/^GET \/api\/usage$/, "Checked usage", true],
  [/^GET \/api\/workspaces$/, "Listed workspaces", true],
  [/^verify-session$/, "Verified its session", true],
  [/^extension-token$/, "Connected the extension", false],
  [/^POST \/api\/r\/init$/, "Started a recording", false],
  [
    /^POST \/api\/r\/(part|segment|audio-part|webcam-part)$/,
    "Uploaded recording data",
    false,
  ],
  [
    /^POST \/api\/r\/(finalize|webcam-finalize)$/,
    "Finished a recording",
    false,
  ],
  [/^POST \/api\/r\/abort$/, "Cancelled a recording", false],
  [/^POST \/api\/s\/upload$/, "Uploaded a screenshot", false],
  [
    /^(PUT|PATCH|POST) \/api\/r\/(comments|reactions)/,
    "Commented or reacted",
    false,
  ],
  [/^DELETE \/api\/(r|s)\//, "Deleted something", false],
  [/^PUT \/api\/r\/summary-chapters\//, "Wrote recording chapters", false],
  [/^\w+ \/mcp$/, "MCP tool call", false],
  [/^ACTION /, "Did something in the dashboard", false],
  [/^PAGE /, "Opened a page", false],
  [/^recording viewer$/, "Opened a recording", false],
  [/^screenshot viewer$/, "Opened a screenshot", false],
];

// What a logged route means to an admin, and whether a person was behind it.
export function describeRoute(route: string): AdminRouteInfo {
  for (const [re, label, isBackground] of ROUTES) {
    if (re.test(route)) {
      if (route.startsWith("PAGE ") || route.startsWith("ACTION ")) {
        return { label: `${label}: ${route.split(" ")[1]}`, isBackground };
      }
      return { label, isBackground };
    }
  }
  return { label: route, isBackground: /^(GET|HEAD) \/api\//.test(route) };
}

function placeOf(city: string | null, country: string | null): string | null {
  if (city && country) return `${city}, ${country}`;
  return city ?? country ?? null;
}

export function explainActive(
  cause: Omit<AdminActiveCause, "explanation">,
): string {
  const what = cause.via === "session" ? "web session" : "device token";
  if (!cause.access) {
    return cause.via === "session"
      ? `Their ${cause.credential} web session was refreshed. Sessions refresh at most once a day on any signed-in request, including a background session check from an open tab, so this alone does not mean they used the product. The detailed log has no request for it.`
      : `Their ${cause.credential} used its device token. Clients use it for background checks as well as uploads, and the detailed log has no request for it.`;
  }
  const a = cause.access;
  const from = [a.client, a.place, a.ip].filter(Boolean).join(" · ");
  const how = a.isBackground
    ? "a background request, not something they did"
    : "something they did";
  return `${a.routeLabel} (${a.route}) through their ${cause.credential} ${what}${from ? ` from ${from}` : ""}. That is ${how}.`;
}

type SessionD1 = {
  id: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  ipAddress: string | null;
  userAgent: string | null;
};
type DeviceD1 = {
  id: string;
  label: string | null;
  created_at: number;
  last_used_at: number | null;
  revoked_at: number | null;
};
type AccessD1 = {
  hour: number;
  via: string;
  credential_id: string;
  route: string;
  hits: number;
  first_at: number;
  last_at: number;
  ip: string | null;
  country: string | null;
  city: string | null;
  user_agent: string | null;
};

const toMs = (t: number) => (t < 1e12 ? t * 1000 : t);

async function hasAccessTable(db: D1Database): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = 'user_access'`,
    )
    .first<{ ok: number }>();
  return !!row;
}

export async function getUserAccess(
  db: D1Database,
  userId: string,
  nowMs = Date.now(),
): Promise<AdminUserAccess> {
  const hasLog = await hasAccessTable(db);
  const [sessionRows, deviceRows, accessRows] = await Promise.all([
    db
      .prepare(
        `SELECT id, createdAt, updatedAt, expiresAt, ipAddress, userAgent
           FROM sessions WHERE userId = ?1 ORDER BY updatedAt DESC LIMIT 100`,
      )
      .bind(userId)
      .all<SessionD1>()
      .then((r) => r.results ?? []),
    db
      .prepare(
        `SELECT id, label, created_at, last_used_at, revoked_at
           FROM device_tokens WHERE user_id = ?1
          ORDER BY COALESCE(last_used_at, created_at) DESC LIMIT 100`,
      )
      .bind(userId)
      .all<DeviceD1>()
      .then((r) => r.results ?? []),
    hasLog
      ? db
          .prepare(
            `SELECT hour, via, credential_id, route, hits, first_at, last_at,
                    ip, country, city, user_agent
               FROM user_access WHERE user_id = ?1 AND last_at >= ?2
              ORDER BY last_at DESC LIMIT ?3`,
          )
          .bind(userId, nowMs - 90 * DAY_MS, 5000)
          .all<AccessD1>()
          .then((r) => r.results ?? [])
      : Promise.resolve([] as AccessD1[]),
  ]);

  const sessionClient = new Map(
    sessionRows.map((s) => [
      s.id,
      describeUserAgent(s.userAgent) ?? "unknown browser",
    ]),
  );
  const deviceLabel = new Map(
    deviceRows.map((d) => [d.id, d.label || "Unnamed device"]),
  );
  const credentialName = (via: string, id: string) =>
    via === "device"
      ? (deviceLabel.get(id) ?? "removed device")
      : (sessionClient.get(id) ?? "ended");

  const access: AdminAccessRow[] = accessRows.map((r) => {
    const info = describeRoute(r.route);
    const via: AdminAccessVia = r.via === "device" ? "device" : "session";
    return {
      key: `${r.hour}-${r.via}-${r.credential_id}-${r.route}`,
      via,
      credentialId: r.credential_id,
      credential: credentialName(via, r.credential_id),
      route: r.route,
      routeLabel: info.label,
      isBackground: info.isBackground,
      hits: r.hits,
      firstAt: r.first_at,
      lastAt: r.last_at,
      ip: r.ip,
      place: placeOf(r.city, r.country),
      client: describeUserAgent(r.user_agent),
    };
  });

  const hitsBy = new Map<string, number>();
  const lastBy = new Map<string, number>();
  for (const a of access) {
    hitsBy.set(a.credentialId, (hitsBy.get(a.credentialId) ?? 0) + a.hits);
    lastBy.set(
      a.credentialId,
      Math.max(lastBy.get(a.credentialId) ?? 0, a.lastAt),
    );
  }

  const sessions: AdminSessionRow[] = sessionRows.map((s) => ({
    id: s.id,
    createdAt: toMs(s.createdAt),
    updatedAt: toMs(s.updatedAt),
    expiresAt: toMs(s.expiresAt),
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    client: sessionClient.get(s.id) ?? "unknown browser",
    isLive: toMs(s.expiresAt) > nowMs,
    lastSeenAt: lastBy.get(s.id) ?? null,
    requests: hitsBy.get(s.id) ?? 0,
  }));
  const devices: AdminDeviceRow[] = deviceRows.map((d) => ({
    id: d.id,
    label: d.label || "Unnamed device",
    createdAt: d.created_at,
    lastUsedAt: d.last_used_at,
    revokedAt: d.revoked_at,
    requests: hitsBy.get(d.id) ?? 0,
  }));

  // Same rule as the users list: the newest session refresh or token use.
  const newestSession = sessions[0];
  const newestDevice = devices
    .filter((d) => d.lastUsedAt !== null)
    .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0))[0];
  let lastActive: AdminActiveCause | null = null;
  const pick =
    newestDevice &&
    (newestDevice.lastUsedAt ?? 0) >= (newestSession?.updatedAt ?? 0)
      ? {
          at: newestDevice.lastUsedAt ?? 0,
          via: "device" as const,
          id: newestDevice.id,
          credential: newestDevice.label,
        }
      : newestSession
        ? {
            at: newestSession.updatedAt,
            via: "session" as const,
            id: newestSession.id,
            credential: newestSession.client,
          }
        : null;
  if (pick) {
    const matched =
      access.find(
        (a) =>
          a.credentialId === pick.id &&
          Math.abs(a.lastAt - pick.at) <= SAME_REQUEST_MS,
      ) ??
      access.find(
        (a) =>
          a.credentialId === pick.id &&
          a.firstAt <= pick.at + SAME_REQUEST_MS &&
          a.lastAt >= pick.at - SAME_REQUEST_MS,
      ) ??
      null;
    const cause = {
      at: pick.at,
      via: pick.via,
      credential: pick.credential,
      access: matched,
    };
    lastActive = { ...cause, explanation: explainActive(cause) };
  }

  const since = nowMs - 30 * DAY_MS;
  const recent = access.filter((a) => a.lastAt >= since);
  const dayOf = (t: number) => Math.floor(t / DAY_MS);
  return {
    lastActive,
    lastForeground: access.find((a) => !a.isBackground) ?? null,
    lastBackground: access.find((a) => a.isBackground) ?? null,
    sessions,
    devices,
    access: access.slice(0, ACCESS_LIMIT),
    totals: {
      requests30d: recent.reduce((n, a) => n + a.hits, 0),
      backgroundRequests30d: recent
        .filter((a) => a.isBackground)
        .reduce((n, a) => n + a.hits, 0),
      activeDays30d: new Set(recent.map((a) => dayOf(a.lastAt))).size,
      foregroundDays30d: new Set(
        recent.filter((a) => !a.isBackground).map((a) => dayOf(a.lastAt)),
      ).size,
    },
    hasLog,
  };
}
