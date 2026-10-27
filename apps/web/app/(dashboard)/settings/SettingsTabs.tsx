"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SettingsTab = { id: string; label: string; content: ReactNode };

// Plain buttons: HeroUI's tab list centres and scrolls its items, which is
// wrong for an underlined row that sits flush left.
export function SettingsTabs({ tabs }: { tabs: SettingsTab[] }) {
  const [tab, setTab] = useState(tabs[0]?.id);
  const active = tabs.find((t) => t.id === tab) ?? tabs[0];
  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex gap-6 border-b border-line"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active?.id === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px h-10 border-b-2 text-base font-medium transition-colors",
              active?.id === t.id
                ? "border-accent text-accent"
                : "border-transparent text-fg-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="flex flex-col gap-6">
        {active?.content}
      </div>
    </div>
  );
}
