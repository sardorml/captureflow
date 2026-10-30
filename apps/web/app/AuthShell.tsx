import type { ReactNode } from "react";
import { ThemeToggle, type Theme } from "@captureflow/ui";

export function AuthShell({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 text-foreground md:p-10">
      <div className="absolute top-6 right-6">
        <ThemeToggle initialTheme={theme} />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
    </main>
  );
}
