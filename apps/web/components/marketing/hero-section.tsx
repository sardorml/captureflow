"use client";

import type { MouseEvent } from "react";
import { Flex } from "./layout";
import { Paragraph, Title } from "./typography";
import { CHROME_WEBSTORE_URL, CURRENT_STAGE } from "@/lib/marketing/constants";
import { MARKETING_SITE_URL } from "@/lib/site";
import { WaitlistForm } from "./waitlist-form";
import { AppleLogo, ChromeLogoColor } from "./platform-logos";
import { InstallButton } from "./install-button";
import { RecorderMockup } from "./recorder-mockup";
import { GRAIN, SkyBackdrop } from "./sky-backdrop";
import { useLocalizedHref, useMessages } from "./i18n-provider";

// Clicking the copy selects it for copying, so the highlight is part of the
// design: a cloud-white wash that keeps the ink, not the browser's blue.
const COPY_SELECTION =
  "selection:bg-white/70 selection:text-fg-strong dark:selection:bg-white/20 dark:selection:text-fg-strong";

export function HeroSection() {
  const m = useMessages();
  const lh = useLocalizedHref();

  return (
    <section
      id="hero"
      className="relative isolate -mt-[66px] overflow-hidden pt-[66px]"
    >
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
          paddingBottom: 40,
          textAlign: "center",
        }}
      >
        <div onClick={selectAndCopyWithLink} className={COPY_SELECTION}>
          <Title
            align="center"
            level={1}
            className="text-balance text-fg-strong lg:whitespace-nowrap"
            style={{
              fontSize: "clamp(2.5rem, 1.5rem + 3.2vw, 4rem)",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 20,
            }}
          >
            {m.hero.title}
          </Title>
        </div>
        <div onClick={selectAndCopyWithLink} className={COPY_SELECTION}>
          <Paragraph
            align="center"
            style={{
              fontSize: 22,
              fontWeight: 300,
              lineHeight: 1.5,
              maxWidth: 760,
            }}
          >
            {m.hero.subtitleLine1}{" "}
            {/* Forced break desktop-only; on phones it would orphan words. */}
            <br className="hidden sm:inline" />
            {m.hero.subtitleLine2}
          </Paragraph>
        </div>

        {CURRENT_STAGE.showHeroBuyCta ? (
          <Flex vertical gap={16} align="center" style={{ marginTop: 36 }}>
            <InstallButton
              href={CHROME_WEBSTORE_URL ?? lh("/download")}
              label={m.hero.installChrome}
              icon={<ChromeLogoColor className="size-9" />}
              location="hero_chrome"
            />
            <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
              <AppleLogo className="size-3.5" />
              {m.hero.macSoon}
            </span>
          </Flex>
        ) : (
          <div style={{ marginTop: 36 }}>
            <WaitlistForm />
          </div>
        )}
        {/* The same sand over the copy, as light specks so it shows on the
            dark ink too. Spans the section's full width (clipped by its
            overflow) and fades out before the mockup, which is a screen, not
            sky, so there is no edge where it stops. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[66px] -right-[100vw] bottom-0 -left-[100vw] opacity-[0.22] invert [mask-image:linear-gradient(to_bottom,black_75%,transparent)] dark:opacity-[0.1] dark:invert-0"
          style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
        />
      </Flex>

      <RecorderMockup />
    </section>
  );
}

function selectAndCopyWithLink(event: MouseEvent<HTMLElement>) {
  const range = document.createRange();
  range.selectNodeContents(event.currentTarget);
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
  const text = `${selection.toString().trim()}\n\n${MARKETING_SITE_URL}`;
  void navigator.clipboard.writeText(text).catch(() => {});
}
