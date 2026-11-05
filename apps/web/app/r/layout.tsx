import type { Metadata } from "next";
import { AppI18n } from "@/components/app-i18n";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";
import { PRODUCT_NAME, SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getAppI18n();
  return {
    metadataBase: new URL(SITE_URL),
    title: fmt(m.viewer.meta.defaultTitle, { product: PRODUCT_NAME }),
    description: fmt(m.viewer.meta.defaultDescription, {
      product: PRODUCT_NAME,
    }),
    robots: { index: false, follow: false },
  };
}

export default function RecordingViewerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppI18n>{children}</AppI18n>;
}
