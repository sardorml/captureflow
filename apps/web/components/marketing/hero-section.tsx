"use client";

import type { ReactNode } from "react";
import { Flex } from "./layout";
import { Paragraph, Title } from "./typography";
import { buttonVariants } from "@heroui/react";
import {
  CHROME_WEBSTORE_URL,
  CURRENT_STAGE,
  DOWNLOAD_URL,
} from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { WaitlistForm } from "./waitlist-form";
import { AppleLogo, ChromeLogo, FirefoxLogo } from "./platform-logos";
import { RecorderMockup } from "./recorder-mockup";
import { MARKETING_MAX_WIDTH } from "./_shared";
import NextLink from "next/link";
import { useLocalizedHref, useMessages } from "./i18n-provider";

export function HeroSection() {
  const m = useMessages();
  const lh = useLocalizedHref();

  return (
    <section id="hero" style={{ position: "relative", overflow: "hidden" }}>
      <Flex
        vertical
        align="center"
        style={{
          maxWidth: MARKETING_MAX_WIDTH,
          marginInline: "auto",
          paddingInline: 24,
          paddingTop: 100,
          paddingBottom: 56,
          textAlign: "center",
        }}
      >
        {/* Two-tone headline: the payoff line drops to the muted foreground so
            the pair reads as one sentence trailing off. */}
        <Title
          align="center"
          level={1}
          style={{
            fontSize: "clamp(2.5rem, 1.5rem + 3.2vw, 4rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}
        >
          {m.hero.titlePrefix} {m.hero.titleMain}
          <br />
          <span className="text-fg-muted">{m.hero.titleSuffix}</span>
        </Title>
        <Paragraph
          align="center"
          type="secondary"
          style={{
            fontSize: 20,
            lineHeight: 1.55,
            maxWidth: 620,
          }}
        >
          {m.hero.subtitleLine1} {m.hero.subtitleLine2}
        </Paragraph>

        {CURRENT_STAGE.showHeroBuyCta ? (
          /* 24, the same as the sign-up line takes below, so the buttons sit
             centred in their own space instead of hugging the subtitle. */
          <Flex
            wrap
            gap={20}
            justify="center"
            align="center"
            style={{ marginTop: 24 }}
          >
            <InstallButton
              href={DOWNLOAD_URL}
              label={m.hero.installMac}
              icon={<AppleLogo className="size-[17px]" />}
              location="hero_macos"
              primary
            />
            <span className="text-fg-muted text-sm">{m.hero.installOr}</span>
            <InstallButton
              href={CHROME_WEBSTORE_URL ?? lh("/download")}
              label={m.hero.installChrome}
              icon={<ChromeLogo className="size-[18px]" />}
              location="hero_chrome"
            />
          </Flex>
        ) : (
          <div style={{ marginTop: 24 }}>
            <WaitlistForm />
          </div>
        )}

        {CURRENT_STAGE.showHeroBuyCta ? (
          /* Tighter than the 24 above the buttons: this line is their caption,
             so it belongs to them rather than sitting between equals. */
          <Flex vertical align="center" gap={14} style={{ marginTop: 16 }}>
            <span className="text-sm text-fg-muted">
              <NextLink
                href={`${lh("/login")}?mode=signup`}
                /* Muted and unadorned at rest: at full foreground with a
                   standing underline it out-shouted the install buttons. */
                className="underline-offset-4 transition-colors hover:text-fg hover:underline motion-reduce:transition-none"
                onClick={() =>
                  track("marketing_cta_clicked", { location: "hero_signup" })
                }
              >
                {m.hero.installSignup}
              </NextLink>{" "}
              — {m.hero.installNote}
            </span>
            {/* Icons only — availability per platform is qualified on the
                download page, which the link below leads to. */}
            <div aria-hidden className="flex items-center gap-4 text-fg-subtle">
              <AppleLogo className="size-5" />
              <ChromeLogo className="size-5" />
              <FirefoxLogo className="size-5" />
            </div>
            <NextLink
              href={lh("/download")}
              className="text-sm text-fg-muted underline underline-offset-4 transition-colors hover:text-fg motion-reduce:transition-none"
            >
              {m.hero.moreDownloads}
            </NextLink>
          </Flex>
        ) : null}
      </Flex>

      <RecorderMockup />
    </section>
  );
}

/*
 * One install target. `href` may be an external store listing or an internal
 * route (Chrome falls back to /download until CHROME_WEBSTORE_URL is set), so
 * the new-tab treatment keys off the protocol rather than being hardcoded.
 */
function InstallButton({
  href,
  label,
  icon,
  location,
  primary,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  location: string;
  primary?: boolean;
}) {
  /* The alternative install is a white pill, not a grey one: HeroUI's greys
     recede into the dark page next to the blue primary. Setting .button's own
     colour vars rather than bg and text utilities, so hover and pressed follow
     from the same place instead of needing their own variants. */
  /* Explicit height: HeroUI's lg is 44px and drops to 40 at md, which reads
     undersized under a headline this large. */
  const base = "h-12 gap-2 rounded-full px-6 text-[15px] font-medium";
  const className = buttonVariants({
    variant: primary ? "primary" : "tertiary",
    size: "lg",
    className: primary
      ? base
      : `${base} [--button-bg:var(--cf-inverse)] [--button-fg:var(--cf-on-inverse)] [--button-bg-hover:#e5e5e5] [--button-bg-pressed:#d4d4d4]`,
  });
  const onClick = () => track("marketing_cta_clicked", { location });

  if (/^https?:/.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {icon}
        {label}
      </a>
    );
  }

  return (
    <NextLink href={href} className={className} onClick={onClick}>
      {icon}
      {label}
    </NextLink>
  );
}
