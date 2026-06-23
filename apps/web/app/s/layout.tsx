import type { Metadata } from 'next';
import { PRODUCT_NAME, SITE_URL } from '@/lib/site';

// noindex baseline for the viewer segment: user-generated screenshots must
// never land in organic search. Per-snap pages still emit their own OG.
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
