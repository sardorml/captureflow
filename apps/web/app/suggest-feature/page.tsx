import type { Metadata } from "next";
import { getRepoActivity } from "@/lib/github";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { RepoActivitySection } from "@/components/marketing/repo-activity-section";
import { SuggestFeatureClient } from "./suggest-feature-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suggest a feature",
  description:
    "Suggest a feature for CaptureFlow. Submit feature requests and help shape the open-source macOS screen recorder’s roadmap.",
  alternates: { canonical: "/suggest-feature" },
};

export default async function SuggestFeaturePage() {
  const activity = await getRepoActivity();
  return (
    <MarketingPage>
      <SuggestFeatureClient />
      <RepoActivitySection activity={activity} />
    </MarketingPage>
  );
}
