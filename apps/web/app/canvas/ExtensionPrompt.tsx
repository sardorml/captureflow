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
import { installedExtensionId } from "@/lib/extension-bridge";
import { CHROME_WEBSTORE_URL } from "@/lib/site";

// The extension stamps the page at document_idle, so give it a moment
// before deciding it isn't there.
const SETTLE_MS = 1500;

// Asks on every load without the extension; closing it lasts the page.
export function ExtensionPrompt() {
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
          <AlertDialogTitle>Record this canvas</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-sm text-fg-muted">
          Add the CaptureFlow extension to record your screen and camera while
          you draw, then share a link.
        </AlertDialogDescription>
        <AlertDialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Not now
          </Button>
          <a
            href={CHROME_WEBSTORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={buttonVariants({ size: "sm" })}
          >
            Add to Chrome
          </a>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
