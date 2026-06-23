import type { Metadata } from 'next';
import { PRODUCT_NAME, SITE_URL } from '@/lib/site';

// Scoped layout for the public share viewer (/r/<id>). The root layout owns
// <html>/<body>, fonts, theme, and globals.css, so this nested layout is
// metadata-only and must not re-render them.
//
// metadataBase resolves relative OG/canonical URLs against the public root host.
// Per-share pages override title + OG via their own generateMetadata; this base
// only governs metadataBase resolution and the not-found fallback under /r.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${PRODUCT_NAME} share`,
  description: `A screen recording shared from ${PRODUCT_NAME}.`,
  robots: { index: false, follow: false },
};

export default function ShareViewerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
