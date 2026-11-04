import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import {
  THEME_INIT_HTML,
  readThemeFromCookieHeader,
} from "@captureflow/ui/theme";
import { readEnv } from "@/lib/env";
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
  const appUrl = readEnv()?.APP_URL ?? "/";
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
        <header className="border-b border-line">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
            <Link href="/" className="font-semibold text-fg-strong">
              CaptureFlow admin
            </Link>
            <a
              href={`${appUrl}/dashboard`}
              className="text-sm text-fg-muted hover:text-fg"
            >
              Back to the app
            </a>
          </div>
        </header>
        <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
