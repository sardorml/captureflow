'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { NAV_LINKS } from '@/lib/marketing/constants';
import { DOCS_URL } from '@/lib/site';
import { useLocalizedHref, useMessages } from './i18n-provider';

// Docs + repo live off-site; surfaced in the nav so visitors can jump to the
// open-source project or the deploy guide without scrolling to the footer.
// DOCS_URL is env-aware (localhost docs in dev, docs.captureflow.xyz in prod).
const GITHUB_URL = 'https://github.com/sardorml/captureflow';

// lucide v1 dropped brand glyphs and Material Symbols has no octocat, so the
// GitHub mark is inline (same path as the hero button).
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function Nav({ stars = null }: { stars?: string | null }) {
  const m = useMessages();
  // Prefixes in-app marketing hrefs with the active locale so clicking nav
  // keeps the language in the URL. Same-page `#anchor` hrefs and non-marketing
  // routes (/login) pass through unchanged.
  const lh = useLocalizedHref();
  // Translate a nav link by its anchor; falls back to the constant's English
  // label for any link without a catalog key.
  const navLabel = (link: { href: string; label: string }): string => {
    switch (link.href) {
      case '#modes':
        return m.nav.features;
      case '#pricing':
        return m.nav.pricing;
      case '#faq':
        return m.nav.faq;
      case '#roadmap':
        return m.nav.roadmap;
      case '/changelog':
        return m.nav.changelog;
      default:
        return link.label;
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  // CapCut-style nav: transparent over the hero at the very top, then a solid
  // white bar once the page scrolls past the fold. The scrolled state uses
  // bg-white (a core utility) — NOT the marketing `@theme` `bg-background`
  // token, which doesn't compile into a utility on this page and so rendered
  // transparent even when scrolled, letting content bleed through the bar.
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const updateScrollPadding = useCallback(() => {
    if (headerRef.current) {
      document.documentElement.style.setProperty(
        '--header-height',
        `${headerRef.current.offsetHeight}px`,
      );
    }
  }, []);

  useEffect(() => {
    updateScrollPadding();
    window.addEventListener('resize', updateScrollPadding);
    return () => window.removeEventListener('resize', updateScrollPadding);
  }, [updateScrollPadding]);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      // Fixed (not sticky) so the bar never repositions on scroll — sticky
      // forces iOS Safari to re-rasterize the bar every frame as it recomputes
      // the sticky offset. Deliberately NO transform / will-change / filter
      // here: any of those on the bar (or an ancestor) creates a containing
      // block that turns `position: fixed` into "fixed relative to that box,"
      // which would let the bar scroll with the page. Keeping it transform-free
      // pins it to the viewport. Page content is pushed below by
      // `padding-top: var(--header-height)` on <main>, set from the bar's
      // measured offsetHeight.
      className="fixed inset-x-0 top-0 z-50"
    >
      {/* Bar background — fades from transparent over the hero to solid white
        once the page scrolls past the fold (or while the mobile sheet is
        open). Fades over 300ms. */}
      <div
        className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-300 ${
          scrolled || menuOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-10">
        {/* Left cluster — brand + primary nav links grouped together, the
          way CapCut left-aligns its logo and Products/Features/… links so
          they read as one navigational unit. */}
        <div className="flex items-center gap-8">
          <Link href={lh('/')} className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="CaptureFlow"
              width={30}
              height={30}
              className="rounded-lg"
              draggable={false}
              priority
            />
            <span className="font-heading text-xl font-semibold tracking-tight">
              CaptureFlow
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-[#090c14] md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={lh(link.href)}
                className="transition-colors hover:text-foreground"
              >
                {navLabel(link)}
              </Link>
            ))}
            {/* Docs — the deploy + usage guide, off-site. */}
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Docs
            </a>
          </div>
        </div>

        {/* Right cluster — secondary links + actions, right-aligned to
          mirror CapCut's grouping. Order runs low-emphasis → primary CTA:
          GitHub, Sign in, then Download. */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Star on GitHub — CaptureFlow is open source; sends visitors
            straight to the repo. */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-neutral-700 transition-colors hover:text-foreground"
          >
            <GitHubIcon className="h-[18px] w-[18px]" />
            Star on GitHub
            {stars && <span>({stars})</span>}
          </a>
          {/* Sign in — quiet light-grey secondary. Routes to the standalone
            login page. */}
          <Link
            href={lh('/login')}
            className="ms-1 inline-flex h-10 items-center rounded-lg bg-neutral-200 px-5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-300"
          >
            Sign in
          </Link>
          {/* Download — the primary dark CTA (the product action matters
            more than auth). Sits rightmost so first-time visitors always
            have an entry point regardless of which section they're on. */}
          <a
            href={lh('/download')}
            className="ms-1 inline-flex h-10 items-center rounded-lg bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            {m.nav.download}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex size-10 items-center justify-center rounded-xl text-foreground md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <Icon name="close" size={20} />
          ) : (
            <Icon name="menu" size={20} />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-var(--header-height,68px))] overflow-y-auto border-b border-black/10 bg-white/95 backdrop-blur-lg md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-10 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={lh(link.href)}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-black/5"
              >
                {navLabel(link)}
              </Link>
            ))}
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-black/5"
            >
              Docs
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-black/5"
            >
              <GitHubIcon className="h-5 w-5" />
              Star on GitHub
              {stars && <span>({stars})</span>}
            </a>
            {/* Same emphasis as desktop: Sign in = quiet grey, Download =
              primary dark CTA. */}
            <Link
              href={lh('/login')}
              onClick={() => setMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center rounded-xl bg-neutral-200 px-4 py-3 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-300"
            >
              Sign in
            </Link>
            <a
              href={lh('/download')}
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              {m.nav.download}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
