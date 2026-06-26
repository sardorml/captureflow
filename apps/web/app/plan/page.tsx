import type { Metadata } from "next";
import { headers } from "next/headers";
import { readThemeFromCookieHeader } from "@captureflow/ui";
import { getStarCount, formatStars } from "@/lib/github";
import { I18nProvider } from "@/components/marketing/i18n-provider";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Nav } from "@/components/marketing/nav";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ComparePlansSection } from "@/components/marketing/compare-plans-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Self-host CaptureFlow free on your own Cloudflare account, or let us host it for you with the managed plan — Screenshots and cloud workspaces included.",
  alternates: { canonical: "/plan" },
};

export default async function PlanPage() {
  const theme = readThemeFromCookieHeader((await headers()).get("cookie"));
  const starCount = await getStarCount();
  const stars = starCount != null ? formatStars(starCount) : null;

  return (
    <I18nProvider>
      <MarketingShell>
        <Nav stars={stars} theme={theme} />
        <main>
          <PricingSection />
          <ComparePlansSection />
          <FaqSection />
        </main>
        <Footer />
      </MarketingShell>
    </I18nProvider>
  );
}
