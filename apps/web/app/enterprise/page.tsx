import type { Metadata } from "next";
import { EnterpriseSection } from "@/components/marketing/enterprise-section";
import { MarketingPage } from "@/components/marketing/marketing-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enterprise",
  description:
    "Managed CaptureFlow for larger teams: more than 1 TB of storage, one price for the whole company, no per-seat fees. Tell us what you need.",
  alternates: { canonical: "/enterprise" },
};

export default function EnterprisePage() {
  return (
    <MarketingPage>
      <EnterpriseSection />
    </MarketingPage>
  );
}
