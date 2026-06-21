'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { track } from '@/lib/marketing/track';
import { useLocalizedHref, useMessages } from './i18n-provider';

// Floating "Try CaptureFlow" toolbar — a bottom-centered pill that slides up
// from below once the user reaches the end of the hero demo, and slides
// back down when they return to the top. Mirrors CapCut's persistent
// floating CTA.
//
// Visibility is driven by an IntersectionObserver on the `#hero-end`
// sentinel (a 1px marker at the bottom of the hero demo) rather than the
// whole hero or a scroll listener. The bar shows the moment that sentinel
// scrolls into view (the demo has been fully seen) and stays up as the page
// continues down (sentinel above the viewport → `top < 0`); it hides again
// only once the sentinel drops back below the fold near the top. No
// per-frame scroll math, so it can't jank the page.
export function FloatingCta() {
  const [visible, setVisible] = useState(false);
  const lh = useLocalizedHref();
  const m = useMessages();

  useEffect(() => {
    const sentinel = document.getElementById('hero-end');
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(entry.isIntersecting || entry.boundingClientRect.top < 0),
      // Negative bottom margin delays the trigger: the sentinel must scroll
      // ~15% of the viewport past the bottom edge before the bar appears, so it
      // shows a bit after the editor reveal rather than the instant the demo's
      // end first touches the fold.
      { threshold: 0, rootMargin: '0px 0px -15% 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    // While hidden the bar must be fully out of the page for everyone:
    // aria-hidden for screen readers AND `inert` + tabIndex so the link
    // inside can't be tabbed to behind the visual fade.
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed bottom-[4.5rem] left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-[180%] opacity-0'
      }`}
    >
      {/* CapCut-style pill — soft blue gradient fill, the brand mark, dark
          tagline, and a dark pill button (mirrors CapCut's bar, recoloured to
          blue). Flat: no glow shadow, logo sits bare with no ring. Shrinks
          its padding, logo, and button on phones. */}
      <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-300 via-blue-200 to-blue-300 py-1.5 pl-2 pr-1.5 sm:gap-5 sm:py-2 sm:pl-2.5 sm:pr-2">
        <Image
          src="/logo-round.png"
          alt=""
          width={56}
          height={56}
          className="size-10 rounded-full sm:size-12"
          draggable={false}
        />
        <span className="hidden text-lg font-semibold text-neutral-900 sm:inline">
          {m.floatingCta.tagline}
        </span>
        <a
          href={lh('/download')}
          tabIndex={visible ? 0 : -1}
          onClick={() =>
            track('marketing_cta_clicked', { location: 'floating' })
          }
          className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-900 px-5 text-base font-semibold text-white transition-colors hover:bg-neutral-800 sm:h-14 sm:px-8 sm:text-lg"
        >
          {m.floatingCta.button}
        </a>
      </div>
    </div>
  );
}
