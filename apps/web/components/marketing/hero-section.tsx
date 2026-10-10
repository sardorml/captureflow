"use client";

import type { ReactNode } from "react";
import { Flex } from "./layout";
import { Paragraph, Title } from "./typography";
import { buttonVariants } from "@heroui/react";
import { CHROME_WEBSTORE_URL, CURRENT_STAGE } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { WaitlistForm } from "./waitlist-form";
import { AppleLogo, ChromeLogoColor } from "./platform-logos";
import { RecorderMockup } from "./recorder-mockup";
import { MARKETING_MAX_WIDTH } from "./_shared";
import NextLink from "next/link";
import { useLocalizedHref, useMessages } from "./i18n-provider";

// Same amber as the beta banner, and dark ink on it for the same reason: the
// fill stays amber in both themes, so a theme-flipping token would go near-white
// on amber in light mode.
const SOON_AMBER = "#f5a524";

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
          paddingBottom: 40,
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
          {m.hero.titleLead}
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
          {m.hero.subtitleLine1}{" "}
          {/* Forced break desktop-only; on phones it would orphan words. */}
          <br className="hidden sm:inline" />
          {m.hero.subtitleLine2}
        </Paragraph>

        {CURRENT_STAGE.showHeroBuyCta ? (
          <Flex vertical gap={16} align="center" style={{ marginTop: 36 }}>
            <InstallButton
              href={CHROME_WEBSTORE_URL ?? lh("/download")}
              label={m.hero.installChrome}
              icon={<ChromeLogoColor className="size-6" />}
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
  badge,
  primary,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  location: string;
  badge?: string;
  primary?: boolean;
}) {
  /* The alternative install is a white pill, not a grey one: HeroUI's greys
     recede into the dark page next to the blue primary. Setting .button's own
     colour vars rather than bg and text utilities, so hover and pressed follow
     from the same place instead of needing their own variants. */
  /* Explicit height: HeroUI's lg is 44px and drops to 40 at md, which reads
     undersized under a headline this large. */
  const base = "h-14 gap-2.5 rounded-full px-9 text-[17px] font-medium";
  const className = buttonVariants({
    variant: primary ? "primary" : "tertiary",
    size: "lg",
    className: primary
      ? base
      : `${base} [--button-bg:var(--cf-inverse)] [--button-fg:var(--cf-on-inverse)] [--button-bg-hover:#e5e5e5] [--button-bg-pressed:#d4d4d4]`,
  });
  const onClick = () => track("marketing_cta_clicked", { location });

  const link = /^https?:/.test(href) ? (
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
  ) : (
    <NextLink href={href} className={className} onClick={onClick}>
      {icon}
      {label}
    </NextLink>
  );

  if (!badge) return link;

  /* The pill straddles the button's corner rather than sitting inside it: the
     label already fills the pill, and the amber has to read against the page as
     well as against the blue. pointer-events-none so the corner it covers still
     belongs to the button. */
  return (
    <span className="relative inline-flex">
      {link}
      <span
        className="pointer-events-none absolute -top-1.5 -right-1 rounded-full px-2 py-0.5 text-[11px] leading-none font-semibold"
        style={{ backgroundColor: SOON_AMBER, color: "#0a0a0a" }}
      >
        {badge}
      </span>
    </span>
  );
}
