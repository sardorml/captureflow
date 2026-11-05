import type { Metadata } from "next";
import { AppI18n } from "@/components/app-i18n";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";
import { PRODUCT_NAME, SITE_URL } from "@/lib/site";

// noindex baseline for the viewer segment: user-generated screenshots must
// never land in organic search. Per-screenshot pages still emit their own OG.
export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getAppI18n();
  return {
    metadataBase: new URL(SITE_URL),
    title: fmt(m.screenshotView.page.defaultTitle, { product: PRODUCT_NAME }),
    description: fmt(m.screenshotView.page.description, {
      product: PRODUCT_NAME,
    }),
    robots: { index: false, follow: false },
  };
}

export default function ScreenshotViewerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return <AppI18n>{children}</AppI18n>;
}
