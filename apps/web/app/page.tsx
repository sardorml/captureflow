import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Link2, Camera, Server, Lock, Zap } from 'lucide-react';
import { loadSession } from '@/lib/session-guard';

export const dynamic = 'force-dynamic';

const GITHUB_URL = 'https://github.com/sardorml/captureflow';

// lucide-react v1 dropped brand glyphs, so the GitHub mark is inline.
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}

// Custom CaptureFlow landing. Signed-in visitors go straight to the
// dashboard; everyone else gets the open-core pitch.
export default async function Home() {
  const session = await loadSession();
  if (session) redirect('/shares');

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Nav />
      <Hero />
      <Features />
      <SelfHost />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-round.png" alt="" width={30} height={30} className="rounded-lg" />
        <span className="text-lg font-semibold tracking-tight">CaptureFlow</span>
      </div>
      <nav className="flex items-center gap-3 text-sm">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-zinc-600 transition-colors hover:text-zinc-900 sm:flex"
        >
          <GitHubIcon className="h-4 w-4" /> GitHub
        </a>
        <Link
          href="/login"
          className="rounded-lg px-3 py-2 font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Get started
        </Link>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-20 pt-16 text-center sm:pt-24">
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-300"
      >
        <span className="font-medium text-zinc-900">Open source</span>
        <span className="text-zinc-300">·</span>
        <span>self-host or use the cloud</span>
      </a>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">
        Record. Share. <span className="text-zinc-400">Done.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-600">
        CaptureFlow turns a screen recording or screenshot into an instant shareable link — no
        upload wait, no editing detour. Open-core and self-hostable, so your captures stay on
        infrastructure you control.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/signup"
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
        >
          Get started free
        </Link>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 sm:w-auto"
        >
          <GitHubIcon className="h-4 w-4" /> Star on GitHub
        </a>
      </div>
      <p className="mt-4 text-sm text-zinc-400">macOS · AGPL-3.0 licensed</p>
    </section>
  );
}

const FEATURES = [
  {
    icon: Link2,
    title: 'Instant share links',
    body: 'Stop recording and the link is already in your clipboard. Viewers watch in the browser — no app, no download.',
  },
  {
    icon: Camera,
    title: 'Screenshots that travel',
    body: 'Snap any window or region, annotate, and share the same way. One flow for video and stills.',
  },
  {
    icon: Server,
    title: 'Self-hostable',
    body: 'Deploy the whole stack to your own Cloudflare account in minutes, or let us host it for you.',
  },
  {
    icon: Lock,
    title: 'Your data, your rules',
    body: 'Recordings live in your R2 bucket and your D1 database. Visibility controls per share — public, workspace, or private.',
  },
  {
    icon: Zap,
    title: 'Built for speed',
    body: 'Native ScreenCaptureKit recording streams straight to storage while you talk. No re-encode, no spinner.',
  },
  {
    icon: GitHubIcon,
    title: 'Open core',
    body: 'Every feature ships in the open-source repo. The managed cloud is a convenience, never a paywall.',
  },
];

function Features() {
  return (
    <section className="border-t border-zinc-100 bg-zinc-50/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white">
                <Icon className="h-5 w-5 text-zinc-700" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelfHost() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Run it yourself, or let us run it
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-zinc-600">
        Clone the repo and deploy to Cloudflare Workers + R2 + D1 — the same stack the hosted
        version runs on. Subscriptions pay for managed hosting, not for features.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <GitHubIcon className="h-4 w-4" /> Read the docs
        </a>
        <Link
          href="/signup"
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400"
        >
          Use the cloud
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-round.png" alt="" width={22} height={22} className="rounded-md" />
          <span>© CaptureFlow</span>
        </div>
        <div className="flex items-center gap-5">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-zinc-900">
            GitHub
          </a>
          <Link href="/login" className="hover:text-zinc-900">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
