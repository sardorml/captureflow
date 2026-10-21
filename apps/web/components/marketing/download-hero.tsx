"use client";

import { Flex } from "./layout";
import { Paragraph, Title } from "./typography";
import { CHROME_WEBSTORE_URL } from "@/lib/marketing/constants";
import { InstallButton } from "./install-button";
import { AppleLogo, ChromeLogoColor } from "./platform-logos";
import { GRAIN, SkyBackdrop } from "./sky-backdrop";
import { useMessages } from "./i18n-provider";

// The landing hero's sky and copy treatment, with the install button as the
// one thing to do on this page.
export function DownloadHero() {
  const m = useMessages();

  return (
    <section className="relative isolate -mt-[66px] overflow-hidden pt-[66px]">
      <SkyBackdrop />
      <Flex
        vertical
        align="center"
        className="relative"
        style={{
          maxWidth: 1280,
          marginInline: "auto",
          paddingInline: 24,
          paddingTop: 100,
          paddingBottom: 88,
          textAlign: "center",
        }}
      >
        <Title
          align="center"
          level={1}
          className="text-balance text-fg-strong"
          style={{
            fontSize: "clamp(2.5rem, 1.5rem + 3.2vw, 4rem)",
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}
        >
          {m.download.heading}
        </Title>
        <Paragraph
          align="center"
          className="text-balance"
          style={{
            fontSize: 22,
            fontWeight: 300,
            lineHeight: 1.5,
            maxWidth: 760,
          }}
        >
          {m.download.subtitle}
        </Paragraph>

        <Flex vertical gap={16} align="center" style={{ marginTop: 36 }}>
          <InstallButton
            href={CHROME_WEBSTORE_URL ?? "#"}
            label={m.hero.installChrome}
            icon={<ChromeLogoColor className="size-9" />}
            location="download_chrome"
          />
          <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
            <AppleLogo className="size-3.5" />
            {m.hero.macSoon}
          </span>
        </Flex>

        <div
          aria-hidden
          className="pointer-events-none absolute -top-[66px] -right-[100vw] bottom-0 -left-[100vw] opacity-[0.22] invert [mask-image:linear-gradient(to_bottom,black_75%,transparent)] dark:opacity-[0.1] dark:invert-0"
          style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
        />
      </Flex>
    </section>
  );
}
