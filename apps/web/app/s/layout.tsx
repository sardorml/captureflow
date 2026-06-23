import type { Metadata } from 'next';
import { PRODUCT_NAME, SITE_URL } from '@/lib/site';

// Scoped layout for the public snap viewer (/s/<id>). The root layout owns
// <html>/<body>, fonts, theme, and globals.css, which a nested layout must not
// re-render, so this is metadata-only and renders children straight through.
//
// Per-snap pages emit their own dynamic OG (title + image) for social unfurls
// but stay noindex: these are user-generated screenshots and must never land in
// organic search. metadataBase resolves relative OG/canonical URLs against the
// public host; the noindex baseline is declared here at the segment level.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${PRODUCT_NAME} snap`,
  description: `A screenshot shared from ${PRODUCT_NAME}.`,
  robots: { index: false, follow: false },
};

export default function SnapViewerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return <>{children}</>;
}
