'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ThemeToggle, type Theme } from '@captureflow/ui';

// lucide-react v1 dropped brand glyphs, so the GitHub mark is inline.
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}

export function MobileNav({
  theme,
  stars,
  docsUrl,
  githubUrl,
}: {
  theme: Theme;
  stars: string | null;
  docsUrl: string;
  githubUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const linkClass =
    'rounded-lg px-3 py-2.5 font-medium text-fg-muted transition-colors hover:bg-overlay hover:text-fg';

  return (
    <div ref={ref} className="flex items-center gap-1 md:hidden">
      <ThemeToggle initialTheme={theme} />
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 border-b border-line bg-canvas shadow-lg">
          <nav className="flex flex-col gap-1 px-6 py-4 text-base sm:px-10">
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              Docs
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 ${linkClass}`}
            >
              <GitHubIcon className="h-4 w-4" /> Star on GitHub
              {stars && <span className="text-fg-subtle">({stars})</span>}
            </a>
            <Link href="/login" onClick={() => setOpen(false)} className={linkClass}>
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-accent-bg px-3 py-2.5 text-center font-medium text-white shadow-[0_1px_2px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors hover:bg-accent-bg-hover"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
