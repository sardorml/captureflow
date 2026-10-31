export type PostHogConfig = {
  apiHost: string;
  projectId: string;
  apiKey: string;
  siteHost: string;
  siteHosts: string[];
};

export type PostHogEnv = {
  SELF_HOSTED?: string;
  APP_BASE_URL?: string;
  POSTHOG_API_HOST?: string;
  POSTHOG_PROJECT_ID?: string;
  POSTHOG_PERSONAL_API_KEY?: string;
  POSTHOG_SITE_HOST?: string;
};

// Web analytics are the hosted instance's alone: a self-hosted admin never
// reads PostHog, configured or not. POSTHOG_SITE_HOST adds a second site to
// switch to, such as the live one from a local admin.
export function postHogConfig(
  env: PostHogEnv | null,
  site?: string,
): PostHogConfig | null {
  if (!env || env.SELF_HOSTED === "true") return null;
  const { POSTHOG_API_HOST, POSTHOG_PROJECT_ID, POSTHOG_PERSONAL_API_KEY } =
    env;
  if (!POSTHOG_API_HOST || !POSTHOG_PROJECT_ID || !POSTHOG_PERSONAL_API_KEY) {
    return null;
  }
  let appHost: string | undefined;
  try {
    appHost = new URL(env.APP_BASE_URL ?? "").host;
  } catch {
    appHost = undefined;
  }
  const siteHosts = [
    ...new Set([env.POSTHOG_SITE_HOST, appHost].filter((h) => !!h)),
  ] as string[];
  if (siteHosts.length === 0) return null;
  return {
    apiHost: POSTHOG_API_HOST,
    projectId: POSTHOG_PROJECT_ID,
    apiKey: POSTHOG_PERSONAL_API_KEY,
    siteHost: site && siteHosts.includes(site) ? site : siteHosts[0]!,
    siteHosts,
  };
}

export const WEB_RANGES = {
  "24h": {
    label: "Last 24 hours",
    n: 24,
    unit: "HOUR",
    bucket: "toStartOfHour",
    step: "HOUR",
  },
  "7d": {
    label: "Last 7 days",
    n: 7,
    unit: "DAY",
    bucket: "toStartOfDay",
    step: "DAY",
  },
  "30d": {
    label: "Last 30 days",
    n: 30,
    unit: "DAY",
    bucket: "toStartOfDay",
    step: "DAY",
  },
  "90d": {
    label: "Last 90 days",
    n: 90,
    unit: "DAY",
    bucket: "toStartOfWeek",
    step: "WEEK",
  },
} as const;

export type WebRange = keyof typeof WEB_RANGES;

export function isWebRange(value: unknown): value is WebRange {
  return typeof value === "string" && value in WEB_RANGES;
}

export type Compared = { current: number; previous: number };

export type WebOverview = {
  visitors: Compared;
  pageviews: Compared;
  sessions: Compared;
  sessionSeconds: Compared;
  bounceRate: Compared;
};

export type WebPoint = { at: number; current: number; previous: number };

export type WebRow = { key: string; visitors: number; views: number };

export type WebBreakdowns = {
  pages: WebRow[];
  entryPages: WebRow[];
  sources: WebRow[];
  campaigns: WebRow[];
  countries: WebRow[];
  devices: WebRow[];
  browsers: WebRow[];
  systems: WebRow[];
};

export type WebAnalytics = {
  range: WebRange;
  overview: WebOverview;
  series: WebPoint[];
} & WebBreakdowns;

