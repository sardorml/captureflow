"use client";

import Image from "next/image";
import { Flex } from "./layout";
import { Paragraph, Title } from "./typography";
import { CHROME_WEBSTORE_URL } from "@/lib/marketing/constants";
import { splitLead } from "@/lib/marketing/split-lead";
import { InstallButton } from "./install-button";
import { AppleLogo, ChromeLogoColor } from "./platform-logos";
import { useMessages } from "./i18n-provider";

// The landing hero's copy treatment, with the install button as the one thing
// to do on this page.
export function DownloadHero() {
  const m = useMessages();
  const { lead, rest } = splitLead(m.download.subtitle);

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
          paddingTop: 72,
          paddingBottom: 72,
          textAlign: "center",
        }}
      >
        <Image
          src="/logo.png"
          alt=""
          width={104}
          height={104}
          unoptimized
          priority
          className="mb-8 rounded-[24px]"
        />
        <Title
          align="center"
          level={1}
          className="text-[clamp(2.25rem,1.5rem+3vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.05em] text-balance text-fg-strong"
          style={{ marginBottom: 24 }}
        >
          {m.download.heading}
        </Title>
        <Paragraph
          align="center"
          className="text-xl leading-8 text-balance text-fg-muted"
          style={{ maxWidth: 720 }}
        >
          <span className="sm:block">{lead}</span> {rest}
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
