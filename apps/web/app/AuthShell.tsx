import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle, type Theme } from "@captureflow/ui";

/* eslint-disable @next/next/no-img-element */

// Single centered column: wordmark at the top, the form vertically centered
// under it. The form owns its own width cap.
export function AuthShell({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <main className="bg-canvas text-fg relative flex min-h-screen flex-col items-center px-6 py-10">
      <div className="absolute top-6 right-6">
        <ThemeToggle initialTheme={theme} />
      </div>

      <Link href="/" className="flex items-center gap-2.5">
        <img
          src="/logo-round.png"
          alt=""
          width={26}
          height={26}
          className="rounded-lg"
        />
        <span className="text-fg text-base font-semibold">CaptureFlow</span>
      </Link>

      <div className="flex w-full flex-1 items-center justify-center py-12">
        {children}
      </div>
    </main>
  );
}
