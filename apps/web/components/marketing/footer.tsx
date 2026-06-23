'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { DOWNLOAD_URL, X_URL } from '@/lib/marketing/constants';
import { DOCS_URL } from '@/lib/site';
import { useLocalizedHref } from './i18n-provider';

const RELEASES_URL = 'https://github.com/sardorml/captureflow/releases';

// Footer wordmark — each letter is nudged up or down so they trace a static
// arch (highest in the middle, dipping at the edges). Offsets in em, negative
// = up.
const WORDMARK_LETTERS = [
  { ch: 'C', offset: 0.16 },
  { ch: 'a', offset: 0.1 },
  { ch: 'p', offset: 0.03 },
  { ch: 't', offset: -0.04 },
  { ch: 'u', offset: -0.09 },
  { ch: 'r', offset: -0.12 },
  { ch: 'e', offset: -0.12 },
  { ch: 'F', offset: -0.09 },
  { ch: 'l', offset: -0.04 },
  { ch: 'o', offset: 0.03 },
  { ch: 'w', offset: 0.16 },
];

export function Footer() {
  const lh = useLocalizedHref();

  return (
    <footer className="relative z-10 mt-auto overflow-hidden bg-white pb-40 pt-4">
      {/* Brand-rise effect — a blue gradient plus a tone-on-tone "CaptureFlow"
          wordmark anchored to the bottom edge. The layer slides + fades up
          whenever the footer scrolls into view, so the colour floods in from
          below. Deliberately NOT `viewport.once`: with `once` the effect latches
          after the first reveal and never re-fires, so scrolling away and back
          (or a route remount that restores scroll near the bottom) leaves it
          stuck at the hidden `initial` state. Re-evaluating on every entry keeps
          it reliable. */}
      <motion.div
        aria-hidden
        initial={{ y: 90, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ amount: 0.4 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0 z-0 hidden sm:block"
      >
        {/* Bottom wash: a solid blue band plus a central dome, so the colour's
            top edge rises and falls with the arched wordmark below — high over
            the tall centre letters, low at the short edge letters. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(37,99,235,0.88)_0%,rgba(37,99,235,0.5)_18%,transparent_46%),radial-gradient(95%_145%_at_50%_122%,rgba(37,99,235,0.62)_0%,transparent_74%)]" />
        {/* dir="ltr" pins the wordmark so the per-letter spans never reverse —
            it's a decorative brand mark, always read left-to-right. */}
        <div
          dir="ltr"
          className="absolute inset-x-0 bottom-0 flex justify-center overflow-hidden"
        >
          <span className="translate-y-[14%] select-none whitespace-nowrap font-heading text-[17vw] font-bold leading-none tracking-tight text-white/45">
            {WORDMARK_LETTERS.map((letter, i) => (
              <span
                key={i}
                className="inline-block"
                style={{ transform: `translateY(${letter.offset}em)` }}
              >
                {letter.ch}
              </span>
            ))}
          </span>
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
          <div>
            <p className="cursor-arrow mb-3 text-sm font-semibold text-neutral-500">
              Product
            </p>
            <ul className="space-y-2 text-base text-muted-foreground">
              <li>
                <Link
                  href={lh('/download')}
                  className="transition-colors hover:text-foreground"
                >
                  Download
                </Link>
              </li>
              <li>
                <Link
                  href={lh('/login')}
                  className="transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <a
                  href={RELEASES_URL}
                  className="transition-colors hover:text-foreground"
                >
                  Releases
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="cursor-arrow mb-3 text-sm font-semibold text-neutral-500">
              Docs
            </p>
            <ul className="space-y-2 text-base text-muted-foreground">
              <li>
                <a
                  href={`${DOCS_URL}/recording`}
                  className="transition-colors hover:text-foreground"
                >
                  Recording
                </a>
              </li>
              <li>
                <a
                  href={`${DOCS_URL}/sharing`}
                  className="transition-colors hover:text-foreground"
                >
                  Sharing
                </a>
              </li>
              <li>
                <Link
                  href={lh('/#faq')}
                  className="transition-colors hover:text-foreground"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="cursor-arrow mb-3 text-sm font-semibold text-neutral-500">
              Self-hosting
            </p>
            <ul className="space-y-2 text-base text-muted-foreground">
              <li>
                <a
                  href={`${DOCS_URL}/self-hosting`}
                  className="transition-colors hover:text-foreground"
                >
                  Overview
                </a>
              </li>
              <li>
                <a
                  href={`${DOCS_URL}/self-hosting/cloudflare`}
                  className="transition-colors hover:text-foreground"
                >
                  Cloudflare
                </a>
              </li>
              <li>
                <a
                  href={`${DOCS_URL}/architecture`}
                  className="transition-colors hover:text-foreground"
                >
                  Architecture
                </a>
              </li>
              <li>
                <a
                  href={`${DOCS_URL}/contributing`}
                  className="transition-colors hover:text-foreground"
                >
                  Contributing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="cursor-arrow mb-3 text-sm font-semibold text-neutral-500">
              Community
            </p>
            <ul className="space-y-2 text-base text-muted-foreground">
              <li>
                <a
                  href={X_URL}
                  className="transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={`${X_URL}/issues`}
                  className="transition-colors hover:text-foreground"
                >
                  Issues
                </a>
              </li>
              <li>
                <a
                  href={DOWNLOAD_URL}
                  className="transition-colors hover:text-foreground"
                >
                  Latest release
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            {/* suppressHydrationWarning: the year from `new Date()` can differ
                between server render and client hydration at a year boundary.
                Without it React flags a mismatch (which also disables Fast
                Refresh). */}
            <p
              suppressHydrationWarning
              className="text-sm text-neutral-500 sm:text-right"
            >
              &copy; {new Date().getFullYear()} CaptureFlow
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
