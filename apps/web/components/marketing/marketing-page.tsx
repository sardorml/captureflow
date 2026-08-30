import type { ReactNode } from "react";
import { getStarCount, formatStars } from "@/lib/github";
import { I18nProvider } from "./i18n-provider";
import { MarketingShell } from "./marketing-shell";
import { Nav } from "./nav";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

export async function MarketingPage({ children }: { children: ReactNode }) {
  const starCount = await getStarCount();
  const stars = starCount != null ? formatStars(starCount) : null;

  return (
    <I18nProvider>
      <MarketingShell>
        <Nav stars={stars} />
        <main>
          {children}
          <CtaSection />
        </main>
        <Footer />
      </MarketingShell>
    </I18nProvider>
  );
}
