"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import {
  CHROME_WEBSTORE_URL,
  CURRENT_STAGE,
  DOWNLOAD_URL,
} from "@/lib/marketing/constants";
import { fill } from "@/lib/i18n/fill";
import { MARKETING_SITE_URL } from "@/lib/site";
import { GlyphField } from "@/components/ui/glyph-field";
import { TwoTone } from "./frame";
import { WaitlistForm } from "./waitlist-form";
import {
  AppleLogo,
  ChromeLogoColor,
  ClaudeLogo,
  CursorLogo,
  OpenAILogo,
} from "./platform-logos";
import { InstallButton } from "./install-button";
import { useLocalizedHref, useMessages } from "./i18n-provider";

// Clicking the copy selects it for copying, so the highlight is part of the
// design: a soft wash that keeps the ink, not the browser's blue.
const COPY_SELECTION =
  "selection:bg-tint-strong selection:text-fg-strong dark:selection:bg-white/20 dark:selection:text-fg-strong";

// A soft blue that's still opaque, because the tight line height makes a
// translucent highlight double up where two lines overlap.
export const HERO_TITLE =
  "text-[clamp(2.5rem,1.5rem+5vw,4.5rem)] leading-[1.05] font-semibold tracking-[-0.05em] text-balance text-fg-strong selection:bg-[color-mix(in_srgb,var(--color-accent-bg)_22%,var(--cf-canvas))] selection:text-fg-strong";

export function HeroSection() {
  const m = useMessages();
  const lh = useLocalizedHref();
  const textRef = useRef<HTMLDivElement>(null);

  return (
    <section id="hero" className="relative isolate overflow-hidden">
      <GlyphField
        word="CAPTUREFLOW"
        clearRef={textRef}
        className="absolute inset-0 -z-10 text-accent-bg"
      />
      <div className="flex flex-col items-center px-6 pt-16 pb-20 text-center sm:pt-[90px] sm:pb-[104px]">
        <div ref={textRef} className="flex flex-col items-center">
          <ProductHuntBadge />
          <h1 onClick={selectAndCopyWithLink} className={HERO_TITLE}>
            {/* The copy decides the line break; phones wrap on their own. */}
            {m.hero.title.split("\n").map((line) => (
              <span key={line} className="sm:block">
                {fill(line, { bubble: <CameraBubble /> })}{" "}
              </span>
            ))}
          </h1>
          <p
            onClick={selectAndCopyWithLink}
            className={`mt-5 max-w-[800px] text-lg leading-7 text-balance sm:text-xl ${COPY_SELECTION}`}
          >
            <TwoTone
              text={m.hero.subtitle}
              slots={{
                chrome: (
                  <Brand icon={<ChromeLogoColor className={BRAND_ICON} />}>
                    Chrome
                  </Brand>
                ),
                claude: (
                  <Brand icon={<ClaudeLogo className={BRAND_ICON} />}>
                    Claude
                  </Brand>
                ),
                chatgpt: (
                  <Brand icon={<OpenAILogo className={BRAND_ICON} />}>
                    ChatGPT
                  </Brand>
                ),
                cursor: (
                  <Brand icon={<CursorLogo className={BRAND_ICON} />}>
                    Cursor
                  </Brand>
                ),
              }}
            />
          </p>
        </div>

        {CURRENT_STAGE.showHeroBuyCta ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <InstallButton
              href={CHROME_WEBSTORE_URL ?? lh("/download")}
              label={m.hero.installChrome}
              icon={<ChromeLogoColor className="size-6" />}
              location="hero_chrome"
              primary
            />
            <InstallButton
              href={DOWNLOAD_URL}
              label={m.hero.installMac}
              icon={<AppleLogo className="ml-1 size-4" />}
              location="hero_macos"
              badge={m.hero.installSoon}
            />
            <InstallButton
              href="#agents"
              label={m.hero.connectMcp}
              icon={
                <span className="flex size-6 items-center justify-center rounded-full bg-[#0d0d10]">
                  <ClaudeLogo className="size-3.5" />
                </span>
              }
              location="hero_mcp"
            />
          </div>
        ) : (
          <div style={{ marginTop: 36 }}>
            <WaitlistForm />
          </div>
        )}
      </div>
    </section>
  );
}

const PRODUCT_HUNT_URL =
  "https://www.producthunt.com/products/captureflow?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-captureflow";
const PRODUCT_HUNT_BADGE =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1281561";
const PRODUCT_HUNT_ALT =
  "CaptureFlow - Open-source screen recorder with instant share links | Product Hunt";

function ProductHuntBadge() {
  return (
    <a
      href={PRODUCT_HUNT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-7"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${PRODUCT_HUNT_BADGE}&theme=light`}
        alt={PRODUCT_HUNT_ALT}
        width={250}
        height={54}
        className="dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${PRODUCT_HUNT_BADGE}&theme=dark`}
        alt={PRODUCT_HUNT_ALT}
        width={250}
        height={54}
        className="hidden dark:block"
      />
    </a>
  );
}

const BRAND_ICON =
  "me-1 inline-block size-[1.05em] shrink-0 -translate-y-[0.1em] align-middle";

function Brand({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="font-medium whitespace-nowrap text-fg">
      {icon}
      {children}
    </span>
  );
}

function CameraBubble() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-[0.82em] -translate-y-[0.05em] overflow-hidden rounded-full border border-fg/[0.12] align-middle"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/webcam/cardigan.jpg"
        className="size-full object-cover"
      >
        <source src="/webcam/cardigan.webm" type="video/webm" />
        <source src="/webcam/cardigan.mp4" type="video/mp4" />
      </video>
    </span>
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
