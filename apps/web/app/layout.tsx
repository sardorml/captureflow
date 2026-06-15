import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { readThemeFromCookieHeader } from '@captureflow/ui';
import { SITE_URL } from '@/lib/site';
import './globals.css';
import './material-symbols-subset.css';

const SITE_DESCRIPTION =
  'Open-source, self-hostable screen recording and screenshots with instant shareable links.';

export const metadata: Metadata = {
  // Resolves relative OG/canonical URLs (e.g. /og-image.png) to absolute.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CaptureFlow',
    template: '%s · CaptureFlow',
  },
  description: SITE_DESCRIPTION,
  // Provenance canary: renders <meta name="generator" content="CaptureFlow"> on
  // every page. A distinctive, searchable marker (Shodan/Google) for spotting
  // unauthorised redeployments. Per AGPL-3.0 §7(b) this attribution is a
  // required legal notice — downstream operators must keep it.
  generator: 'CaptureFlow',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  // Default share card for the homepage + app surfaces. The /r and /s
  // viewers override openGraph in their own generateMetadata with the
  // per-share poster, so this is the fallback for everything else.
  openGraph: {
    type: 'website',
    siteName: 'CaptureFlow',
    title: 'CaptureFlow',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CaptureFlow — open-source screen recording with instant shareable links',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CaptureFlow',
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

// Brand colour for the mobile browser chrome / installed-PWA toolbar.
export const viewport: Viewport = {
  themeColor: '#2563eb',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Resolve the theme server-side from the cookie and stamp it on <html>
  // so the data-theme token set is correct on first paint (no flash, and
  // no falling through to the CSS dark default while the toggle says light).
  const theme = readThemeFromCookieHeader((await headers()).get('cookie'));
  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
