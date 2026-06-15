import type { Metadata } from 'next';
import { PRODUCT_NAME, SITE_URL } from '@/lib/site';

// Scoped layout for the public snap viewer (/s/<id>), mirroring app/r/layout.tsx
// for the share viewer. The root app-web layout owns <html>/<body>, fonts,
// theme, and globals.css — a nested layout must not re-render those, so this is
// metadata-only and renders children straight through.
//
// Like /r, per-snap pages emit their own dynamic OG (title + image) for social
// unfurls but stay noindex: these are user-generated screenshots and must never
// land in organic search. This base sets metadataBase so relative OG/canonical
// URLs resolve against the public host, declares the noindex baseline at the
// segment level, and provides the not-found fallback copy.
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
