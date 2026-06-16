// GitHub star count for the source repo, shown in the nav.
//
// Fetched live from the public GitHub API and cached for an hour. Before the
// repo is public (or if the API is unreachable) the live call returns null and
// the nav simply hides the count — set NEXT_PUBLIC_GITHUB_STARS to force a
// value in the meantime.

import { SOURCE_REPO_URL } from './site';

const REPO_PATH = SOURCE_REPO_URL.replace('https://github.com/', '');

export async function getStarCount(): Promise<number | null> {
  // Prefer the live count. Only fall back to the env value when the API is
  // unreachable or the repo is still private (404) — so the moment the repo
  // goes public the real number takes over without a code change.
  const live = await fetchLiveStars();
  if (live != null) return live;

  const fallback = process.env.NEXT_PUBLIC_GITHUB_STARS;
  if (fallback) {
    const n = Number(fallback);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

async function fetchLiveStars(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_PATH}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'captureflow-web',
      },
      // Cache the result for an hour so we don't hit the API on every render.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

// Compact display: 942 → "942", 1234 → "1.2k", 12000 → "12k".
export function formatStars(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k.toFixed(k < 10 ? 1 : 0).replace(/\.0$/, '')}k`;
}