export function hogString(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function periods(range: WebRange) {
  const { n, unit } = WEB_RANGES[range];
  return {
    interval: `INTERVAL ${n} ${unit}`,
    current: `timestamp >= now() - INTERVAL ${n} ${unit}`,
    both: `timestamp >= now() - INTERVAL ${2 * n} ${unit}`,
  };
}

function pageviews(config: PostHogConfig, range: WebRange, both = false) {
  const w = periods(range);
  return `event = '$pageview'
    AND properties.$host = ${hogString(config.siteHost)}
    AND ${both ? w.both : w.current}`;
}

export function overviewQuery(config: PostHogConfig, range: WebRange): string {
  const w = periods(range);
  return `
    SELECT
      uniqIf(person_id, ${w.current}),
      uniqIf(person_id, NOT ${w.current}),
      countIf(${w.current}),
      countIf(NOT ${w.current}),
      uniqIf(properties.$session_id, ${w.current}),
      uniqIf(properties.$session_id, NOT ${w.current})
    FROM events
    WHERE ${pageviews(config, range, true)}`;
}

// A bounce is a session with one pageview that ended within ten seconds.
export function sessionsQuery(config: PostHogConfig, range: WebRange): string {
  const w = periods(range);
  return `
    SELECT
      avgIf(seconds, recent), avgIf(seconds, NOT recent),
      avgIf(bounced, recent), avgIf(bounced, NOT recent)
    FROM (
      SELECT
        properties.$session_id AS session,
        min(timestamp) >= now() - ${w.interval} AS recent,
        dateDiff('second', min(timestamp), max(timestamp)) AS seconds,
        if(countIf(event = '$pageview') <= 1 AND seconds < 10, 1, 0) AS bounced
      FROM events
      WHERE properties.$host = ${hogString(config.siteHost)}
        AND ${w.both}
        AND properties.$session_id IS NOT NULL
      GROUP BY session
    )`;
}

export function seriesQuery(config: PostHogConfig, range: WebRange): string {
  const w = periods(range);
  const { bucket, step } = WEB_RANGES[range];
  return `
    SELECT
      ${bucket}(if(${w.current}, timestamp, timestamp + ${w.interval})) AS at,
      uniqIf(person_id, ${w.current}),
      uniqIf(person_id, NOT ${w.current})
    FROM events
    WHERE ${pageviews(config, range, true)}
    GROUP BY at
    ORDER BY at WITH FILL
      FROM ${bucket}(now() - ${w.interval})
      TO ${bucket}(now()) + INTERVAL 1 ${step}
      STEP INTERVAL 1 ${step}`;
}

export function breakdownQuery(
  config: PostHogConfig,
  range: WebRange,
  property: string,
  limit = 10,
): string {
  return `
    SELECT ${property} AS key, uniq(person_id) AS visitors, count() AS views
    FROM events
    WHERE ${pageviews(config, range)}
    GROUP BY key
    ORDER BY visitors DESC, views DESC
    LIMIT ${limit}`;
}

// Entry pages, sources and campaigns belong to the session: the first pageview
// carries them, not every pageview after it.
export function entryQuery(
  config: PostHogConfig,
  range: WebRange,
  property: string,
  limit = 10,
): string {
  return `
    SELECT key, uniq(person) AS visitors, count() AS views
    FROM (
      SELECT
        properties.$session_id AS session,
        any(person_id) AS person,
        argMin(${property}, timestamp) AS key
      FROM events
      WHERE ${pageviews(config, range)}
      GROUP BY session
    )
    GROUP BY key
    ORDER BY visitors DESC, views DESC
    LIMIT ${limit}`;
}

type QueryResult = { results?: unknown[][] };

export async function runHogQL(
  config: PostHogConfig,
  name: string,
  query: string,
): Promise<unknown[][]> {
  const res = await fetch(
    `${config.apiHost.replace(/\/+$/, "")}/api/projects/${encodeURIComponent(config.projectId)}/query/`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ name, query: { kind: "HogQLQuery", query } }),
    },
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`PostHog ${name}: ${res.status} ${detail.slice(0, 200)}`);
  }
  return ((await res.json()) as QueryResult).results ?? [];
}

// PostHog runs at most three queries at once per project.
async function inLanes<T>(jobs: (() => Promise<T>)[], lanes = 3): Promise<T[]> {
  const out = new Array<T>(jobs.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(lanes, jobs.length) }, async () => {
      while (next < jobs.length) {
        const i = next++;
        out[i] = await jobs[i]!();
      }
    }),
  );
  return out;
}

const num = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? v : 0;

function rows(results: unknown[][]): WebRow[] {
  return results.map(([key, visitors, views]) => ({
    key:
      key === null || key === undefined || key === "" ? "(none)" : String(key),
    visitors: num(visitors),
    views: num(views),
  }));
}

const BREAKDOWNS: [keyof WebBreakdowns, "page" | "entry", string][] = [
  ["pages", "page", "properties.$pathname"],
  ["entryPages", "entry", "properties.$pathname"],
  ["sources", "entry", "properties.$referring_domain"],
  ["campaigns", "entry", "properties.utm_source"],
  ["countries", "page", "properties.$geoip_country_code"],
  ["devices", "page", "properties.$device_type"],
  ["browsers", "page", "properties.$browser"],
  ["systems", "page", "properties.$os"],
];

export async function getWebAnalytics(
  config: PostHogConfig,
  range: WebRange,
): Promise<WebAnalytics> {
  const results = await inLanes([
    () => runHogQL(config, "admin_web_overview", overviewQuery(config, range)),
    () => runHogQL(config, "admin_web_sessions", sessionsQuery(config, range)),
    () => runHogQL(config, "admin_web_series", seriesQuery(config, range)),
    ...BREAKDOWNS.map(
      ([name, kind, property]) =>
        () =>
          runHogQL(
            config,
            `admin_web_${name}`,
            kind === "entry"
              ? entryQuery(config, range, property)
              : breakdownQuery(config, range, property),
          ),
    ),
  ]);
  const [overview, sessions, series, ...breakdowns] = results;
  const o = overview?.[0] ?? [];
  const s = sessions?.[0] ?? [];
  const pair = (row: unknown[], i: number): Compared => ({
    current: num(row[i]),
    previous: num(row[i + 1]),
  });
  return {
    range,
    overview: {
      visitors: pair(o, 0),
      pageviews: pair(o, 2),
      sessions: pair(o, 4),
      sessionSeconds: pair(s, 0),
      bounceRate: pair(s, 2),
    },
    series: (series ?? []).map(([at, current, previous]) => ({
      at: Date.parse(String(at)),
      current: num(current),
      previous: num(previous),
    })),
    ...(Object.fromEntries(
      BREAKDOWNS.map(([name], i) => [name, rows(breakdowns[i] ?? [])]),
    ) as WebBreakdowns),
  };
}
