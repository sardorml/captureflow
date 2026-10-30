"use client";

import { RepoActivitySection } from "./repo-activity-section";
import { useRepoStats } from "./use-repo-stats";

export function LiveRepoActivity() {
  return <RepoActivitySection activity={useRepoStats().activity} />;
}
