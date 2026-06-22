'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CtaButton from '@/components/ui/cta-button';
import { Icon } from '@/components/ui/icon';
import { CURRENT_STAGE } from '@/lib/marketing/constants';
import { SOURCE_REPO_URL } from '@/lib/site';
import { track } from '@/lib/marketing/track';
import { WaitlistForm } from './waitlist-form';
import { PlatformAvailability } from './platform-availability';
import { RecorderMockup } from './recorder-mockup';
import { HaloEffect } from './halo-effect';
import { useLocalizedHref, useMessages } from './i18n-provider';

export function HeroSection() {
  const m = useMessages();
  const lh = useLocalizedHref();

  // Hovering the "AI-Powered" word pops a small CapCut-style teaser card
  // above it (spring in, slight tilt). The card is pointer-events-none so it
  // never traps the hover — leaving the word always dismisses it cleanly.
  const [aiHover, setAiHover] = useState(false);

  return (
    // `hero-mesh` paints the CapCut-style soft aurora on white. The negative
    // top-margin pulls the section up behind the fixed nav (which is transparent
    // at the top of the page) so the mesh shows through it; the matching
    // top-padding pushes the hero content back down to clear the bar — net
    // content position is unchanged.
    <>
      {/* Wraps the hero AND the recorder-mockup demo. Negative top-margin pulls
          it up behind the transparent fixed nav; matching top-padding pushes the
          hero content back down to clear the bar. No `overflow-hidden` here —
          the RecorderMockup sits in flow below the hero. */}
      <div
        className="relative"
        style={{
          marginTop: 'calc(-1 * var(--header-height, 68px))',
          paddingTop: 'var(--header-height, 68px)',
        }}
      >
        {/* Halo background — soft pastel blobs drifting around the hero copy.
            Pinned to the viewport through the nav, hero, and roughly the first
            half of the demo, then it releases and scrolls away. The bounded
            height of this container is what stops the pin; ~80vh keeps it to
            the hero only. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[80vh]">
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <HaloEffect />
            {/* soften the lower edge so the release into the demo isn't a hard line */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-b from-transparent to-white" />
          </div>
        </div>
        <section id="hero" className="relative z-10 overflow-hidden">
          <div
            id="hero-content"
            className="relative mx-auto max-w-7xl px-10 pb-12 pt-20 text-center sm:pt-28 lg:pt-36"
          >
            <h1 className="animate-fade-in-up font-heading text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] lg:text-[64px] xl:text-[72px]">
              <span
                className="relative inline-block"
                onMouseEnter={() => setAiHover(true)}
                onMouseLeave={() => setAiHover(false)}
              >
                <span className="text-blue-500">{m.hero.aiWord}</span>
                <AnimatePresence>
                  {aiHover && (
                    <motion.span
                      initial={{ opacity: 0, y: 14, rotate: -11, scale: 0.72 }}
                      animate={{ opacity: 1, y: 0, rotate: -7, scale: 0.85 }}
                      exit={{ opacity: 0, y: 14, rotate: -11, scale: 0.72 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="absolute left-1/2 top-1/2 z-50 block w-80 origin-center -translate-x-1/2 -translate-y-1/2"
                    >
                      <a
                        href={lh('/download')}
                        className="relative block aspect-[16/10] cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 p-5 text-left shadow-xl shadow-blue-500/25 transition-transform hover:scale-[1.03]"
                      >
                        {/* Oversized watermark graphic bleeding off the right edge,
                        mirroring CapCut's faint product mark. */}
                        <Icon
                          name="auto_awesome"
                          size={150}
                          fill
                          className="pointer-events-none absolute -bottom-6 -right-6 text-white/15"
                        />
                        <span className="relative flex h-full flex-col justify-between">
                          <span className="block">
                            <span className="block font-heading text-4xl font-bold uppercase leading-[0.95] tracking-tight text-white">
                              {m.hero.teaser.title}
                            </span>
                            <span className="mt-2 block max-w-[70%] text-xs font-normal leading-snug tracking-normal text-white/85">
                              {m.hero.teaser.body}
                            </span>
                          </span>
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-normal text-neutral-900">
                            <Icon name="bolt" size={12} fill />
                            {m.hero.teaser.cta}
                          </span>
                        </span>
                      </a>
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>{' '}
              {m.hero.titleMain}
              <br />
              {m.hero.titleSuffix}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-base leading-relaxed tracking-[-0.01em] text-muted-foreground animation-delay-200">
              {m.hero.subtitleLine1}
              <br />
              {m.hero.subtitleLine2}
            </p>
            {CURRENT_STAGE.showHeroBuyCta ? (
              <>
                {/* CTA pair — visible at every breakpoint: stacked full-width
                    buttons on phones, side-by-side pills from sm up. */}
                <div className="mt-8 flex animate-fade-in-up flex-col items-center justify-center gap-3 animation-delay-400 sm:flex-row">
                  <CtaButton
                    size="lg"
                    className="h-[3.25rem] w-full max-w-xs px-4 text-base sm:h-[3.75rem] sm:w-auto sm:max-w-none sm:px-6 sm:text-lg"
                    asChild
                  >
                    <a
                      href={lh('/download')}
                      onClick={() =>
                        track('marketing_cta_clicked', { location: 'hero' })
                      }
                    >
                      {m.hero.ctaLabel}
                    </a>
                  </CtaButton>
                  {/* Secondary grey pill — links to the open-source repo. */}
                  <a
                    href={SOURCE_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track('marketing_cta_clicked', { location: 'hero_github' })
                    }
                    className="inline-flex h-[3.25rem] w-full max-w-xs items-center justify-center gap-2.5 rounded-2xl bg-neutral-200 px-6 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-300 sm:h-[3.75rem] sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                      className="size-5 shrink-0"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </a>
                </div>
                <PlatformAvailability />
              </>
            ) : (
              <div className="mt-4 flex animate-fade-in-up justify-center animation-delay-400">
                <WaitlistForm />
              </div>
            )}
          </div>
        </section>
        <div className="relative z-10">
          <RecorderMockup />
        </div>
      </div>
      {/* Sentinel at the end of the hero demo — the floating CTA appears once
          this scrolls into view (i.e. the demo has been fully seen). */}
      <div id="hero-end" aria-hidden className="h-px w-full" />
    </>
  );
}
