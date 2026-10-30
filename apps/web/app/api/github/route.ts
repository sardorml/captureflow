import { NextResponse } from "next/server";
import { formatStars, getRepoActivity, getStarCount } from "@/lib/github";
import type { RepoStats } from "@/lib/github";

export async function GET() {
  const [starCount, activity] = await Promise.all([
    getStarCount(),
    getRepoActivity(),
  ]);
  const stats: RepoStats = {
    stars: starCount != null ? formatStars(starCount) : null,
    activity,
  };
  return NextResponse.json(stats, {
    headers: { "cache-control": "public, max-age=300" },
  });
}
