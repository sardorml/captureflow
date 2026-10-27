import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { SEAT_PLAN } from "@captureflow/quota";
import { PricingSection } from "@/components/marketing/pricing-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing: free to start, one price per member",
  description: `Start free with 25 recordings. ${SEAT_PLAN.name} is one price per member with unlimited recordings, and viewers are always free. Or self-host CaptureFlow free on Cloudflare.`,
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <MarketingPage>
      <PricingSection headingLevel={1} showTable />
    </MarketingPage>
  );
}
