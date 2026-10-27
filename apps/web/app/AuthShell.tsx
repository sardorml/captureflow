import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle, type Theme } from "@captureflow/ui";

// One column on the bare canvas: the form in the middle, legal links at the
// foot. The form owns its own width.
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

      <div className="flex w-full flex-1 items-center justify-center py-12">
        {children}
      </div>

      <footer className="text-fg-muted flex gap-6 text-[13px]">
        <Link href="/terms" className="hover:text-fg">
          Terms
        </Link>
        <Link href="/privacy" className="hover:text-fg">
          Privacy Policy
        </Link>
      </footer>
    </main>
  );
}
