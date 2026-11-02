/// <reference types="@cloudflare/workers-types" />

import { SOURCE_REPO_URL } from "./site";

const REPO_PATH = SOURCE_REPO_URL.replace("https://github.com/", "");

/*
 * One saved copy in R2 serves every colo, so a visitor never waits on GitHub or
 * depends on its rate limit, which Workers share per egress IP. A cron refreshes
 * it; a visit that finds it stale refreshes it in the background too.
 */
const STATS_KEY = "site/github-stats.json";
const STALE_MS = 10 * 60 * 1000;
const EDGE_CACHE_SECONDS = 60;
const GITHUB_TIMEOUT_MS = 2500;

export function formatStars(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k.toFixed(k < 10 ? 1 : 0).replace(/\.0$/, "")}k`;
}

export type RepoItem = {
  kind: "issue" | "pr";
  number: number;
  title: string;
  url: string;
  state: "open" | "draft" | "closed" | "merged";
  date: string;
};

export type RepoActivity = { shipped: RepoItem[]; open: RepoItem[] };

export type RepoStats = { stars: string | null; activity: RepoActivity | null };

const ACTIVITY_LIMIT = 5;

function hydrateRepoItem(raw: unknown): RepoItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.number !== "number" ||
    typeof r.title !== "string" ||
    typeof r.html_url !== "string" ||
    !r.html_url.startsWith(`${SOURCE_REPO_URL}/`) ||
    typeof r.updated_at !== "string"
  ) {
    return null;
  }
  const pr = r.pull_request as { merged_at?: unknown } | undefined;
  const isPr = !!pr && typeof pr === "object";
  const mergedAt =
    isPr && typeof pr.merged_at === "string" ? pr.merged_at : null;
  const state = mergedAt
    ? "merged"
    : r.state !== "open"
      ? "closed"
      : isPr && r.draft === true
        ? "draft"
        : "open";
  return {
    kind: isPr ? "pr" : "issue",
    number: r.number,
    title: r.title,
    url: r.html_url,
    state,
    date: mergedAt ?? r.updated_at,
  };
}

// GitHub's issues endpoint returns pull requests too, so one call covers both.
export function hydrateRepoActivity(raw: unknown): RepoActivity {
  const items = (Array.isArray(raw) ? raw : [])
    .map(hydrateRepoItem)
    .filter((i): i is RepoItem => i !== null);
  return {
    shipped: items.filter((i) => i.state === "merged").slice(0, ACTIVITY_LIMIT),
    open: items
      .filter((i) => i.state === "open" || i.state === "draft")
      .slice(0, ACTIVITY_LIMIT),
  };
}

type SavedStats = {
  stars: number | null;
  activity: RepoActivity | null;
  fetchedAt: number;
};

export type RepoStatsStore = Pick<R2Bucket, "get" | "put">;

function hydrateSavedStats(raw: unknown): SavedStats | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<SavedStats>;
  if (typeof r.fetchedAt !== "number") return null;
  return {
    stars: typeof r.stars === "number" ? r.stars : null,
    activity:
      Array.isArray(r.activity?.shipped) && Array.isArray(r.activity?.open)
        ? r.activity
        : null,
    fetchedAt: r.fetchedAt,
  };
}

async function readSavedStats(
  store: RepoStatsStore,
): Promise<SavedStats | null> {
  try {
    const saved = await store.get(STATS_KEY);
    return saved ? hydrateSavedStats(await saved.json()) : null;
  } catch {
    return null;
  }
}

async function fetchGitHub(
  path: string,
  token: string | undefined,
): Promise<unknown> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_PATH}${path}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "captureflow-web",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
      },
    );
    // A bad or revoked token must not take the count down with it.
    if (res.status === 401 && token) {
      console.warn("[github] token rejected, retrying without it");
      return fetchGitHub(path, undefined);
    }
    if (!res.ok) {
      console.warn(`[github] ${path || "repo"} answered ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[github] ${path || "repo"} failed`, err);
    return null;
  }
}

// A failed call keeps the last good value; nothing is saved if both fail.
export async function refreshRepoStats(
  store: RepoStatsStore,
  token: string | undefined,
  nowMs = Date.now(),
): Promise<SavedStats | null> {
  const [previous, repo, issues] = await Promise.all([
    readSavedStats(store),
    fetchGitHub("", token),
    fetchGitHub("/issues?state=all&sort=updated&per_page=50", token),
  ]);
  const count = (repo as { stargazers_count?: unknown } | null)
    ?.stargazers_count;
  const stars = typeof count === "number" ? count : null;
  const activity = Array.isArray(issues) ? hydrateRepoActivity(issues) : null;
  if (stars === null && activity === null) return previous;

  const next: SavedStats = {
    stars: stars ?? previous?.stars ?? null,
    activity: activity ?? previous?.activity ?? null,
    fetchedAt: nowMs,
  };
  await store.put(STATS_KEY, JSON.stringify(next)).catch(() => {});
  return next;
}

export async function loadRepoStats(
  store: RepoStatsStore,
  token: string | undefined,
  defer: (work: Promise<unknown>) => void,
  nowMs = Date.now(),
): Promise<RepoStats> {
  let saved = await readSavedStats(store);
  if (!saved) saved = await refreshRepoStats(store, token, nowMs);
  else if (nowMs - saved.fetchedAt >= STALE_MS) {
    defer(refreshRepoStats(store, token, nowMs));
  }
  return {
    stars: saved?.stars != null ? formatStars(saved.stars) : null,
    activity: saved?.activity ?? null,
  };
}

type EdgeCache = {
  match(key: string): Promise<Response | undefined>;
  put(key: string, response: Response): Promise<void>;
};

// Runs ahead of Next.js in the Worker, so a visit doesn't pay for the app to start.
export async function serveRepoStats(
  request: Request,
  store: RepoStatsStore,
  token: string | undefined,
  defer: (work: Promise<unknown>) => void,
): Promise<Response> {
  const cache = (globalThis as unknown as { caches: { default: EdgeCache } })
    .caches.default;
  const url = new URL(request.url);
  const key = `${url.origin}${url.pathname}`;
  const headers = {
    "cache-control": `public, max-age=${EDGE_CACHE_SECONDS}`,
    "content-type": "application/json",
  };
  const hit = await cache.match(key).catch(() => undefined);
  // A cache hit comes back with the zone's four-hour browser TTL; keep ours.
  if (hit) return new Response(hit.body, { headers });

  const stats = await loadRepoStats(store, token, defer);
  const response = new Response(JSON.stringify(stats), { headers });
  // A count GitHub couldn't give us yet must not be held for the next visitor.
  if (stats.stars !== null) {
    defer(cache.put(key, response.clone()).catch(() => {}));
  }
  return response;
}
