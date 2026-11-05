"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppMessages } from "@/components/app-i18n-provider";
import { installedExtensionId } from "@/lib/extension-bridge";
import { CHROME_WEBSTORE_URL } from "@/lib/site";

// The extension stamps the page at document_idle, so give it a moment
// before deciding it isn't there.
const SETTLE_MS = 1500;
// A long label wraps inside its half of the footer instead of touching the edge.
const WRAPPING_BUTTON = "h-auto min-h-7 py-1 text-center whitespace-normal";

// Asks on every load without the extension; closing it lasts the page.
export function ExtensionPrompt() {
  const m = useAppMessages();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (!CHROME_WEBSTORE_URL) return;
    const id = window.setTimeout(() => {
      if (!installedExtensionId()) setOpen(true);
    }, SETTLE_MS);
    return () => window.clearTimeout(id);
  }, []);

  if (!CHROME_WEBSTORE_URL) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader className="flex flex-col items-start gap-3 text-left">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-accent-strong">
            <Video size={20} />
          </span>
          <AlertDialogTitle>{m.canvas.extensionPrompt.title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-sm text-fg-muted">
          {m.canvas.extensionPrompt.description}
        </AlertDialogDescription>
        <AlertDialogFooter className="flex flex-row justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            className={WRAPPING_BUTTON}
            onClick={() => setOpen(false)}
          >
            {m.canvas.extensionPrompt.dismiss}
          </Button>
          <a
            href={CHROME_WEBSTORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ size: "sm" }), WRAPPING_BUTTON)}
          >
            {m.canvas.extensionPrompt.install}
          </a>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
