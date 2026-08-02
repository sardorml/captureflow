"use client";

import type { ReactNode } from "react";

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
    <div className="flex h-screen">
      <aside className="hidden h-screen w-60 shrink-0 overflow-hidden border-r border-line bg-canvas-2 md:block">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-line bg-canvas-2 px-6">
          {header}
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[920px] p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
