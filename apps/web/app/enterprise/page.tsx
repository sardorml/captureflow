import type { Metadata } from "next";
import { EnterpriseSection } from "@/components/marketing/enterprise-section";
import { MarketingPage } from "@/components/marketing/marketing-page";

export const metadata: Metadata = {
  title: "Enterprise",
  description:
    "Managed CaptureFlow for larger companies: seats for everyone, custom terms and a single invoice. Tell us what you need.",
  alternates: { canonical: "/enterprise" },
};

export default function EnterprisePage() {
  return (
    <MarketingPage>
      <EnterpriseSection />
    </MarketingPage>
  );
}
