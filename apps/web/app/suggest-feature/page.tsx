import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { LiveRepoActivity } from "@/components/marketing/live-repo-activity";
import { SuggestFeatureClient } from "./suggest-feature-client";

export const metadata: Metadata = {
  title: "Suggest a feature",
  description:
    "Suggest a feature for CaptureFlow. Submit feature requests and help shape the open-source macOS screen recorder’s roadmap.",
  alternates: { canonical: "/suggest-feature" },
};

export default function SuggestFeaturePage() {
  return (
    <MarketingPage>
      <SuggestFeatureClient />
      <LiveRepoActivity />
    </MarketingPage>
  );
}
