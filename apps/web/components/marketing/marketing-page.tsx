import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isSelfHosted } from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { getStarCount, formatStars } from "@/lib/github";
import { I18nProvider } from "./i18n-provider";
import { MarketingShell } from "./marketing-shell";
import { Nav } from "./nav";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

export async function MarketingPage({ children }: { children: ReactNode }) {
  if (isSelfHosted(await getAppWebEnv())) redirect("/login");
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
