import type { ReactNode } from "react";
import type { Theme } from "@captureflow/ui";
import { AppI18n } from "@/components/app-i18n";
import { AppThemeToggle } from "@/components/app-theme-toggle";
import { LanguagePreference } from "@/components/language-preference";

export function AuthShell({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <AppI18n>
      <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 text-foreground md:p-10">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <LanguagePreference />
          <AppThemeToggle initialTheme={theme} />
        </div>
        <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
      </main>
    </AppI18n>
  );
}
