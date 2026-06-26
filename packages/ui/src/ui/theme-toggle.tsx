"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/cn";
import { type Theme, THEME_COOKIE } from "../lib/theme";

type Props = {
  initialTheme: Theme;
  className?: string;
  onAfterToggle?: (next: Theme) => void;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Browsers silently drop a Domain set on a host without a public suffix
// (e.g. localhost), so only scope to the apex on captureflow.xyz hosts.
function cookieDomainFor(hostname: string): string | null {
  if (hostname.endsWith(".captureflow.xyz") || hostname === "captureflow.xyz") {
    return ".captureflow.xyz";
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
    const apply = () => {
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
      writeThemeCookie(next);
      onAfterToggle?.(next);
    };
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Left-to-right wipe via the View Transitions API (the animation lives in
    // the app's global CSS, keyed off ::view-transition-*(root)). Falls back to
    // an instant swap where the API is unavailable or reduced motion is on.
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    if (!reduceMotion && typeof doc.startViewTransition === "function") {
      doc.startViewTransition(apply);
    } else {
      apply();
    }
  };

  const isDark = theme === "dark";
  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-overlay hover:text-fg",
        className,
      )}
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -45, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className="absolute inset-0 inline-flex items-center justify-center"
      >
        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </motion.span>
    </motion.button>
  );
}
