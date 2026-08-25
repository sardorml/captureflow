"use client";

import type { ReactNode } from "react";
import { SidebarDrawer } from "@/app/_components/SidebarDrawer";

export function DashboardShell({
  sidebar,
  header,
  children,
}: {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}) {
  // The shell owns scrolling (fixed-height layout, the main region scrolls) instead of
  // sticky-in-document-scroll: modals scroll-lock <body>, which turns it into a
  // scroll container and un-sticks sticky children mid-scroll.
  return (
    <div className="bg-canvas flex h-screen">
      <aside className="hidden h-screen w-60 shrink-0 overflow-hidden border-r border-line bg-canvas-2 md:block">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-canvas-2 px-4 md:px-6">
          {/* Below md the aside is hidden, so the drawer is the only way to
              reach the workspace switcher and the nav. */}
          <div className="md:hidden">
            <SidebarDrawer>{sidebar}</SidebarDrawer>
          </div>
          <div className="min-w-0 flex-1">{header}</div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1152px] p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
