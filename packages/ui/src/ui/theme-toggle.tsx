"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "../lib/cn";
import { type Theme, THEME_COOKIE } from "../lib/theme";

type Props = {
  initialTheme: Theme;
  className?: string;
  onAfterToggle?: (next: Theme) => void;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Browsers silently drop a Domain set on a host without a public suffix
// (e.g. localhost), so only scope to the apex on captureflow.dev hosts.
function cookieDomainFor(hostname: string): string | null {
  if (hostname.endsWith(".captureflow.dev") || hostname === "captureflow.dev") {
    return ".captureflow.dev";
  }
  return null;
}

function writeThemeCookie(value: Theme) {
  const domain = cookieDomainFor(window.location.hostname);
  const isHttps = window.location.protocol === "https:";
  const parts = [
    `${THEME_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${ONE_YEAR_SECONDS}`,
    "SameSite=Lax",
  ];
  if (domain) parts.push(`Domain=${domain}`);
  if (isHttps) parts.push("Secure");
  document.cookie = parts.join("; ");
}

export function ThemeToggle({ initialTheme, className, onAfterToggle }: Props) {
  const [theme, setTheme] = React.useState<Theme>(initialTheme);

  React.useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") setTheme(attr);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    // An instant swap: colour transitions are held off for two frames so
    // nothing fades between the themes.
    root.setAttribute("data-theme-switching", "");
    setTheme(next);
    root.setAttribute("data-theme", next);
    writeThemeCookie(next);
    onAfterToggle?.(next);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.removeAttribute("data-theme-switching")),
    );
  };

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
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
