import type { ReactNode } from "react";
import { ThemeToggle, type Theme } from "@captureflow/ui";
import { AuthCarousel } from "@/app/AuthCarousel";

// Split auth layout: branded visual panel (desktop only) + form panel.
// The visual panel is dark imagery in both themes, so its text colors are
// fixed rather than token-driven.
export function AuthShell({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside
        className="relative hidden w-1/2 overflow-hidden lg:flex"
        style={{ backgroundColor: "#050508" }}
      >
        <AuthCarousel />
      </aside>

      <main className="bg-canvas text-fg relative flex min-w-0 flex-1 items-center justify-center p-6">
        <div className="absolute top-6 right-6">
          <ThemeToggle initialTheme={theme} />
        </div>
        {children}
      </main>
    </div>
  );
}
