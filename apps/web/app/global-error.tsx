"use client";

import { RouteError } from "@/components/error-boundary";
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
    <html lang="en">
      <body>
        <RouteError error={error} reset={reset} />
      </body>
    </html>
  );
}
