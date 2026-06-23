'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { track } from '@/lib/marketing/track';
import { useLocalizedHref, useMessages } from './i18n-provider';

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
      { threshold: 0, rootMargin: '0px 0px -15% 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed bottom-[4.5rem] left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out max-sm:hidden ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-[180%] opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-300 via-blue-200 to-blue-300 py-1.5 pl-2 pr-1.5 sm:gap-5 sm:py-2 sm:pl-2.5 sm:pr-2">
        <Image
          src="/logo-round.png"
          alt=""
          width={56}
          height={56}
          className="size-10 rounded-full sm:size-12"
          draggable={false}
          unoptimized
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
          className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-neutral-900 px-5 text-base font-semibold text-white transition-colors hover:bg-neutral-800 sm:h-14 sm:px-8 sm:text-lg"
        >
          {m.floatingCta.button}
        </a>
      </div>
    </div>
  );
}
