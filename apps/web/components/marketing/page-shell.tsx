'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Footer } from './footer';
import { useMessages, useLocalizedHref } from './i18n-provider';

type PageShellProps = {
  children: React.ReactNode;
  maxWidth?: string;
  title?: string;
  subtitle?: string;
};

const CONTENT_BG = '#ffffff';
// Match the landing's font (.marketing-root --font-sans) so every marketing
// surface renders alike.
const SYSTEM_FONT =
  'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function PageShell({
  children,
  maxWidth = 'max-w-5xl',
  title,
  subtitle,
}: PageShellProps) {
  const m = useMessages();
  const lh = useLocalizedHref();
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="relative z-50">
        <div
          className="absolute inset-x-0 top-0 h-16 pointer-events-none mx-auto max-w-7xl "
          style={{ backgroundColor: CONTENT_BG }}
        />
        <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-10">
          <Link href={lh('/')} className="flex items-center gap-2">
            <Image
              src="/logo-round.png"
              alt={m.pageShell.logoAlt}
              width={32}
              height={32}
              className="h-8 w-auto"
              draggable={false}
              priority
              unoptimized
            />
            <span className="font-heading text-xl font-semibold lowercase tracking-tight">
              CaptureFlow
            </span>
          </Link>
          <Link
            href={lh('/')}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {m.pageShell.backToHome}
          </Link>
        </nav>
      </header>

      <div className="relative flex flex-1 flex-col">
        <div
          className="mx-auto w-full max-w-7xl flex-1"
          style={{ backgroundColor: CONTENT_BG, fontFamily: SYSTEM_FONT }}
        >
          {title && (
            <div className="mx-auto max-w-5xl px-5 sm:px-10 pt-12 pb-8">
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>
              )}
            </div>
          )}

          <div
            className={`mx-auto ${maxWidth} px-5 sm:px-10 ${
              title ? 'pt-4' : 'pt-16'
            } pb-20`}
          >
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
