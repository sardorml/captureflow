import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { FaqSection } from "@/components/marketing/faq-section";
import { JsonLd } from "@/components/marketing/json-ld";
import { FAQ_SCHEMA } from "@/lib/marketing/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about CaptureFlow — how instant share links work, what self-hosting on Cloudflare involves, storage limits, and how recordings stay private.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <MarketingPage>
      <JsonLd data={FAQ_SCHEMA} />
      <FaqSection />
    </MarketingPage>
  );
}
