/// <reference types="@cloudflare/workers-types" />

import { screenshotViewUrlFor, viewUrlFor } from "./site";

export type SearchHit = {
  kind: "recording" | "screenshot";
  id: string;
  title: string;
  href: string;
  createdAt: number;
  thumbnailUrl: string | null;
};

const MAX_PER_KIND = 8;

// The user's own ready recordings and screenshots whose title holds the query, newest first.
export async function searchLibrary(
  db: D1Database,
  userId: string,
  query: string,
  cdnBase: string,
): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const like = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;

  const [recordings, screenshots] = await Promise.all([
    db
      .prepare(
        `SELECT slug, title, poster_key, created_at
           FROM recordings
          WHERE user_id = ?1
            AND state = 'ready'
            AND title LIKE ?2 ESCAPE '\\'
          ORDER BY created_at DESC
          LIMIT ?3`,
      )
      .bind(userId, like, MAX_PER_KIND)
      .all<{
        slug: string;
        title: string | null;
        poster_key: string | null;
        created_at: number;
      }>(),
    db
      .prepare(
        `SELECT id, title, created_at
           FROM screenshots
          WHERE user_id = ?1
            AND state = 'ready'
            AND title LIKE ?2 ESCAPE '\\'
          ORDER BY created_at DESC
          LIMIT ?3`,
      )
      .bind(userId, like, MAX_PER_KIND)
      .all<{ id: string; title: string | null; created_at: number }>(),
  ]);

  const recordingHits: SearchHit[] = (recordings.results ?? []).map((r) => ({
    kind: "recording",
    id: r.slug,
    title: r.title ?? "Untitled recording",
    href: viewUrlFor(r.slug),
    createdAt: r.created_at,
    thumbnailUrl: r.poster_key ? `${cdnBase}/${r.poster_key}` : null,
  }));

  const screenshotHits: SearchHit[] = (screenshots.results ?? []).map((r) => ({
    kind: "screenshot",
    id: r.id,
    title: r.title ?? "Untitled screenshot",
    href: screenshotViewUrlFor(r.id),
    createdAt: r.created_at,
    thumbnailUrl: `${cdnBase}/screenshots/${r.id}`,
  }));

  return [...recordingHits, ...screenshotHits].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}
