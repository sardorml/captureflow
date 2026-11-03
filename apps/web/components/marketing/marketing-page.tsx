import type { ReactNode } from "react";
import { I18nProvider } from "./i18n-provider";
import { MarketingShell } from "./marketing-shell";
import { BottomBar } from "./announcement-bars";
import { Nav } from "./nav";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";
import { Frame } from "./frame";
import { marketingFont } from "./marketing-font";

export function MarketingPage({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <MarketingShell className={marketingFont.className}>
        <Nav />
        <main className="animate-page-rise">
          <Frame>
            {children}
            <CtaSection />
          </Frame>
        </main>
        <Footer />
        <BottomBar />
      </MarketingShell>
    </I18nProvider>
  );
}
