import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Link2, Video, Camera, ArrowRight, BookOpen, Download, Play, Check, Clock } from 'lucide-react';
import { ThemeToggle, readThemeFromCookieHeader, type Theme } from '@captureflow/ui';
import { loadSession } from '@/lib/session-guard';
import { DOCS_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

const GITHUB_URL = 'https://github.com/sardorml/captureflow';

// Wide content container.
const WIDE = 'mx-auto w-full max-w-[1280px] px-6 sm:px-10';
// Navbar spans the wider docs layout width (VitePress --vp-layout-max-width).
const NAV_WIDE = 'mx-auto w-full max-w-[1440px] px-6 sm:px-10';

// lucide-react v1 dropped brand glyphs, so the GitHub mark is inline.
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}

// Custom CaptureFlow landing. Signed-in visitors go straight to the
// dashboard; everyone else gets the open-core pitch. Themed via the shared
// data-theme token system (toggle in the nav).
export default async function Home() {
  const session = await loadSession();
  if (session) redirect('/shares');

  const theme = readThemeFromCookieHeader((await headers()).get('cookie'));

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <Nav theme={theme} />
      <Hero />
      <Features />
      <Roadmap />
      <SelfHost />
      <Footer />
    </div>
  );
}

function Nav({ theme }: { theme: Theme }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/80 backdrop-blur">
      <div className={`${NAV_WIDE} flex items-center justify-between py-4`}>
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={30} height={30} className="rounded-lg" />
          <span className="text-lg font-semibold tracking-tight">CaptureFlow</span>
        </div>
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-3 py-2 font-medium text-fg-muted transition-colors hover:text-fg"
          >
            Docs
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-fg-muted transition-colors hover:text-fg sm:flex"
          >
            <GitHubIcon className="h-4 w-4" /> GitHub
          </a>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 font-medium text-fg-muted transition-colors hover:text-fg"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-accent-bg px-4 py-2 font-medium text-white transition-colors hover:bg-accent-bg-hover"
          >
            Get started
          </Link>
          <ThemeToggle initialTheme={theme} className="ml-1" />
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className={`${WIDE} pt-16 pb-12 sm:pt-24`}>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-fg-strong sm:text-7xl">
            Screen recording with instant share links.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
            Open-source and self-hostable. Record your screen, get a link, done — on your own
            Cloudflare account.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/download"
              className="inline-flex items-center gap-2 rounded-full bg-accent-bg px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-bg-hover"
            >
              <Download className="h-4 w-4" /> Download for macOS
            </Link>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-medium text-fg transition-colors hover:bg-overlay"
            >
              <BookOpen className="h-4 w-4" /> Read the docs
            </a>
          </div>
        </div>
        <div className="w-full">
          <DemoMock />
        </div>
      </div>
    </section>
  );
}

// Placeholder product demo shown in the hero — a fake share-page video player.
// Swap the dark "stage" for a real recording (poster image / <video>) later.
function DemoMock() {
  return (
    <div className="group relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-blue-500/10">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-canvas-2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-green-400/80" />
        <div className="ml-3 flex-1 truncate rounded-md bg-overlay px-3 py-1 text-xs text-fg-subtle">
          captureflow.xyz/r/demo
        </div>
      </div>
      {/* video stage (intentionally dark in both themes, like a real player) */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-600 to-indigo-800">
        <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white">
          Demo
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg transition-transform duration-200 group-hover:scale-105">
            <Play className="h-7 w-7 translate-x-0.5 fill-current" />
          </span>
        </div>
        {/* fake scrubber */}
        <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 text-xs text-white/90">
          <span>0:12</span>
          <div className="relative h-1 flex-1 rounded-full bg-white/25">
            <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-white" />
          </div>
          <span>0:42</span>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Video,
    title: 'Record in seconds',
    body: 'A native macOS recorder for full screen, a single window, or a region — with an optional webcam bubble and smooth cursor.',
    link: { text: 'How to record', href: `${DOCS_URL}/guide/recording` },
  },
  {
    icon: Link2,
    title: 'Instant share links',
    body: 'The recording uploads while you record. The moment you stop, a shareable link is ready to paste anywhere.',
    link: { text: 'Sharing & visibility', href: `${DOCS_URL}/guide/sharing` },
  },
  {
    icon: Camera,
    title: 'Snaps',
    body: 'Capture an annotated screenshot and get an instant link, just like a recording.',
    link: { text: 'About snaps', href: `${DOCS_URL}/guide/snaps` },
  },
];

function Features() {
  return (
    <section className={`${WIDE} pb-24`}>
      <div className="grid gap-5 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body, link }) => (
          <div
            key={title}
            className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-strong"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-canvas-2">
              <Icon className="h-5 w-5 text-fg-muted" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-fg-strong">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{body}</p>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-strong"
            >
              {link.text} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

const ROADMAP_NOW = [
  'Native macOS recorder',
  'Instant share links',
  'Snaps (screenshots)',
  'Self-hosting on Cloudflare',
  'Workspaces & visibility controls',
];

const ROADMAP_PLANNED = ['Windows app', 'Chrome extension'];

function RoadmapColumn({
  label,
  items,
  done,
}: {
  label: string;
  items: string[];
  done?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <span
        className={
          done
            ? 'inline-block rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400'
            : 'inline-block rounded-full bg-overlay px-3 py-1 text-xs font-semibold text-fg-muted'
        }
      >
        {label}
      </span>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm">
            <span
              className={
                done
                  ? 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-400'
                  : 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-overlay text-fg-subtle'
              }
            >
              {done ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            </span>
            <span className={done ? 'text-fg' : 'text-fg-muted'}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Roadmap() {
  return (
    <section className="border-t border-line">
      <div className={`${WIDE} py-20`}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-fg-strong">Roadmap</h2>
          <p className="mt-4 text-fg-muted">
            CaptureFlow ships fast and fully in the open. Here&apos;s what&apos;s live today and
            what&apos;s coming next.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          <RoadmapColumn label="Available now" items={ROADMAP_NOW} done />
          <RoadmapColumn label="Planned" items={ROADMAP_PLANNED} />
        </div>
      </div>
    </section>
  );
}

function SelfHost() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-fg-strong">
          Run it yourself, or use our managed service
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-fg-muted">
          Clone the repo and deploy to Cloudflare Workers + R2 + D1 — the same stack the hosted
          version runs on. Every feature ships in the open-source build.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`${DOCS_URL}/self-hosting/overview`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent-bg px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-bg-hover"
          >
            <BookOpen className="h-4 w-4" /> Deploy guide
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-medium text-fg transition-colors hover:bg-overlay"
          >
            <GitHubIcon className="h-4 w-4" /> View source
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className={`${WIDE} flex flex-col items-center justify-between gap-4 py-8 text-sm text-fg-subtle sm:flex-row`}>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={22} height={22} className="rounded-md" />
          <span>© CaptureFlow</span>
        </div>
        <div className="flex items-center gap-5">
          <a href={DOCS_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">
            Docs
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">
            GitHub
          </a>
          <Link href="/login" className="transition-colors hover:text-fg">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
