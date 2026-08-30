"use client";

import { motion } from "motion/react";
import { Text, Link as TypoLink } from "./typography";
import { TOKENS } from "./tokens";
import { DISCORD_URL } from "@/lib/marketing/constants";
import { DOCS_URL, RELEASES_URL, SOURCE_REPO_URL } from "@/lib/site";
import { useLocalizedHref } from "./i18n-provider";

type FooterLink = { label: string; href: string };

/*
 * Decorative wordmark: a dashed outline rather than a filled glyph, which only
 * SVG can do — `-webkit-text-stroke` has no dash control. Drawn in a viewBox so
 * it scales with the footer; VIEW_W is sized so "CaptureFlow" at FONT_SIZE
 * spans it, and the baseline sits low enough that descenders clip off the edge.
 */
const VIEW_W = 1000;
const VIEW_H = 220;
const FONT_SIZE = 176;
const BASELINE = 190;

export function Footer() {
  const lh = useLocalizedHref();
  const token = TOKENS;

  // One flat row rather than titled columns — the landing is short enough that
  // a sitemap footer outweighs it.
  const links: FooterLink[] = [
    { label: "Features", href: lh("/features") },
    { label: "Pricing", href: lh("/pricing") },
    { label: "FAQ", href: lh("/faq") },
    { label: "Roadmap", href: lh("/roadmap") },
    { label: "Download", href: lh("/download") },
    { label: "Docs", href: DOCS_URL },
    { label: "Self-hosting", href: `${DOCS_URL}/self-hosting` },
    { label: "Releases", href: RELEASES_URL },
    { label: "GitHub", href: SOURCE_REPO_URL },
    { label: "Discord", href: DISCORD_URL },
    { label: "Privacy", href: lh("/privacy") },
  ];

  return (
    <footer
      style={{
        position: "relative",
        overflow: "hidden",
        marginTop: "auto",
        background: token.colorBgContainer,
        /* Bottom space is for the decorative wordmark below, not content. */
        paddingBlock: "72px 140px",
      }}
    >
      {/* dir="ltr" keeps this decorative wordmark upright under RTL.
          Deliberately NOT viewport.once: `once` latches at the hidden initial
          state on scroll-away/remount; re-evaluating on every entry keeps it reliable. */}
      <motion.div
        dir="ltr"
        aria-hidden
        initial={{ y: 90, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ amount: 0.4 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 hidden overflow-hidden sm:block"
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMax meet"
          className="w-full translate-y-[22%] select-none text-[rgba(0,0,0,0.1)] dark:text-[rgba(255,255,255,0.08)]"
        >
          <text
            x={VIEW_W / 2}
            y={BASELINE}
            textAnchor="middle"
            fontSize={FONT_SIZE}
            fontWeight={700}
            letterSpacing="-0.03em"
            fill="none"
            stroke="currentColor"
            /* Values are in viewBox units, so they scale ~1.5x at a desktop
               width — a stroke of 2 lands near 3 CSS px on screen. Butt caps:
               round ones swell each segment and read as a dotted line. */
            strokeWidth={2}
            strokeDasharray="12 8"
            strokeLinecap="butt"
          >
            CaptureFlow
          </text>
        </svg>
      </motion.div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingInline: "clamp(20px, 4vw, 56px)",
        }}
      >
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {links.map((link) => (
            <TypoLink key={link.label} href={link.href} type="secondary">
              {link.label}
            </TypoLink>
          ))}
        </nav>

        <Text
          type="secondary"
          align="center"
          suppressHydrationWarning
          style={{ display: "block", marginTop: 20, fontSize: 14 }}
        >
          © {new Date().getFullYear()} CaptureFlow. All rights reserved.
        </Text>
      </div>
    </footer>
  );
}
