import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CompareSection } from "@/components/marketing/compare-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing: flat team plans, no per-seat fees",
  description:
    "Start free, then pay a flat monthly price for storage, not per person. Or self-host CaptureFlow free on Cloudflare. No recording length limit.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <MarketingPage>
      <PricingSection headingLevel={1} />
      <CompareSection />
    </MarketingPage>
  );
}
