import { type PostHogConfig, hogString, runHogQL } from "./web-analytics";

export type ActivityKind =
  | "page"
  | "click"
  | "form"
  | "recording"
  | "screenshot"
  | "account"
  | "workspace"
  | "billing"
  | "error"
  | "frustration"
  | "other";

export type ActivityStep = {
  id: string;
  at: number;
  kind: ActivityKind;
  text: string;
  subject: string | null;
  path: string | null;
  count: number;
};

export type ActivitySession = {
  id: string;
  startedAt: number;
  endedAt: number;
  device: string | null;
  place: string | null;
  replayUrl: string | null;
  pageCount: number;
  steps: ActivityStep[];
};

export type UserProductActivity = {
  days: number;
  sessions: ActivitySession[];
  totals: {
    sessions: number;
    seconds: number;
    pages: number;
    actions: number;
    errors: number;
  };
  topPages: { label: string; count: number }[];
  lastSeenAt: number | null;
  truncated: boolean;
};

export type RawActivityEvent = {
  id: string;
  event: string;
  at: number;
  sessionId: string | null;
  path: string | null;
  host: string | null;
  text: string | null;
  tag: string | null;
  eventType: string | null;
  subject: string | null;
  detail: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  city: string | null;
  country: string | null;
  errorMessage: string | null;
  lib: string | null;
};

export const ACTIVITY_EVENT_LIMIT = 1500;
const SESSION_GAP_MS = 30 * 60 * 1000;

const IGNORED_EVENTS = new Set([
  "$pageleave",
  "$web_vitals",
  "$identify",
  "$set",
  "$feature_flag_called",
  "$groupidentify",
  "$opt_in",
  "survey shown",
  "$dead_click",
]);

// Mirrors the actions in apps/web/lib/user-events.ts.
const SERVER_LABELS: Record<string, [ActivityKind, string]> = {
  "account.sign_up": ["account", "Created an account"],
  "account.sign_in": ["account", "Signed in"],
  "account.sign_out": ["account", "Signed out"],
  "account.avatar_upload": ["account", "Changed their profile photo"],
  "account.avatar_remove": ["account", "Removed their profile photo"],
  "recording.create": ["recording", "Started a recording"],
  "recording.upload": ["recording", "Finished uploading a recording"],
  "recording.rename": ["recording", "Renamed a recording to"],
  "recording.visibility": ["recording", "Changed who can see a recording"],
  "recording.edit": ["recording", "Edited a recording"],
  "recording.background": ["recording", "Uploaded a recording background"],
  "recording.transcript_edit": ["recording", "Edited a transcript"],
  "recording.transcript_reset": ["recording", "Reset a transcript"],
  "recording.chapters_edit": ["recording", "Edited chapters"],
  "recording.delete": ["recording", "Deleted a recording"],
  "recording.discard": ["recording", "Discarded a recording"],
  "comment.delete": ["recording", "Deleted a comment"],
  "reaction.remove": ["recording", "Removed a reaction"],
  "screenshot.create": ["screenshot", "Took a screenshot"],
  "screenshot.rename": ["screenshot", "Renamed a screenshot to"],
  "screenshot.visibility": ["screenshot", "Changed who can see a screenshot"],
  "screenshot.edit": ["screenshot", "Edited a screenshot"],
  "screenshot.delete": ["screenshot", "Deleted a screenshot"],
  "device.revoke": ["account", "Disconnected a device"],
  "workspace.rename": ["workspace", "Renamed a workspace to"],
  "workspace.logo_upload": ["workspace", "Changed a workspace logo"],
  "workspace.logo_remove": ["workspace", "Removed a workspace logo"],
  "workspace.uploads_policy": ["workspace", "Changed who can upload"],
  "workspace.switch": ["workspace", "Switched workspace"],
  "workspace.plan_switch": ["billing", "Changed plan"],
  "workspace.leave": ["workspace", "Left a workspace"],
  "member.invite": ["workspace", "Invited"],
  "member.invite_revoke": ["workspace", "Cancelled an invite for"],
  "member.remove": ["workspace", "Removed a member"],
  "member.role_change": ["workspace", "Changed a member's role"],
  "member.seat_deny": ["workspace", "Turned down a seat request"],
  "member.seat_request": ["billing", "Asked for a paid seat"],
  "invite.accept": ["workspace", "Accepted an invite"],
  "invite.decline": ["workspace", "Declined an invite"],
};

