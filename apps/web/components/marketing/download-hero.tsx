"use client";

import { Flex } from "./layout";
import { Paragraph, Title } from "./typography";
import { CHROME_WEBSTORE_URL } from "@/lib/marketing/constants";
import { TwoTone } from "./frame";
import { InstallButton } from "./install-button";
import { AppleLogo, ChromeLogoColor } from "./platform-logos";
import { useMessages } from "./i18n-provider";

// The landing hero's copy treatment, with the install button as the one thing
// to do on this page.
export function DownloadHero() {
  const m = useMessages();

  return (
    <section className="relative overflow-hidden">
      <Flex
        vertical
        align="center"
        className="relative"
        style={{
          maxWidth: 1280,
          marginInline: "auto",
          paddingInline: 24,
          paddingTop: 96,
          paddingBottom: 72,
          textAlign: "center",
        }}
      >
        <Title
          align="center"
          level={1}
          className="text-balance text-fg-strong"
          style={{
            fontSize: "2.25rem",
            fontWeight: 600,
            lineHeight: 1.11,
            letterSpacing: "-0.05em",
            marginBottom: 16,
          }}
        >
          {m.download.heading}
        </Title>
        <Paragraph
          align="center"
          className="text-lg leading-7 text-balance sm:[&>span]:block"
          style={{ maxWidth: 720 }}
        >
          <TwoTone text={m.download.subtitle} />
        </Paragraph>

        <Flex vertical gap={16} align="center" style={{ marginTop: 32 }}>
          <InstallButton
            href={CHROME_WEBSTORE_URL ?? "#"}
            label={m.hero.installChrome}
            icon={<ChromeLogoColor className="size-7" />}
            location="download_chrome"
            primary
          />
          <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
            <AppleLogo className="size-3.5" />
            {m.hero.macSoon}
          </span>
        </Flex>
      </Flex>
    </section>
  );
}
