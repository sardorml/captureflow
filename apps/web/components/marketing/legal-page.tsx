"use client";

import { SUPPORT_EMAIL } from "@/lib/marketing/constants";
import { BottomBar } from "./announcement-bars";
import { Footer } from "./footer";
import { Frame } from "./frame";
import { I18nProvider } from "./i18n-provider";
import { Flex } from "./layout";
import { marketingFont } from "./marketing-font";
import { MarketingShell } from "./marketing-shell";
import { Nav } from "./nav";
import { PageHeroFrame } from "./page-hero";
import { Paragraph, Text, Title } from "./typography";

export type LegalSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

// These pages are English only, so the provider follows the visitor's choice.
export function LegalPage({
  title,
  lastUpdated,
  sections,
  contact,
}: {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
  contact: string;
}) {
  return (
    <I18nProvider>
      <MarketingShell className={marketingFont.className}>
        <Nav />
        <main className="animate-page-rise">
          <Frame>
            <PageHeroFrame
              label={title}
              word={title.toUpperCase()}
              title={title}
              subtitle={`Last updated ${lastUpdated}`}
            />
            <div className="mx-auto max-w-[760px] px-6 pb-24">
              <Flex vertical gap={36}>
                {sections.map((section) => (
                  <Flex key={section.heading} vertical gap={12}>
                    <Title level={2}>{section.heading}</Title>
                    {section.body.map((paragraph) => (
                      <Paragraph key={paragraph}>{paragraph}</Paragraph>
                    ))}
                    {section.bullets ? (
                      <ul className="m-0 grid list-disc gap-2.5 pl-[22px]">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>
                            <Text type="secondary">{bullet}</Text>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Flex>
                ))}

                <Flex vertical gap={12}>
                  <Title level={2}>Contact</Title>
                  <Paragraph>
                    {contact} {SUPPORT_EMAIL}.
                  </Paragraph>
                </Flex>
              </Flex>
            </div>
          </Frame>
        </main>
        <Footer />
        <BottomBar />
      </MarketingShell>
    </I18nProvider>
  );
}
