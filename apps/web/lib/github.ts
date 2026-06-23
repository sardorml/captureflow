import { SOURCE_REPO_URL } from './site';

const REPO_PATH = SOURCE_REPO_URL.replace('https://github.com/', '');

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

async function fetchLiveStars(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_PATH}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'captureflow-web',
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

export function formatStars(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k.toFixed(k < 10 ? 1 : 0).replace(/\.0$/, '')}k`;
}
