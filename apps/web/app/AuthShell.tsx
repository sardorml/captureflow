import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle, type Theme } from "@captureflow/ui";
import { BrandMark } from "@/components/brand-mark";

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
        <BrandMark size={26} />
        <span className="text-fg text-base font-semibold">CaptureFlow</span>
      </Link>

      <div className="flex w-full flex-1 items-center justify-center py-12">
        {children}
      </div>

      <footer className="text-fg-muted text-[13px]">
        By continuing, you agree to CaptureFlow&rsquo;s{" "}
        <Link href="/terms" className="text-fg font-medium hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-fg font-medium hover:underline">
          Privacy
        </Link>
      </footer>
    </main>
  );
}
