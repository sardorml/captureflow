import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle, type Theme } from "@captureflow/ui";
import { AppIcon } from "@/components/brand-mark";
import { SkyScene } from "@/components/marketing/sky-backdrop";

// A single card on open sky: the app icon heads the card, the form fills it,
// legal line at the foot. The form owns its own width.
export function AuthShell({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <main className="bg-canvas text-fg relative isolate flex min-h-screen flex-col items-center overflow-hidden px-6 py-10">
      {/* The landing's clouds pushed into the lower half under a clear blue,
          so the card sits on empty sky and the clouds roll beneath it. The
          host keeps the landing's height so the clouds keep their size. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#6db5ef_0%,#9fcdf4_45%,#d9ebfa_80%,var(--cf-canvas)_100%)] dark:bg-canvas dark:bg-none"
      >
        <div className="absolute inset-x-0 top-[38%] h-screen dark:top-0 dark:h-full">
          <SkyScene />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-canvas backdrop-blur-md [mask-image:linear-gradient(to_bottom,transparent,black_60%)]" />
      </div>
      <div className="absolute top-6 right-6">
        <ThemeToggle initialTheme={theme} />
      </div>

      <div className="flex w-full flex-1 items-center justify-center py-12">
        <div className="bg-panel border-line w-full max-w-[424px] rounded-3xl border p-6 shadow-[0_30px_80px_-24px_rgb(30_41_59/0.28)] sm:p-8 dark:shadow-[0_30px_80px_-24px_rgb(0_0_0/0.6)]">
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
