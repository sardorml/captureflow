"use client";

import { useLang, useMessages } from "./i18n-provider";
import { RepoActivitySection } from "./repo-activity-section";
import { useRepoStats } from "./use-repo-stats";

export function LiveRepoActivity() {
  return (
    <RepoActivitySection
      activity={useRepoStats().activity}
      copy={useMessages().activity}
      lang={useLang()}
    />
  );
}
