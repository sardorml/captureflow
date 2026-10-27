"use client";

import type { MouseEvent } from "react";
import { Paragraph, Title } from "./typography";
import {
  CHROME_WEBSTORE_URL,
  CURRENT_STAGE,
  DOWNLOAD_URL,
} from "@/lib/marketing/constants";
import { MARKETING_SITE_URL } from "@/lib/site";
import { WaitlistForm } from "./waitlist-form";
import { AppleLogo, ChromeLogoColor } from "./platform-logos";
import { InstallButton } from "./install-button";
import { RecorderMockup } from "./recorder-mockup";
import { useLocalizedHref, useMessages } from "./i18n-provider";

// Clicking the copy selects it for copying, so the highlight is part of the
// design: a soft wash that keeps the ink, not the browser's blue.
const COPY_SELECTION =
  "selection:bg-tint-strong selection:text-fg-strong dark:selection:bg-white/20 dark:selection:text-fg-strong";

// The headline's selection reads as a marker pen: the badge's orange-yellow
// (hue 72), turned a little further toward yellow.
const TITLE_SELECTION =
  "selection:bg-[oklch(0.84_0.16_84/0.5)] selection:text-fg-strong dark:selection:bg-[oklch(0.84_0.16_84/0.4)] dark:selection:text-fg-strong";

export function HeroSection() {
  const m = useMessages();
  const lh = useLocalizedHref();

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-6 pt-16 text-center sm:pt-20">
        <div onClick={selectAndCopyWithLink} className={TITLE_SELECTION}>
          <Title
            align="center"
            level={1}
            className="mx-auto text-balance text-fg-strong"
            style={{
              fontSize: "clamp(2.25rem, 0.75rem + 6vw, 6rem)",
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              marginBottom: 24,
            }}
          >
            {/* The copy decides the line break; phones wrap on their own. */}
            {m.hero.title.split("\n").map((line) => (
              <span key={line} className="sm:block">
                {line}{" "}
              </span>
            ))}
          </Title>
        </div>
        <div onClick={selectAndCopyWithLink} className={COPY_SELECTION}>
          <Paragraph
            align="center"
            className="text-balance text-fg-muted"
            style={{
              fontSize: "clamp(1.125rem, 1rem + 0.5vw, 1.375rem)",
              lineHeight: 1.45,
              maxWidth: 960,
            }}
          >
            {m.hero.subtitle}
          </Paragraph>
        </div>

        {CURRENT_STAGE.showHeroBuyCta ? (
          <div className="mt-7 flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <InstallButton
                href={CHROME_WEBSTORE_URL ?? lh("/download")}
                label={m.hero.installChrome}
                icon={<ChromeLogoColor className="size-7" />}
                location="hero_chrome"
                primary
              />
              <InstallButton
                href={DOWNLOAD_URL}
                label={m.hero.installMac}
                icon={<AppleLogo className="ml-1.5 size-4" />}
                location="hero_macos"
                badge={m.hero.installSoon}
              />
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 36 }}>
            <WaitlistForm />
          </div>
        )}
      </div>

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
