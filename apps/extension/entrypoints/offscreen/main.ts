import { COUNTDOWN_SECONDS, onMessage, sendMessage } from "@/lib/messaging";
import {
  deleteActiveRecording,
  pauseActiveRecording,
  recordAndUpload,
  restartActiveRecording,
  resumeActiveRecording,
  stopActiveRecording,
} from "@/lib/capture/recorder";

/*
 * getDisplayMedia runs here in an offscreen doc created with the DISPLAY_MEDIA
 * reason — the spec's user-activation requirement isn't enforced for offscreen
 * docs.
 */
/*
 * One beep per visual tick, played here rather than in the page: no autoplay
 * gate, and cancelling on resolve guarantees nothing bleeds into the first
 * recorded frame. Scheduled off countdownStarted (the overlay's actual mount)
 * so the beeps line up with the numerals, not with the message round-trip.
 */
const beep = new Audio(chrome.runtime.getURL("/countdown-beep.mp3"));
const stopBeep = new Audio(chrome.runtime.getURL("/stop-beep.mp3"));
let beepTimers: number[] = [];

function cancelBeeps(): void {
  for (const timer of beepTimers) clearTimeout(timer);
  beepTimers = [];
  beep.pause();
}

onMessage("countdownStarted", () => {
  cancelBeeps();
  beepTimers = Array.from({ length: COUNTDOWN_SECONDS }, (_, i) =>
    window.setTimeout(() => {
      beep.currentTime = 0;
      void beep.play().catch(() => {});
    }, i * 1000),
  );
});

onMessage("beginCapture", ({ data }) =>
  recordAndUpload(data, {
    onCountdown: async () => {
      try {
        return await sendMessage("runCountdown", undefined);
      } finally {
        cancelBeeps();
      }
    },
    onStatus: (status) => void sendMessage("recordingStatus", status),
    onFinalizing: (url) => {
      void stopBeep.play().catch(() => {});
      void sendMessage("finalizeStarted", url).catch(() => {});
    },
    onResult: (result) => void sendMessage("recordingResult", result),
    onActiveUpload: (upload) => void sendMessage("activeUploadChanged", upload),
  }),
);

onMessage("stopCapture", () => stopActiveRecording());
onMessage("pauseCapture", () => pauseActiveRecording());
onMessage("resumeCapture", () => resumeActiveRecording());
onMessage("restartCapture", () => restartActiveRecording());
onMessage("deleteCapture", () => deleteActiveRecording());
