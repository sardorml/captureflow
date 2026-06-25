import "./marketing.css";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadSession } from "@/lib/session-guard";
import { getStarCount, formatStars } from "@/lib/github";
import { Nav } from "@/components/marketing/nav";
import { HeroSection } from "@/components/marketing/hero-section";
import { ModesIntro } from "@/components/marketing/modes-intro";
import { CollaborationSection } from "@/components/marketing/collaboration-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ComparePlansSection } from "@/components/marketing/compare-plans-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { RoadmapSection } from "@/components/marketing/roadmap-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { FloatingCta } from "@/components/marketing/floating-cta";
import { Footer } from "@/components/marketing/footer";
import { I18nProvider } from "@/components/marketing/i18n-provider";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  APP_SCHEMA,
  FAQ_SCHEMA,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
  SITE_TITLE,
  SITE_DESCRIPTION,
} from "@/lib/marketing/constants";

export const dynamic = "force-dynamic";

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
      { url: "/og-image.png", width: 1200, height: 630, alt: SITE_TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default async function RootPage() {
  const session = await loadSession();
  if (session) redirect("/recordings");

  const starCount = await getStarCount();
  const stars = starCount != null ? formatStars(starCount) : null;

  return (
    <I18nProvider>
      <MarketingShell>
        <div className="relative flex min-h-screen flex-col font-system">
          <JsonLd
            data={[WEBSITE_SCHEMA, ORGANIZATION_SCHEMA, APP_SCHEMA, FAQ_SCHEMA]}
          />
          <Nav stars={stars} />
          {/* Nav is position: fixed; offset by --header-height (set in nav.tsx). */}
          <main style={{ paddingTop: "var(--header-height, 68px)" }}>
            <HeroSection stars={stars} />
            <ModesIntro />
            <CollaborationSection />
            <PricingSection />
            <ComparePlansSection />
            <FaqSection />
            <RoadmapSection />
            <CtaSection />
          </main>
          <Footer />
          <FloatingCta />
        </div>
      </MarketingShell>
    </I18nProvider>
  );
}
