"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Flex } from "./layout";
import { Paragraph, Title } from "./typography";
import { buttonVariants } from "@heroui/react";
import { CHROME_WEBSTORE_URL, CURRENT_STAGE } from "@/lib/marketing/constants";
import { MARKETING_SITE_URL } from "@/lib/site";
import { track } from "@/lib/marketing/track";
import { WaitlistForm } from "./waitlist-form";
import { AppleLogo, ChromeLogoColor } from "./platform-logos";
import { RecorderMockup } from "./recorder-mockup";
import { CloudSky } from "./cloud-sky";
import { NightSky } from "./night-sky";
import NextLink from "next/link";
import { useLocalizedHref, useMessages } from "./i18n-provider";

// Same amber as the beta banner, and dark ink on it for the same reason: the
// fill stays amber in both themes, so a theme-flipping token would go near-white
// on amber in light mode.
const SOON_AMBER = "#f5a524";

// A fine sand grain over the sky and its clouds: tiled fractal noise, static so
// it costs nothing per frame.
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -1.35"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>',
)}")`;

export function HeroSection() {
  const m = useMessages();
  const lh = useLocalizedHref();

  return (
    <section
      id="hero"
      className="relative isolate -mt-[66px] overflow-hidden pt-[66px]"
    >
      <Sky />
      <Flex
        vertical
        align="center"
        style={{
          maxWidth: 1280,
          marginInline: "auto",
          paddingInline: 24,
          paddingTop: 100,
          paddingBottom: 40,
          textAlign: "center",
        }}
      >
        <div onClick={selectAndCopyWithLink}>
          <Title
            align="center"
            level={1}
            className="text-balance text-fg-strong lg:whitespace-nowrap"
            style={{
              fontSize: "clamp(2.5rem, 1.5rem + 3.2vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 20,
            }}
          >
            {m.hero.title}
          </Title>
        </div>
        <div onClick={selectAndCopyWithLink}>
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
      </Flex>

      <RecorderMockup />
    </section>
  );
}

// One three.js scene at a time: clouds in light mode, stars in dark. Each
// unmounts, and frees its GPU resources, when the theme flips.
function SkyScene() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.dataset.theme !== "light");
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  if (dark === null) return null;
  return dark ? <NightSky /> : <CloudSky />;
}

/*
 * A sky gradient behind a three.js scene, fading into the page at the bottom
 * so the next section doesn't start on a hard edge.
 */
function Sky() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(38%_34%_at_74%_0%,rgb(255_178_98/0.72),transparent_70%),linear-gradient(180deg,#a3c9ef_0%,#c2dbf4_45%,#e2eefa_100%)] dark:bg-canvas dark:bg-none"
    >
      <div className="absolute inset-0 bg-canvas/50 dark:hidden" />
      <SkyScene />
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] dark:invert"
        style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
      />
      {/* Dark mode eases out over a taller band, so the stars thin away
          rather than stopping at a line. */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-canvas dark:h-[34rem] dark:bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--cf-canvas)_25%,transparent)_30%,color-mix(in_srgb,var(--cf-canvas)_70%,transparent)_60%,var(--cf-canvas)_92%)]" />
    </div>
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
  /* The alternative install takes the accent pair, white on dark and graphite
     on light, since HeroUI's greys recede into the page. Setting .button's own colour vars
     rather than bg and text utilities, so hover and pressed follow from the
     same place instead of needing their own variants. */
  /* Explicit height: HeroUI's lg is 44px and drops to 40 at md, which reads
     undersized under a headline this large. */
  const base =
    "h-13 gap-[11px] rounded-full pr-[26px] pl-3 text-[18px] font-medium";
  const className = buttonVariants({
    variant: primary ? "primary" : "tertiary",
    size: "lg",
    className: primary
      ? base
      : `${base} [--button-bg:var(--accent)] [--button-fg:var(--accent-foreground)] [--button-bg-hover:var(--accent-hover)] [--button-bg-pressed:var(--accent-hover)]`,
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
