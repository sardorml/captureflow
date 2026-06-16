import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import {
  Link2,
  Video,
  Camera,
  ArrowRight,
  BookOpen,
  Download,
  Play,
  Check,
  Clock,
  Globe,
} from 'lucide-react';
import { ThemeToggle, readThemeFromCookieHeader, type Theme } from '@captureflow/ui';
import { loadSession } from '@/lib/session-guard';
import { DOCS_URL, RELEASES_URL } from '@/lib/site';
import { getStarCount, formatStars } from '@/lib/github';
import { MobileNav } from './_components/mobile-nav';

export const dynamic = 'force-dynamic';

const GITHUB_URL = 'https://github.com/sardorml/captureflow';

// Content + navbar share the wider docs layout width (VitePress
// --vp-layout-max-width).
const WIDE = 'mx-auto w-full max-w-[1440px] px-6 sm:px-10';
const NAV_WIDE = WIDE;

// Shared button materials. The primary carries a crisp inset top-highlight +
// soft brand shadow so it reads as a lit, pressable surface; the secondary is
// glassy so the hero's lattice/glow shows faintly through it.
const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full bg-accent-bg px-6 py-3 text-sm font-medium text-white shadow-[0_2px_10px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-accent-bg-hover active:scale-[0.98]';
const SECONDARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-surface/60 px-6 py-3 text-sm font-medium text-fg backdrop-blur transition hover:bg-overlay';

// Card material reused across Features / Roadmap: a hairline top-highlight,
// a faint resting shadow, and a small lift on hover.
const CARD =
  'group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-sm transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md';

// Deterministic "waveform" for the demo scrubber — same values on the server
// and client (no Math.random), so it never causes a hydration mismatch.
const WAVE = Array.from(
  { length: 42 },
  (_, i) =>
    26 +
    Math.round(
      (Math.abs(Math.sin(i * 0.7)) * 0.7 + Math.abs(Math.sin(i * 0.29)) * 0.3) * 64,
    ),
);
const WAVE_PLAYED = 12; // bars left of the playhead (≈ 0:12 of 0:42)

// lucide-react v1 dropped brand glyphs, so the GitHub mark is inline.
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}

// Official Cloudflare brand mark (orange), inlined like the GitHub glyph.
function CloudflareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#F6821F" aria-hidden className={className}>
      <path d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727" />
    </svg>
  );
}

// Centered hairline rule that fades out at both ends — separates sections
// without the hard edge of a full-width border.
function FadeDivider() {
  return (
    <div
      aria-hidden
      className="mx-auto h-px w-full max-w-[1440px] bg-gradient-to-r from-transparent via-line-strong to-transparent"
    />
  );
}

// Custom CaptureFlow landing. Signed-in visitors go straight to the
// dashboard; everyone else gets the open-core pitch. Themed via the shared
// data-theme token system (toggle in the nav).
export default async function Home() {
  const session = await loadSession();
  if (session) redirect('/shares');

  const theme = readThemeFromCookieHeader((await headers()).get('cookie'));
  const starCount = await getStarCount();
  const stars = starCount != null ? formatStars(starCount) : null;

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas text-fg">
      <Nav theme={theme} stars={stars} />
      <Hero />
      <Features />
      <Roadmap />
      <SelfHost />
      <Footer />
    </div>
  );
}

function Nav({ theme, stars }: { theme: Theme; stars: string | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur">
      <div className={`${NAV_WIDE} flex items-center justify-between py-4`}>
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={30} height={30} className="rounded-lg" />
          <span className="text-lg font-semibold tracking-tight">CaptureFlow</span>
        </div>
        <nav className="hidden items-center gap-1 text-sm sm:gap-2 md:flex">
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
            className="hidden items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 font-medium text-fg-muted transition-colors hover:border-line-strong hover:bg-overlay hover:text-fg sm:flex"
          >
            <GitHubIcon className="h-4 w-4" /> Star on GitHub
            {stars && <span className="text-fg-subtle">({stars})</span>}
          </a>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 font-medium text-fg-muted transition-colors hover:text-fg"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-accent-bg px-4 py-2 font-medium text-white shadow-[0_1px_2px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors hover:bg-accent-bg-hover"
          >
            Get started
          </Link>
          <ThemeToggle initialTheme={theme} className="ml-1" />
        </nav>
        <MobileNav theme={theme} stars={stars} docsUrl={DOCS_URL} githubUrl={GITHUB_URL} />
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section>
      <div className={`${WIDE} pb-16 pt-16 sm:pt-24 lg:pt-28`}>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="animate-reveal text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Open source · Self-hostable
            </p>
            <h1 className="animate-reveal mt-5 text-balance text-5xl font-bold leading-[1.05] tracking-tight text-fg-strong [animation-delay:70ms] sm:text-7xl">
              Screen recording with{' '}
              <span className="text-accent">instant share links.</span>
            </h1>
            <p className="animate-reveal mt-6 max-w-md text-pretty text-lg leading-relaxed text-fg-muted [animation-delay:140ms]">
              Record your screen, get a link, done — on your own Cloudflare account.
              Open-source, self-hostable, and free.
            </p>
            <div className="animate-reveal mt-8 flex flex-wrap gap-3 [animation-delay:200ms]">
              <Link href="/download" className={PRIMARY_BTN}>
                <Download className="h-4 w-4" /> Download for macOS
              </Link>
              <a href={DOCS_URL} target="_blank" rel="noreferrer" className={SECONDARY_BTN}>
                <BookOpen className="h-4 w-4" /> Read the docs
              </a>
            </div>
            <div className="animate-reveal mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-base text-fg-muted [animation-delay:250ms]">
              <span className="inline-flex items-center gap-2.5">
                <CloudflareIcon className="h-6 w-6" />
                Hostable on{' '}
                <span className="font-semibold text-fg-strong">Cloudflare</span>
              </span>
              <span className="inline-flex items-center gap-2.5">
                <Globe className="h-5 w-5 text-accent" />
                Custom domains
              </span>
            </div>
          </div>
          <div className="animate-reveal w-full [animation-delay:300ms]">
            <DemoPlayer />
          </div>
        </div>
      </div>
    </section>
  );
}

