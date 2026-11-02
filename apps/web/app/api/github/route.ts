import { after, NextResponse } from "next/server";
import { getAppWebEnv } from "@/lib/cf-env";
import { loadRepoStats, type RepoStats } from "@/lib/github";

// In the Worker, worker.ts answers this path first; this serves next dev and Docker.
export async function GET() {
  const env = await getAppWebEnv();
  const stats: RepoStats = env?.BUCKET
    ? await loadRepoStats(env.BUCKET, env.GITHUB_TOKEN, (work) => after(work))
    : { stars: null, activity: null };
  return NextResponse.json(stats, {
    headers: { "cache-control": "public, max-age=60" },
  });
}
