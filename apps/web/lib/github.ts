import { SOURCE_REPO_URL } from "./site";

const REPO_PATH = SOURCE_REPO_URL.replace("https://github.com/", "");

export async function getStarCount(): Promise<number | null> {
  const live = await fetchLiveStars();
  if (live != null) return live;

  const fallback = process.env.NEXT_PUBLIC_GITHUB_STARS;
  if (fallback) {
    const n = Number(fallback);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/*
 * `next: { revalidate }` is a no-op here — the Cloudflare adapter has no
 * incremental cache configured — so every render used to call GitHub. Its
 * unauthenticated limit is 60/hour per IP and a Worker shares egress IPs with
 * the whole colo, so the call 403s most of the time and the count vanished from
 * the nav. The Cache API holds the answer instead: one call per colo per hour.
 */
const STAR_CACHE_KEY = "https://captureflow.dev/__cache/github-stars";
const STAR_CACHE_SECONDS = 3600;
// The landing page awaits these; a slow GitHub must not hold it hostage.
const GITHUB_TIMEOUT_MS = 2500;

type EdgeCache = {
  match(key: string): Promise<Response | undefined>;
  put(key: string, response: Response): Promise<void>;
};

// Absent under `next dev` (Node), present in the Worker.
function edgeCache(): EdgeCache | null {
  const store = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return store?.default ?? null;
}

async function fetchLiveStars(): Promise<number | null> {
  const cache = edgeCache();
  try {
    const hit = await cache?.match(STAR_CACHE_KEY);
    if (hit) {
      const cached = Number(await hit.text());
      if (Number.isFinite(cached)) return cached;
    }
  } catch {
    /* cache miss behaves like no cache */
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_PATH}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "captureflow-web",
      },
      next: { revalidate: STAR_CACHE_SECONDS },
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    const count = data.stargazers_count;
    if (typeof count !== "number") return null;

    await cache
      ?.put(
        STAR_CACHE_KEY,
        new Response(String(count), {
          headers: { "cache-control": `max-age=${STAR_CACHE_SECONDS}` },
        }),
      )
      .catch(() => {});
    return count;
  } catch {
    return null;
  }
}

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

const ACTIVITY_CACHE_KEY = "https://captureflow.dev/__cache/github-activity";
const ACTIVITY_REFRESH_SECONDS = 900;
const ACTIVITY_KEEP_SECONDS = 7 * 24 * 3600;
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

type CachedActivity = { activity: RepoActivity; fetchedAt: number };

async function readCachedActivity(
  cache: EdgeCache | null,
): Promise<CachedActivity | null> {
  try {
    const hit = await cache?.match(ACTIVITY_CACHE_KEY);
    if (!hit) return null;
    const cached = (await hit.json()) as Partial<CachedActivity>;
    if (
      typeof cached.fetchedAt === "number" &&
      Array.isArray(cached.activity?.shipped) &&
      Array.isArray(cached.activity?.open)
    ) {
      return cached as CachedActivity;
    }
  } catch {
    /* cache miss behaves like no cache */
  }
  return null;
}

/*
 * The entry outlives its refresh interval so a rate-limited GitHub call (the
 * Worker's egress IP is shared, see the stars cache above) serves the last good
 * copy instead of hiding the section.
 */
export async function getRepoActivity(
  nowMs = Date.now(),
): Promise<RepoActivity | null> {
  const cache = edgeCache();
  const cached = await readCachedActivity(cache);
  if (cached && nowMs - cached.fetchedAt < ACTIVITY_REFRESH_SECONDS * 1000) {
    return cached.activity;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_PATH}/issues?state=all&sort=updated&per_page=50`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "captureflow-web",
        },
        signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
      },
    );
    if (!res.ok) return cached?.activity ?? null;
    const activity = hydrateRepoActivity(await res.json());

    const entry: CachedActivity = { activity, fetchedAt: nowMs };
    await cache
      ?.put(
        ACTIVITY_CACHE_KEY,
        new Response(JSON.stringify(entry), {
          headers: { "cache-control": `max-age=${ACTIVITY_KEEP_SECONDS}` },
        }),
      )
      .catch(() => {});
    return activity;
  } catch {
    return cached?.activity ?? null;
  }
}