// Placeholder product demo shown in the hero — a bare video player (no browser
// chrome). Swap the dark "stage" for a real recording (poster image / <video>)
// later.
function DemoPlayer() {
  return (
    <div className="group relative mx-auto aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-[#0b1020] ring-1 ring-inset ring-white/5 lg:max-w-none">
      {/* under-glow rising from the playhead */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.20),transparent_70%)]"
      />
      {/* recording indicator — the only looping motion on the page */}
      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 font-mono text-xs text-white/80">
        <span className="h-2 w-2 animate-rec-breathe rounded-full bg-red-500" />
        REC
      </div>
      {/* one-shot "link copied" tell — pops once on load, then fades out */}
      <div className="absolute right-3 top-3 inline-flex animate-share-icon-pop items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white opacity-0 ring-1 ring-white/15 backdrop-blur">
        <Check className="h-3 w-3 text-emerald-400" /> Link copied
      </div>
      {/* play control */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 transition-transform duration-200 group-hover:scale-105 sm:h-20 sm:w-20">
          <Play className="h-7 w-7 translate-x-0.5 fill-current sm:h-9 sm:w-9" />
        </span>
      </div>
      {/* waveform scrubber */}
      <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 font-mono text-xs tabular-nums text-white/90">
        <span>0:12</span>
        <div className="flex h-6 flex-1 items-center gap-[2px]">
          {WAVE.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={`w-[2px] rounded-full ${i < WAVE_PLAYED ? 'bg-white/70' : 'bg-white/20'}`}
            />
          ))}
        </div>
        <span>0:42</span>
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
    <section className={`${WIDE} pb-24 pt-28 sm:pt-36`}>
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg-strong sm:text-4xl">
          From screen to shareable link
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body, link }, i) => (
          <div key={title} className={CARD}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent"
            />
            <span className="absolute right-5 top-5 font-mono text-xs tabular-nums text-fg-subtle/60">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-inset ring-blue-500/15">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-fg-strong">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{body}</p>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-strong"
            >
              {link.text}{' '}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
    <div className={CARD}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent"
      />
      <span
        className={
          done
            ? 'inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-600 dark:text-green-400'
            : 'inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-subtle'
        }
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
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
    <section>
      <FadeDivider />
      <div className={`${WIDE} py-20`}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Roadmap
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg-strong sm:text-4xl">
            Shipping fast, fully in the open
          </h2>
          <p className="mt-4 text-fg-muted">
            Here&apos;s what&apos;s live today and what&apos;s coming next.
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
    <section>
      <FadeDivider />
      <div className={`${WIDE} py-20`}>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center shadow-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-fg-strong sm:text-4xl">
            Run it yourself, or use our managed service
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-fg-muted">
            Clone the repo and deploy to Cloudflare Workers + R2 + D1 — the same stack the
            hosted version runs on. Every feature ships in the open-source build.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`${DOCS_URL}/self-hosting/overview`}
              target="_blank"
              rel="noreferrer"
              className={PRIMARY_BTN}
            >
              <BookOpen className="h-4 w-4" /> Deploy guide
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={SECONDARY_BTN}>
              <GitHubIcon className="h-4 w-4" /> View source
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLS: {
  title: string;
  links: { label: string; href: string; internal?: boolean }[];
}[] = [
  {
    title: 'Product',
    links: [
      { label: 'Download', href: '/download', internal: true },
      { label: 'Sign in', href: '/login', internal: true },
      { label: 'Create account', href: '/signup', internal: true },
      { label: 'Releases', href: RELEASES_URL },
    ],
  },
  {
    title: 'Documentation',
    links: [
      { label: 'Getting started', href: `${DOCS_URL}/guide/install` },
      { label: 'Recording', href: `${DOCS_URL}/guide/recording` },
      { label: 'Sharing & visibility', href: `${DOCS_URL}/guide/sharing` },
      { label: 'FAQ', href: `${DOCS_URL}/reference/faq` },
    ],
  },
  {
    title: 'Self-hosting',
    links: [
      { label: 'Overview', href: `${DOCS_URL}/self-hosting/overview` },
      { label: 'Deploy to Cloudflare', href: `${DOCS_URL}/self-hosting/cloudflare` },
      { label: 'Architecture', href: `${DOCS_URL}/developer/architecture` },
      { label: 'Contributing', href: `${DOCS_URL}/developer/contributing` },
    ],
  },
];

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-canvas-2">
      <div className={`${WIDE} grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr_1fr]`}>
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={30} height={30} className="rounded-lg" />
            <span className="text-lg font-semibold tracking-tight text-fg-strong">
              CaptureFlow
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-fg-muted">
            Open-source, self-hostable screen recording with instant share links. Record, get a
            link, done.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="CaptureFlow on GitHub"
            className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            <GitHubIcon className="h-4 w-4" />
          </a>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.internal ? (
                    <Link href={l.href} className="text-fg-muted transition-colors hover:text-fg">
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fg-muted transition-colors hover:text-fg"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className={`${WIDE} py-6 text-sm text-fg-subtle`}>
          <span>© {year} CaptureFlow. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
