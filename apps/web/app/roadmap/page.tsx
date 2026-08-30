import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { RoadmapSection } from "@/components/marketing/roadmap-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "What is shipping next in CaptureFlow — the macOS app, Windows support, a Firefox extension, transcripts, and everything else on the backlog.",
  alternates: { canonical: "/roadmap" },
};

export default function RoadmapPage() {
  return (
    <MarketingPage>
      <RoadmapSection />
    </MarketingPage>
  );
}
