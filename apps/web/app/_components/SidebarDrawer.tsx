"use client";

import { Button, Drawer } from "@heroui/react";
import { PanelLeft } from "lucide-react";
import { useState, type ReactNode } from "react";

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
        size="sm"
        isIconOnly
        aria-label="Open workspace menu"
        onPress={() => setOpen(true)}
      >
        <PanelLeft size={18} />
      </Button>
      <Drawer isOpen={open} onOpenChange={setOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            {/* w-60 matches the docked width in DashboardShell, so the panel is
                the same measure in both places. Sizing belongs on the dialog:
                Content is the inset-0 wrapper that positions it. p-0 drops the
                dialog's default p-6 — the sidebar brings its own insets, and
                w-60 has to measure the panel, not the panel plus a gutter. */}
            <Drawer.Dialog className="w-60 bg-canvas-2 p-0">
              <Drawer.Body>{children}</Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
