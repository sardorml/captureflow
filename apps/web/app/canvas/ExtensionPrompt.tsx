"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { AlertDialog, Button, buttonVariants } from "@heroui/react";
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
    <AlertDialog isOpen={isOpen} onOpenChange={setOpen}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container size="sm">
          <AlertDialog.Dialog>
            <AlertDialog.Header className="flex flex-col items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Video size={20} />
              </span>
              <AlertDialog.Heading>Record this canvas</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="text-sm text-fg-muted">
              Add the CaptureFlow extension to record your screen and camera
              while you draw, then share a link.
            </AlertDialog.Body>
            <AlertDialog.Footer className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onPress={() => setOpen(false)}
              >
                Not now
              </Button>
              <a
                href={CHROME_WEBSTORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                Add to Chrome
              </a>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
