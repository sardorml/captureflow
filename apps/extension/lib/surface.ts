import { sendMessage } from "./messaging";

/*
 * The recorder app renders on three surfaces: the in-page overlay iframe
 * (?overlay=1, the default UX), a standalone popup window (restricted-page
 * fallback), and the legacy anchored action popup. window.close() is a no-op
 * inside an iframe, so closing the overlay goes through the service worker.
 */
export const isOverlaySurface =
  new URLSearchParams(location.search).get("overlay") === "1";

export function closeSurface(): void {
  if (isOverlaySurface) {
    void sendMessage("closeRecorderOverlay", undefined);
  } else {
    window.close();
  }
}
