import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { PricingSection } from "@/components/marketing/pricing-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Self-host CaptureFlow free on your own Cloudflare account, or let us run it for you. Storage is the only ceiling — no per-seat pricing and no recording length limit.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <MarketingPage>
      <PricingSection />
    </MarketingPage>
  );
}
