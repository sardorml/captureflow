"use client";

import { Video } from "lucide-react";
import { Button } from "@heroui/react";
import { installedExtensionId, openRecorder } from "@/lib/extension-bridge";
import { CHROME_WEBSTORE_URL } from "@/lib/marketing/constants";

/*
 * Recording happens in the extension, so this hands off to it — and when
 * nothing answers, the extension isn't installed and the store listing is the
 * next step rather than a dead button.
 */
export function RecordButton({
  label,
  fullWidth = false,
}: {
  label: string;
  fullWidth?: boolean;
}) {
  const start = () => {
    const extId = installedExtensionId();
    if (extId) {
      void openRecorder(extId);
      return;
    }
    /*
     * Opened straight out of the press rather than after an await: a
     * window.open that lands outside the gesture is what a popup blocker eats.
     */
    if (CHROME_WEBSTORE_URL) {
      window.open(CHROME_WEBSTORE_URL, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Button variant="primary" fullWidth={fullWidth} onPress={start}>
      <Video size={16} />
      {label}
    </Button>
  );
}
