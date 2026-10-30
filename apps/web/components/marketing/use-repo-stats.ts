"use client";

import { useEffect, useState } from "react";
import type { RepoStats } from "@/lib/github";

const NO_STATS: RepoStats = { stars: null, activity: null };

// One request per page load, shared by the nav and the activity section.
let pending: Promise<RepoStats> | null = null;

function loadRepoStats(): Promise<RepoStats> {
  pending ??= fetch("/api/github")
    .then((res) => (res.ok ? (res.json() as Promise<RepoStats>) : NO_STATS))
    .catch(() => NO_STATS);
  return pending;
}

export function useRepoStats(): RepoStats {
  const [stats, setStats] = useState(NO_STATS);
  useEffect(() => {
    let live = true;
    void loadRepoStats().then((next) => live && setStats(next));
    return () => {
      live = false;
    };
  }, []);
  return stats;
}
