'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';
import { type Theme, THEME_COOKIE } from '../lib/theme';

// Sun/moon toggle button — writes the theme cookie + flips the
// `data-theme` attribute on <html> for instant feedback, then nudges
// the router so server components re-render with the new attribute on
// the next paint (matters for pages that look up theme during SSR).
//
// Accepts `initialTheme` from the server-resolved cookie so the
// rendered icon doesn't flash the wrong glyph during hydration.

type Props = {
  initialTheme: Theme;
  className?: string;
  // Optional callback so the consuming app can run `router.refresh()`
  // after the cookie flips — kept out of this package to avoid a hard
  // dependency on next/navigation here.
  onAfterToggle?: (next: Theme) => void;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// When the toggle runs on a `*.captureflow.xyz` host, scope the
// cookie to the apex domain so app / share / snap all read the same
// preference. On localhost (or any other host) we leave Domain off so
// the cookie defaults to the current origin — setting a Domain on a
// hostname without a public suffix is silently dropped by browsers.
function cookieDomainFor(hostname: string): string | null {
  if (
    hostname.endsWith('.captureflow.xyz') ||
    hostname === 'captureflow.xyz'
  ) {
    return '.captureflow.xyz';
  }
  return null;
}

function writeThemeCookie(value: Theme) {
  // SameSite=Lax + 1-year horizon mirrors better-auth's defaults; the
  // toggle is a preference, not a session secret.
  const domain = cookieDomainFor(window.location.hostname);
  const isHttps = window.location.protocol === 'https:';
  const parts = [
    `${THEME_COOKIE}=${value}`,
    'Path=/',
    `Max-Age=${ONE_YEAR_SECONDS}`,
    'SameSite=Lax',
  ];
  if (domain) parts.push(`Domain=${domain}`);
  if (isHttps) parts.push('Secure');
  document.cookie = parts.join('; ');
}

export function ThemeToggle({ initialTheme, className, onAfterToggle }: Props) {
  const [theme, setTheme] = React.useState<Theme>(initialTheme);

  // Keep React state synced with the SSR-resolved attribute so a hard
  // refresh after the cookie flipped doesn't strand us on the prior
  // icon. Runs once on mount.
  React.useEffect(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') setTheme(attr);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    writeThemeCookie(next);
    onAfterToggle?.(next);
  };

  const isDark = theme === 'dark';
  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-overlay hover:text-fg',
        className
      )}
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -45, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        className="absolute inline-flex"
      >
        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </motion.span>
    </motion.button>
  );
}
