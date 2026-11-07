import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, Package, Terminal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ENGLISH, type I18n } from "@/lib/i18n/english";
import { fill } from "@/lib/i18n/fill";
import {
  APP_SCHEMA,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
  faqSchema,
} from "@/lib/marketing/constants";
import { CHROME_WEBSTORE_URL } from "@/lib/marketing/constants";
import { localizedHref } from "@/lib/i18n/config";
import { DOCS_URL, RELEASES_URL } from "@/lib/site";
import { AgentsSection } from "./agents-section";
import { BottomBar } from "./announcement-bars";
import { CollaborationSection } from "./collaboration-section";
import { CtaSection } from "./cta-section";
import { DownloadHero } from "./download-hero";
import { EnterpriseSection } from "./enterprise-section";
import { FaqSection } from "./faq-section";
import { Footer } from "./footer";
import { Frame, PillLink } from "./frame";
import { HeroSection } from "./hero-section";
import { HighlightsSection } from "./highlights-section";
import { InstallButton } from "./install-button";
import { I18nProvider } from "./i18n-provider";
import { JsonLd } from "./json-ld";
import { LiveRepoActivity } from "./live-repo-activity";
import { marketingFont } from "./marketing-font";
import { MarketingPage } from "./marketing-page";
import { MarketingShell } from "./marketing-shell";
import { McpFeaturesSection } from "./mcp-features-section";
import { ModesIntro } from "./modes-intro";
import { Nav } from "./nav";
import { PageHero } from "./page-hero";
import { PricingSection } from "./pricing-section";
import { SetupRequestSection } from "./setup-request-section";
import { SwarmDemoSection } from "./swarm-demo-section";
import { ChromeLogoColor } from "./platform-logos";
import { Paragraph, Title } from "./typography";
import { UseCasesSection } from "./use-cases-section";

/*
 * Each public page once, rendered by its English route and by the same route
 * under app/[locale]. English passes no `i18n` and reads the bundled catalog.
 */
type PageProps = { i18n?: I18n };

export function HomePage({ i18n }: PageProps) {
  const { messages } = i18n ?? ENGLISH;
  return (
    <I18nProvider i18n={i18n}>
      <MarketingShell className={marketingFont.className}>
        <JsonLd
          data={[
            WEBSITE_SCHEMA,
            ORGANIZATION_SCHEMA,
            APP_SCHEMA,
            faqSchema(messages),
          ]}
        />
        <Nav />
        <main>
          <Frame>
            <HeroSection />
            <ModesIntro />
            <AgentsSection />
            <CollaborationSection />
            <HighlightsSection />
            <McpFeaturesSection />
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

export function FeaturesPage({ i18n }: PageProps) {
  return (
    <MarketingPage i18n={i18n}>
      <PageHero page="features" />
      <ModesIntro />
      <CollaborationSection />
    </MarketingPage>
  );
}

export function PricingPage({ i18n }: PageProps) {
  return (
    <MarketingPage i18n={i18n}>
      <PageHero page="pricing" />
      <PricingSection hideHeading showTable />
    </MarketingPage>
  );
}

export function FaqPage({ i18n }: PageProps) {
  const { messages } = i18n ?? ENGLISH;
  return (
    <MarketingPage i18n={i18n}>
      <JsonLd data={faqSchema(messages)} />
      <PageHero
        page="faq"
        action={<PillLink href={DOCS_URL}>{messages.faq.cta}</PillLink>}
      />
      <FaqSection hideHeading />
    </MarketingPage>
  );
}

export function DownloadPage({ i18n }: PageProps) {
  const copy = (i18n ?? ENGLISH).messages.downloadPage;
  const other = [
    {
      icon: Terminal,
      title: copy.buildTitle,
      body: copy.buildBody,
      href: `${DOCS_URL}/developer/build`,
    },
    {
      icon: Package,
      title: copy.releasesTitle,
      body: copy.releasesBody,
      href: RELEASES_URL,
    },
  ];
  return (
    <MarketingPage i18n={i18n}>
      <DownloadHero />

      <section className="mx-auto w-full max-w-[960px] px-6 pt-10 pb-24">
        <Title level={4} style={{ textAlign: "center" }}>
          {copy.otherWays}
        </Title>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {other.map(({ icon: Icon, title, body, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="block h-full"
            >
              <Card className="h-full gap-0 p-5 transition-colors hover:bg-tint">
                <div className="flex items-start justify-between text-fg-muted">
                  <Icon size={22} />
                  <ArrowUpRight size={16} />
                </div>
                <Title level={5} style={{ marginTop: 16, marginBottom: 4 }}>
                  {title}
                </Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  {body}
                </Paragraph>
              </Card>
            </a>
          ))}
        </div>

        <Paragraph
          type="secondary"
          style={{ textAlign: "center", marginTop: 40 }}
        >
          {fill(copy.cloud, {
            link: <Link href="/login?mode=signup">{copy.cloudLink}</Link>,
          })}
        </Paragraph>
      </section>
    </MarketingPage>
  );
}

export function EnterprisePage({ i18n }: PageProps) {
  return (
    <MarketingPage i18n={i18n}>
      <EnterpriseSection />
    </MarketingPage>
  );
}

export function SelfHostSetupPage({ i18n }: PageProps) {
  return (
    <MarketingPage i18n={i18n}>
      <SetupRequestSection />
    </MarketingPage>
  );
}

export function SwarmDemoPage({ i18n }: PageProps) {
  return (
    <MarketingPage i18n={i18n}>
      <Suspense>
        <SwarmDemoSection />
      </Suspense>
    </MarketingPage>
  );
}

export function ChromeExtensionPage({ i18n }: PageProps) {
  const { messages, locale } = i18n ?? ENGLISH;
  return (
    <MarketingPage i18n={i18n}>
      <PageHero
        page="chromeExtension"
        action={
          <InstallButton
            href={CHROME_WEBSTORE_URL ?? localizedHref("/download", locale)}
            label={messages.hero.installChrome}
            icon={<ChromeLogoColor className="size-6" />}
            location="chrome_extension_page"
            primary
          />
        }
      />
      <ModesIntro />
      <HighlightsSection />
      <CollaborationSection />
    </MarketingPage>
  );
}
