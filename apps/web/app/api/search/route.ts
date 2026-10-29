import { NextResponse } from "next/server";
import { getAppWebEnv } from "@/lib/cf-env";
import { searchLibrary } from "@/lib/library-search";
import { loadSession } from "@/lib/session-guard";
import { R2_PUBLIC_BASE_URL } from "@/lib/site";

// Cookie-gated, so never serve a cached response.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await loadSession();
  if (!session) {
    return NextResponse.json({ hits: [] }, { status: 401 });
  }
  const env = await getAppWebEnv();
  if (!env?.DB) return NextResponse.json({ hits: [] });

  const hits = await searchLibrary(
    env.DB,
    session.user.id,
    new URL(req.url).searchParams.get("q") ?? "",
    env.R2_PUBLIC_BASE_URL ?? R2_PUBLIC_BASE_URL,
  );
  return NextResponse.json({ hits });
}
