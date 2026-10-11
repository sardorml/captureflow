import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { LoomComparison } from "@/components/marketing/loom-comparison";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "CaptureFlow vs Loom: an open-source Loom alternative" },
  description:
    "Compare CaptureFlow and Loom on price and features. Loom charges per person; CaptureFlow charges a flat price for storage and is free to self-host.",
  alternates: { canonical: "/alternatives/loom" },
};

export default function LoomAlternativePage() {
  return (
    <MarketingPage>
      <LoomComparison />
    </MarketingPage>
  );
}
