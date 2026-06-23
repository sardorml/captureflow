import type { Metadata } from "next";
import { PRODUCT_NAME, SITE_URL } from "@/lib/site";

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
