// Public pricing page at /plan, outside the auth gate (see middleware.ts).
// Reuses the landing's PricingSection / ComparePlansSection / FaqSection so the
// numbers stay in lockstep. Heading text is read straight from MESSAGES because
// this is a Server Component and can't use the useMessages hook.
import '../marketing.css';
import type { Metadata } from 'next';
import { I18nProvider } from '@/components/marketing/i18n-provider';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { getStarCount, formatStars } from '@/lib/github';
import { Nav } from '@/components/marketing/nav';
import { PricingSection } from '@/components/marketing/pricing-section';
import { ComparePlansSection } from '@/components/marketing/compare-plans-section';
import { FaqSection } from '@/components/marketing/faq-section';
import { Footer } from '@/components/marketing/footer';
import { MESSAGES } from '@/lib/marketing/messages';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Self-host CaptureFlow free on your own Cloudflare account, or let us host it for you with the managed plan — Snaps and cloud workspaces included.',
  alternates: { canonical: '/plan' },
};

export default async function PlanPage() {
  const m = MESSAGES.plan;
  const starCount = await getStarCount();
  const stars = starCount != null ? formatStars(starCount) : null;

  return (
    <I18nProvider>
      <MarketingShell>
        <div className="relative flex min-h-screen flex-col font-system">
          <Nav stars={stars} />
          {/* Nav is position: fixed; offset content by its measured
              --header-height (set in nav.tsx). */}
          <main style={{ paddingTop: 'var(--header-height, 68px)' }}>
            <div className="px-10 pt-12 text-center sm:pt-16">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                {m.heading}
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {m.subtitle}
              </p>
            </div>

            <PricingSection hideHeading />
            <ComparePlansSection />
            <FaqSection />
          </main>
          <Footer />
        </div>
      </MarketingShell>
    </I18nProvider>
  );
}
