import { NextResponse } from "next/server";
import { getAppWebEnv } from "@/lib/cf-env";
import { loadSession } from "@/lib/session-guard";
import { viewUrlFor, snapViewUrlFor } from "@/lib/site";

// Cookie-gated, so never serve a cached response.
export const dynamic = "force-dynamic";

export type SearchHit = {
  kind: "share" | "snap";
  id: string;
  title: string;
  href: string;
  createdAt: number;
  thumbnailUrl: string | null;
};

const MAX_PER_KIND = 8;

export async function GET(req: Request) {
  const session = await loadSession();
  if (!session) {
    return NextResponse.json({ hits: [] }, { status: 401 });
  }
  const env = await getAppWebEnv();
  if (!env?.DB) return NextResponse.json({ hits: [] });

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const like = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;

  const [shares, snaps] = await Promise.all([
    env.DB.prepare(
      `SELECT slug, title, poster_key, created_at
         FROM shares
        WHERE user_id = ?1
          AND state = 'ready'
          AND title LIKE ?2 ESCAPE '\\'
        ORDER BY created_at DESC
        LIMIT ?3`,
    )
      .bind(session.user.id, like, MAX_PER_KIND)
      .all<{
        slug: string;
        title: string | null;
        poster_key: string | null;
        created_at: number;
      }>(),
    env.DB.prepare(
      `SELECT id, title, created_at
         FROM snaps
        WHERE user_id = ?1
          AND state = 'ready'
          AND title LIKE ?2 ESCAPE '\\'
        ORDER BY created_at DESC
        LIMIT ?3`,
    )
      .bind(session.user.id, like, MAX_PER_KIND)
      .all<{ id: string; title: string | null; created_at: number }>(),
  ]);

  const CDN = env.R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

  const shareHits: SearchHit[] = (shares.results ?? []).map((r) => ({
    kind: "share",
    id: r.slug,
    title: r.title ?? "Untitled recording",
    href: viewUrlFor(r.slug),
    createdAt: r.created_at,
    thumbnailUrl: r.poster_key ? `${CDN}/${r.poster_key}` : null,
  }));

  const snapHits: SearchHit[] = (snaps.results ?? []).map((r) => ({
    kind: "snap",
    id: r.id,
    title: r.title ?? "Untitled snap",
    href: snapViewUrlFor(r.id),
    createdAt: r.created_at,
    thumbnailUrl: `${CDN}/snaps/${r.id}`,
  }));

  const hits = [...shareHits, ...snapHits].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  return NextResponse.json({ hits });
}
