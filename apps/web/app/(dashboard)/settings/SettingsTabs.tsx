"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TabId = "general" | "access";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "access", label: "Access" },
];

// Plain buttons: HeroUI's tab list centres and scrolls its items, which is
// wrong for an underlined row that sits flush left.
export function SettingsTabs({
  general,
  access,
}: {
  general: ReactNode;
  access?: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("general");
  const tabs = access ? TABS : TABS.filter((t) => t.id === "general");
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
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px h-10 border-b-2 text-base font-medium transition-colors",
              tab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-fg-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="flex flex-col gap-6">
        {tab === "access" && access ? access : general}
      </div>
    </div>
  );
}