const PAGE_LABELS: [RegExp, string][] = [
  [/^\/$/, "Home"],
  [/^\/login/, "Sign-in page"],
  [/^\/signup|^\/sign-up/, "Sign-up page"],
  [/^\/auth\/callback/, "Finished signing in"],
  [/^\/recordings\/[^/]+\/edit/, "Recording editor"],
  [/^\/recordings/, "Recordings"],
  [/^\/screenshots\/[^/]+\/edit/, "Screenshot editor"],
  [/^\/screenshots/, "Screenshots"],
  [/^\/r\//, "A recording"],
  [/^\/s\//, "A screenshot"],
  [/^\/canvas/, "Canvas"],
  [/^\/settings/, "Settings"],
  [/^\/members/, "Members"],
  [/^\/billing/, "Billing"],
  [/^\/notifications/, "Notifications"],
  [/^\/pricing|^\/[a-z]{2}\/pricing/, "Pricing"],
  [/^\/blog/, "Blog"],
  [/^\/docs/, "Docs"],
  [/^\/mcp/, "MCP sign-in"],
  [/^\/invite/, "An invite"],
];

export function pageLabel(path: string | null): string {
  if (!path) return "a page";
  const clean =
    (path.split("?")[0] ?? "/").replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return PAGE_LABELS.find(([re]) => re.test(clean))?.[1] ?? clean;
}

function clip(value: string | null, max = 80): string | null {
  const v = value?.replace(/\s+/g, " ").trim();
  if (!v) return null;
  return v.length > max ? `${v.slice(0, max - 1)}…` : v;
}

export function describeEvent(
  e: RawActivityEvent,
): Pick<ActivityStep, "kind" | "text" | "subject"> | null {
  if (IGNORED_EVENTS.has(e.event)) return null;
  if (e.event.startsWith("cf:")) {
    const action = e.event.slice(3);
    const [kind, text] = SERVER_LABELS[action] ?? ["other", action];
    return { kind, text, subject: clip(e.subject) };
  }
  switch (e.event) {
    case "$pageview":
      return { kind: "page", text: "Opened", subject: pageLabel(e.path) };
    case "$autocapture": {
      const label = clip(e.text, 60);
      if (e.eventType === "submit") {
        return { kind: "form", text: "Submitted a form", subject: label };
      }
      if (e.eventType === "change") {
        return {
          kind: "form",
          text: "Changed a field",
          subject: label,
        };
      }
      const what =
        e.tag === "a" ? "a link" : e.tag === "button" ? "a button" : null;
      return label
        ? { kind: "click", text: "Clicked", subject: `“${label}”` }
        : {
            kind: "click",
            text: `Clicked ${what ?? "something"}`,
            subject: null,
          };
    }
    case "$rageclick":
      return {
        kind: "frustration",
        text: "Clicked repeatedly in frustration on",
        subject: clip(e.text, 60) ?? pageLabel(e.path),
      };
    case "$exception":
      return {
        kind: "error",
        text: "Hit an error",
        subject: clip(e.errorMessage, 120),
      };
    default:
      return {
        kind:
          e.event.includes("checkout") || e.event.includes("upgrade")
            ? "billing"
            : "other",
        text: humanize(e.event),
        subject: clip(e.subject ?? e.detail),
      };
  }
}

function humanize(event: string): string {
  const words = event
    .replace(/^\$/, "")
    .replace(/[_.:-]+/g, " ")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function deviceOf(e: RawActivityEvent): string | null {
  if (e.lib === "captureflow-server") return null;
  if (e.browser && e.os) return `${e.browser} on ${e.os}`;
  return e.browser ?? e.os ?? e.deviceType ?? null;
}

function placeOf(e: RawActivityEvent): string | null {
  return [e.city, e.country].filter((p) => !!p).join(", ") || null;
}

// Events arrive newest first. A session is PostHog's own session id; server
// events carry none, so they join whatever session was open within 30 minutes.
export function groupSessions(
  events: RawActivityEvent[],
  replayUrl: (sessionId: string) => string | null,
): ActivitySession[] {
  const sorted = [...events].sort((a, b) => a.at - b.at);
  const sessions: ActivitySession[] = [];
  const byId = new Map<string, ActivitySession>();
  let current: ActivitySession | null = null;

  for (const e of sorted) {
    const described = describeEvent(e);
    let session: ActivitySession | null =
      (e.sessionId && byId.get(e.sessionId)) || null;
    if (
      !session &&
      !e.sessionId &&
      current &&
      e.at - current.endedAt < SESSION_GAP_MS
    ) {
      session = current;
    }
    if (!session) {
      session = {
        id: e.sessionId ?? `orphan-${e.id}`,
        startedAt: e.at,
        endedAt: e.at,
        device: null,
        place: null,
        replayUrl: e.sessionId ? replayUrl(e.sessionId) : null,
        pageCount: 0,
        steps: [],
      };
      sessions.push(session);
      if (e.sessionId) byId.set(e.sessionId, session);
    }
    current = session;
    session.endedAt = Math.max(session.endedAt, e.at);
    session.device ??= deviceOf(e);
    session.place ??= placeOf(e);
    if (!described) continue;
    if (described.kind === "page") session.pageCount += 1;
    const last = session.steps[session.steps.length - 1];
    if (
      last &&
      last.kind === described.kind &&
      last.text === described.text &&
      last.subject === described.subject
    ) {
      last.count += 1;
      continue;
    }
    session.steps.push({
      id: e.id,
      at: e.at,
      path: e.path,
      count: 1,
      ...described,
    });
  }
  return sessions
    .filter((s) => s.steps.length > 0)
    .sort((a, b) => b.startedAt - a.startedAt);
}

export function summarizeActivity(
  sessions: ActivitySession[],
  days: number,
  truncated: boolean,
): UserProductActivity {
  const pages = new Map<string, number>();
  let seconds = 0;
  let pageCount = 0;
  let actions = 0;
  let errors = 0;
  for (const s of sessions) {
    seconds += Math.round((s.endedAt - s.startedAt) / 1000);
    for (const step of s.steps) {
      if (step.kind === "page") {
        pageCount += step.count;
        const label = step.subject ?? "a page";
        pages.set(label, (pages.get(label) ?? 0) + step.count);
      } else if (step.kind === "error" || step.kind === "frustration") {
        errors += step.count;
      } else {
        actions += step.count;
      }
    }
  }
  return {
    days,
    sessions,
    totals: {
      sessions: sessions.length,
      seconds,
      pages: pageCount,
      actions,
      errors,
    },
    topPages: [...pages.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count]) => ({ label, count })),
    lastSeenAt: sessions[0]?.endedAt ?? null,
    truncated,
  };
}

export function userActivityQuery(email: string, days: number): string {
  const who = hogString(email.toLowerCase());
  return `
    SELECT
      toString(uuid),
      event,
      timestamp,
      properties.$session_id,
      properties.$pathname,
      properties.$host,
      coalesce(properties.$el_text, extract(elements_chain, 'text="([^"]*)"')),
      extract(elements_chain, '^([a-z0-9]+)[.:;]'),
      properties.$event_type,
      properties.subject,
      properties.detail,
      properties.$browser,
      properties.$os,
      properties.$device_type,
      properties.$geoip_city_name,
      properties.$geoip_country_code,
      coalesce(properties.$exception_message, JSONExtractString(properties.$exception_list, 1, 'value')),
      properties.$lib
    FROM events
    WHERE (lower(distinct_id) = ${who} OR lower(person.properties.email) = ${who})
      AND event NOT IN (${[...IGNORED_EVENTS].map(hogString).join(", ")})
      AND timestamp >= now() - INTERVAL ${Math.max(1, Math.floor(days))} DAY
    ORDER BY timestamp DESC
    LIMIT ${ACTIVITY_EVENT_LIMIT}`;
}

const str = (v: unknown): string | null =>
  typeof v === "string" && v !== "" ? v : null;

export function rowToEvent(row: unknown[]): RawActivityEvent {
  const at = Date.parse(String(row[2] ?? ""));
  return {
    id: String(row[0] ?? ""),
    event: String(row[1] ?? ""),
    at: Number.isFinite(at) ? at : 0,
    sessionId: str(row[3]),
    path: str(row[4]),
    host: str(row[5]),
    text: str(row[6]),
    tag: str(row[7]),
    eventType: str(row[8]),
    subject: str(row[9]),
    detail: str(row[10]),
    browser: str(row[11]),
    os: str(row[12]),
    deviceType: str(row[13]),
    city: str(row[14]),
    country: str(row[15]),
    errorMessage: str(row[16]),
    lib: str(row[17]),
  };
}

export function postHogUiBase(config: PostHogConfig): string {
  return `${config.apiHost.replace(/\/+$/, "")}/project/${encodeURIComponent(config.projectId)}`;
}

export async function getUserProductActivity(
  config: PostHogConfig,
  email: string,
  days = 30,
): Promise<UserProductActivity> {
  const rows = await runHogQL(
    config,
    "admin_user_activity",
    userActivityQuery(email, days),
  );
  const base = postHogUiBase(config);
  const sessions = groupSessions(
    rows.map(rowToEvent),
    (id) => `${base}/replay/${encodeURIComponent(id)}`,
  );
  return summarizeActivity(sessions, days, rows.length >= ACTIVITY_EVENT_LIMIT);
}
