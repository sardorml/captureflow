"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import {
  isThemePreference,
  THEME_COOKIE,
  type ThemePreference,
} from "@captureflow/ui";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Browsers silently drop a Domain set on a host without a public suffix
// (e.g. localhost), so only scope to the apex on captureflow.dev hosts.
function cookieDomainFor(hostname: string): string | null {
  if (hostname.endsWith(".captureflow.dev") || hostname === "captureflow.dev") {
    return ".captureflow.dev";
  }
  return null;
}

function writeThemeCookie(value: ThemePreference) {
  const domain = cookieDomainFor(window.location.hostname);
  const parts = [
    `${THEME_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${ONE_YEAR_SECONDS}`,
    "SameSite=Lax",
  ];
  if (domain) parts.push(`Domain=${domain}`);
  if (window.location.protocol === "https:") parts.push("Secure");
  document.cookie = parts.join("; ");
}

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

// "system" is a preference, not a paint value — resolve it here the same way
// the head script does.
function resolve(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readPreferenceCookie(): ThemePreference | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`),
  );
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  return isThemePreference(value) ? value : null;
}

/*
 * The theme row of the account menu: a label with the segmented control
 * inline, so switching doesn't cost a trip to settings. Sits outside
 * Dropdown.Menu — a menu item would close the popover on every press.
 */
export function ThemeSegments({
  initialPreference,
}: {
  initialPreference: ThemePreference;
}) {
  const [preference, setPreference] =
    useState<ThemePreference>(initialPreference);

  // The cookie is read on the server, but a toggle elsewhere on the page may
  // have written a new one since this rendered. Read the cookie, not the
  // attribute — the attribute can only ever show a resolved "system".
  useEffect(() => {
    const stored = readPreferenceCookie();
    if (stored) setPreference(stored);
  }, []);

  const choose = (next: ThemePreference) => {
    if (next === preference) return;
    const apply = () => {
      setPreference(next);
      document.documentElement.setAttribute("data-theme", resolve(next));
      writeThemeCookie(next);
    };
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    if (!reduceMotion && typeof doc.startViewTransition === "function") {
      doc.startViewTransition(apply);
    } else {
      apply();
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <span className="text-fg flex items-center gap-2 text-sm">
        <Palette size={16} className="text-fg-muted" />
        Theme
      </span>
      <div
        role="radiogroup"
        aria-label="Theme"
        className="bg-tint flex items-center gap-0.5 rounded-full p-0.5"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const on = value === preference;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={label}
              onClick={() => choose(value)}
              className={[
                "flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors motion-reduce:transition-none",
                on
                  ? "bg-panel-2 text-fg shadow-sm"
                  : "text-fg-muted hover:text-fg",
              ].join(" ")}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
