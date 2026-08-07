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
