"use client";

import { useRef, type MouseEvent } from "react";
import {
  CHROME_WEBSTORE_URL,
  CURRENT_STAGE,
  DOWNLOAD_URL,
} from "@/lib/marketing/constants";
import { MARKETING_SITE_URL, SOURCE_REPO_URL } from "@/lib/site";
import { GlyphField } from "@/components/ui/glyph-field";
import { TwoTone } from "./frame";
import { WaitlistForm } from "./waitlist-form";
import { AppleLogo, ChromeLogoColor, ClaudeLogo } from "./platform-logos";
import { InstallButton } from "./install-button";
import { useLocalizedHref, useMessages } from "./i18n-provider";

// Clicking the copy selects it for copying, so the highlight is part of the
// design: a soft wash that keeps the ink, not the browser's blue.
const COPY_SELECTION =
  "selection:bg-tint-strong selection:text-fg-strong dark:selection:bg-white/20 dark:selection:text-fg-strong";

// A soft blue that's still opaque, because the tight line height makes a
// translucent highlight double up where two lines overlap.
const TITLE_SELECTION =
  "selection:bg-[color-mix(in_srgb,var(--color-accent-bg)_22%,var(--cf-canvas))] selection:text-fg-strong";

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
          <p className="mb-8 text-[13px] leading-5 text-fg-muted">
            {m.hero.badge} on{" "}
            <a
              href={SOURCE_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg underline underline-offset-2"
            >
              GitHub
            </a>
          </p>
          <h1
            onClick={selectAndCopyWithLink}
            className={`text-[clamp(2.5rem,1.5rem+5vw,4.5rem)] leading-[1.05] font-semibold tracking-[-0.05em] text-balance text-fg-strong ${TITLE_SELECTION}`}
          >
            {/* The copy decides the line break; phones wrap on their own. */}
            {m.hero.title.split("\n").map((line) => (
              <span key={line} className="sm:block">
                {line}{" "}
              </span>
            ))}
          </h1>
          <p
            onClick={selectAndCopyWithLink}
            className={`mt-6 max-w-[720px] text-lg leading-7 text-balance sm:text-xl ${COPY_SELECTION}`}
          >
            <TwoTone text={m.hero.subtitle} />
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
