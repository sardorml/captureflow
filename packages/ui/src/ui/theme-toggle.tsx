"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "../lib/cn";
import { applyTheme, type Theme } from "../lib/theme";

type Labels = { toLight: string; toDark: string };

type Props = {
  initialTheme: Theme;
  className?: string;
  onAfterToggle?: (next: Theme) => void;
  labels?: Labels;
};

const ENGLISH_LABELS: Labels = {
  toLight: "Switch to light theme",
  toDark: "Switch to dark theme",
};

export function ThemeToggle({
  initialTheme,
  className,
  onAfterToggle,
  labels = ENGLISH_LABELS,
}: Props) {
  const [theme, setTheme] = React.useState<Theme>(initialTheme);

  // Follows <html>, since another control can change the theme too.
  React.useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const attr = root.getAttribute("data-theme");
      if (attr === "light" || attr === "dark") setTheme(attr);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    onAfterToggle?.(next);
  };

  const isDark = theme === "dark";
  const label = isDark ? labels.toLight : labels.toDark;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-md text-fg-muted transition duration-150 ease-out hover:scale-[1.04] hover:bg-overlay hover:text-fg active:scale-[0.92] motion-reduce:transition-none",
        className,
      )}
    >
      {/* Keyed so the incoming icon remounts and plays its entrance. */}
      <span
        key={isDark ? "moon" : "sun"}
        className="animate-theme-icon-in absolute inset-0 inline-flex items-center justify-center motion-reduce:animate-none"
      >
        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </span>
    </button>
  );
}
