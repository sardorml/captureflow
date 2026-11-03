import type { Metadata } from "next";
import { Nav } from "@/components/marketing/nav";
import { HeroSection } from "@/components/marketing/hero-section";
import { HighlightsSection } from "@/components/marketing/highlights-section";
import { UseCasesSection } from "@/components/marketing/use-cases-section";
import { ModesIntro } from "@/components/marketing/modes-intro";
import { AgentsSection } from "@/components/marketing/agents-section";
import { CollaborationSection } from "@/components/marketing/collaboration-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { LiveRepoActivity } from "@/components/marketing/live-repo-activity";
import { CtaSection } from "@/components/marketing/cta-section";
import { Footer } from "@/components/marketing/footer";
import { I18nProvider } from "@/components/marketing/i18n-provider";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { JsonLd } from "@/components/marketing/json-ld";
import { BottomBar } from "@/components/marketing/announcement-bars";
import { Frame } from "@/components/marketing/frame";
import { marketingFont } from "@/components/marketing/marketing-font";
import {
  APP_SCHEMA,
  FAQ_SCHEMA,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
  SITE_TITLE,
  SITE_DESCRIPTION,
} from "@/lib/marketing/constants";
import { X_CREATOR } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "CaptureFlow",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      { url: "/og-image.png?v=3", width: 1200, height: 630, alt: SITE_TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png?v=3"],
    creator: X_CREATOR,
  },
};

export default function RootPage() {
  return (
    <I18nProvider>
      <MarketingShell className={marketingFont.className}>
        <JsonLd
          data={[WEBSITE_SCHEMA, ORGANIZATION_SCHEMA, APP_SCHEMA, FAQ_SCHEMA]}
        />
        <Nav />
        <main>
          <Frame>
            <HeroSection />
            <ModesIntro />
            <AgentsSection />
            <CollaborationSection />
            <HighlightsSection />
            <UseCasesSection />
            <PricingSection />
            <FaqSection />
            <LiveRepoActivity />
            <CtaSection />
          </Frame>
        </main>
        <Footer />
        <BottomBar />
      </MarketingShell>
    </I18nProvider>
  );
}
