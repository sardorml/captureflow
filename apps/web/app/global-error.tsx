"use client";

import { DEFAULT_THEME, THEME_INIT_HTML } from "@captureflow/ui/theme";
import { RouteError } from "@/components/route-error";
import "./globals.css";

// Only when the root layout itself fails; it replaces that layout, so it brings its own document.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <body>
        {/* The visitor's theme, as the root layout applies it, so an error never flips the page to light. */}
        <div hidden dangerouslySetInnerHTML={{ __html: THEME_INIT_HTML }} />
        <RouteError error={error} reset={reset} />
      </body>
    </html>
  );
}
