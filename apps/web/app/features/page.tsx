import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { ModesIntro } from "@/components/marketing/modes-intro";
import { CollaborationSection } from "@/components/marketing/collaboration-section";

export const metadata: Metadata = {
  title: "Screen recorder features",
  description:
    "Record a tab, window or your whole screen with camera and mic, take annotated screenshots, and share each capture as a link your team can comment on.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <MarketingPage>
      <ModesIntro headingLevel={1} />
      <CollaborationSection />
    </MarketingPage>
  );
}
