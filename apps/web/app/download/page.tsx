import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Download, ArrowLeft, BookOpen, Terminal, ArrowUpRight } from 'lucide-react';
import { ThemeToggle, readThemeFromCookieHeader } from '@captureflow/ui';
import { DOWNLOAD_URL, RELEASES_URL, DOCS_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Download',
  description: 'Download the CaptureFlow screen recorder for macOS.',
};

// lucide-react v1 dropped brand glyphs, so the GitHub mark is inline.
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}

const OTHER = [
  {
    icon: Terminal,
    title: 'Build from source',
    body: 'Clone the repo and run the recorder locally with pnpm.',
    href: `${DOCS_URL}/developer/build`,
  },
  {
    icon: GitHubIcon,
    title: 'All releases',
    body: 'Browse every published build and changelog on GitHub.',
    href: RELEASES_URL,
  },
];

export default async function DownloadPage() {
  const theme = readThemeFromCookieHeader((await headers()).get('cookie'));

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <header className="sticky top-0 z-10 border-b border-line bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-round.png" alt="" width={30} height={30} className="rounded-full" />
            <span className="text-lg font-semibold lowercase tracking-tight">CaptureFlow</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <ThemeToggle initialTheme={theme} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-20 text-center sm:py-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="CaptureFlow"
          width={112}
          height={112}
          className="mx-auto h-24 w-24 rounded-[1.4rem] shadow-2xl shadow-blue-500/10"
        />
        <h1 className="mt-8 text-4xl font-bold tracking-tight text-fg-strong sm:text-5xl">
          Download CaptureFlow
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-fg-muted">
          The free, open-source screen recorder for macOS. Record, get an instant share link, done.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={DOWNLOAD_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent-bg px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-accent-bg-hover"
          >
            <Download className="h-5 w-5" /> Download for macOS
          </a>
          <p className="text-sm text-fg-subtle">
            For macOS · Apple Silicon &amp; Intel · opens the latest release
          </p>
        </div>

        <p className="mx-auto mt-8 max-w-md text-sm text-fg-muted">
          After installing, you&apos;ll grant a couple of macOS permissions (Screen Recording,
          Accessibility) on first launch — the{' '}
          <a
            href={`${DOCS_URL}/guide/install`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-accent transition-colors hover:text-accent-strong"
          >
            install guide
          </a>{' '}
          walks you through it.
        </p>

        <div className="mt-14 border-t border-line pt-10 text-left">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-fg-subtle">
            Other ways to get it
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {OTHER.map(({ icon: Icon, title, body, href }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-canvas-2">
                    <Icon className="h-5 w-5 text-fg-muted" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-fg-subtle transition-colors group-hover:text-fg" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-fg-strong">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{body}</p>
              </a>
            ))}
          </div>
        </div>

        <p className="mt-10 text-sm text-fg-subtle">
          Prefer the cloud?{' '}
          <Link href="/signup" className="font-medium text-accent transition-colors hover:text-accent-strong">
            Create an account
          </Link>{' '}
          and view recordings in your browser.
        </p>
      </main>
    </div>
  );
}
