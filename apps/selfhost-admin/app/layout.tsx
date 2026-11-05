import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import {
  THEME_INIT_HTML,
  readThemeFromCookieHeader,
} from "@captureflow/ui/theme";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookie = (await headers()).get("cookie");
  return (
    /* suppressHydrationWarning: data-theme is the server's guess for a
       "system" preference; the init script corrects it before paint. */
    <html
      lang="en"
      data-theme={readThemeFromCookieHeader(cookie)}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground">
        <div hidden dangerouslySetInnerHTML={{ __html: THEME_INIT_HTML }} />
        {children}
      </body>
    </html>
  );
}
