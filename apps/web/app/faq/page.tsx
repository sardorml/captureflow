import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { FaqSection } from "@/components/marketing/faq-section";
import { PillLink } from "@/components/marketing/frame";
import { PageHero } from "@/components/marketing/page-hero";
import { JsonLd } from "@/components/marketing/json-ld";
import { FAQ_SCHEMA } from "@/lib/marketing/constants";
import { MESSAGES } from "@/lib/marketing/messages";
import { DOCS_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ: sharing, storage and self-hosting",
  description:
    "Common questions about CaptureFlow: how share links work, what self-hosting on Cloudflare involves, storage limits, and how recordings stay private.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <MarketingPage>
      <JsonLd data={FAQ_SCHEMA} />
      <PageHero
        page="faq"
        action={<PillLink href={DOCS_URL}>{MESSAGES.faq.cta}</PillLink>}
      />
      <FaqSection hideHeading />
    </MarketingPage>
  );
}
