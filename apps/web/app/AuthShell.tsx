import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle, type Theme } from "@captureflow/ui";
import { AppIcon } from "@/components/brand-mark";

// A single card on the canvas: the app icon heads the card, the form fills
// it, legal line at the foot. The form owns its own width.
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
        <div className="bg-panel border-line w-full max-w-[424px] rounded-3xl border p-6 shadow-[0_8px_24px_-12px_rgb(30_41_59/0.1)] sm:p-8 dark:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.3)]">
          <Link
            href="/"
            aria-label="CaptureFlow home"
            className="mx-auto mb-5 flex w-fit"
          >
            <AppIcon size={44} />
          </Link>
          {children}
        </div>
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
