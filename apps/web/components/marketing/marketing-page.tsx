import type { ReactNode } from "react";
import { I18nProvider } from "./i18n-provider";
import { MarketingShell } from "./marketing-shell";
import { Nav } from "./nav";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

export function MarketingPage({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <MarketingShell>
        <Nav />
        <main className="animate-page-rise">
          {children}
          <CtaSection />
        </main>
        <Footer />
      </MarketingShell>
    </I18nProvider>
  );
}
