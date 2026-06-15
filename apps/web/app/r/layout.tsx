import type { Metadata } from 'next';
import { PRODUCT_NAME, SITE_URL } from '@/lib/site';

// Scoped layout for the public share viewer (/r/<id>). The root
// layout already owns <html>/<body>, fonts, theme, and globals.css —
// a nested layout must not re-render those, so this is metadata-only
// and renders children straight through.
//
// metadataBase resolves against the public root host (captureflow.xyz)
// where the viewer lives — so any relative OG/canonical URLs resolve
// against the right origin. Per-share pages override title + OG with their own
// dynamic generateMetadata (poster + headline); this base only governs
// metadataBase resolution and the not-found fallback.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${PRODUCT_NAME} share`,
  description: `A screen recording shared from ${PRODUCT_NAME}.`,
  // Per-share pages emit their own OG (poster + title); this root
  // metadata only applies to the not-found surface under /r, where
  // there's no public share to advertise.
  robots: { index: false, follow: false },
};

export default function ShareViewerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
