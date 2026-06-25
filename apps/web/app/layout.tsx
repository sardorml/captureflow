import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { readThemeFromCookieHeader } from "@captureflow/ui";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
import { SITE_URL } from "@/lib/site";
import { AnalyticsProvider } from "./analytics-provider";
import { AntdProvider } from "./antd-provider";
import "./globals.css";
import "./material-symbols-subset.css";

const SITE_DESCRIPTION =
  "Open-source, self-hostable screen recording and screenshots with instant shareable links.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CaptureFlow",
    template: "%s · CaptureFlow",
  },
  description: SITE_DESCRIPTION,
  // Per AGPL-3.0 §7(b) this generator attribution is a required legal notice — downstream operators must keep it.
  generator: "CaptureFlow",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "CaptureFlow",
    title: "CaptureFlow",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CaptureFlow — open-source screen recording with instant shareable links",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CaptureFlow",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const theme = readThemeFromCookieHeader((await headers()).get("cookie"));
  return (
    <html lang="en" data-theme={theme} className={inter.variable}>
      <body>
        <AnalyticsProvider />
        <AntdProvider initialTheme={theme}>{children}</AntdProvider>
      </body>
    </html>
  );
}
