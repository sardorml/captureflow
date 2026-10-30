import { DEFAULT_THEME, THEME_INIT_HTML } from "@captureflow/ui/theme";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
import { AnalyticsProvider } from "./analytics-provider";
import { DevTools } from "@/components/dev/dev-tools";
import { SITE_URL, X_CREATOR } from "@/lib/site";
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
    // SVG first so the tab mark matches the navbar and follows the browser
    // theme; the .ico stays as the fallback for browsers that ignore SVG.
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "CaptureFlow",
    title: "CaptureFlow",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "CaptureFlow: record your screen, share a link, get feedback",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CaptureFlow",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png?v=3"],
    creator: X_CREATOR,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

/*
 * No cookie read here: it would make every route dynamic, marketing pages
 * included. The init script applies the visitor's theme before first paint.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /* suppressHydrationWarning: the init script below may change data-theme
       before React ever sees it. */
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      className={inter.variable}
      suppressHydrationWarning
    >
      <body>
        {/* First thing in the body, so it resolves a "system" preference before
            anything paints. */}
        <div hidden dangerouslySetInnerHTML={{ __html: THEME_INIT_HTML }} />
        <AnalyticsProvider />
        <DevTools />
        {children}
      </body>
    </html>
  );
}
