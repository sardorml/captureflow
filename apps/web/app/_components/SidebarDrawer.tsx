"use client";

import { PanelLeft } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarProvider } from "@/components/ui/sidebar";

/*
 * Puts the dashboard's own sidebar on the viewer pages without duplicating it:
 * the panel arrives as a slot, so the caller can pass the async server
 * component straight through and this stays a thin client shell around it.
 */
export function SidebarDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Open workspace menu"
        onClick={() => setOpen(true)}
      >
        <PanelLeft size={18} />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        {/* w-64 is the docked sidebar's width, so the panel is the same
            measure in both places. */}
        <SheetContent
          side="left"
          showCloseButton={false}
          className="gap-0 bg-sidebar p-0 data-[side=left]:w-64"
        >
          <SheetTitle className="sr-only">Workspace menu</SheetTitle>
          <SidebarProvider className="min-h-0 flex-1">
            {children}
          </SidebarProvider>
        </SheetContent>
      </Sheet>
    </>
  );
}
