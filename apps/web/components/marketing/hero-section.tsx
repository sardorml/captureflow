'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CtaButton from '@/components/ui/cta-button';
import { Icon } from '@/components/ui/icon';
import { CURRENT_STAGE } from '@/lib/marketing/constants';
import { track } from '@/lib/marketing/track';
import { WaitlistForm } from './waitlist-form';
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

  // Secondary CTA smooth-scrolls to the pricing section on the same page;
  // the plain `#pricing` href stays as the no-JS / new-page fallback.
  const handleSecondaryCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const pricing = document.getElementById('pricing');
    if (!pricing) return;
    e.preventDefault();
    pricing.scrollIntoView({ behavior: 'smooth' });
  };

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
                  {/* Secondary grey pill — scrolls down to the pricing section */}
                  <a
                    href="#pricing"
                    onClick={handleSecondaryCtaClick}
                    className="inline-flex h-[3.25rem] w-full max-w-xs items-center justify-center rounded-2xl bg-neutral-200 px-6 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-300 sm:h-[3.75rem] sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
                  >
                    {m.hero.secondaryCta}
                  </a>
                </div>
                <p className="mt-4 animate-fade-in text-sm font-medium text-neutral-500 animation-delay-500 sm:text-base">
                  {m.hero.noCreditCard}
                </p>
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
