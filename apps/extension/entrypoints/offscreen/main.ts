import { COUNTDOWN_SECONDS, onMessage, sendMessage } from "@/lib/messaging";
import { createRecordingTransport } from "@/lib/api/client";
import {
  NothingRecordedError,
  resumeRecordingUpload,
  type PendingUpload,
} from "@/lib/api/upload-streamer";
import {
  listLocalRecordings,
  openLocalRecording,
  removeLocalRecording,
} from "@/lib/capture/local-recording";
import {
  deleteActiveRecording,
  isRecording,
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
    onSurface: (surface) =>
      void sendMessage("capturedSurface", surface).catch(() => {}),
    onStatus: (status) => void sendMessage("recordingStatus", status),
    onFinalizing: (url) => {
      void stopBeep.play().catch(() => {});
      void sendMessage("finalizeStarted", url).catch(() => {});
    },
    onResult: (result) => void sendMessage("recordingResult", result),
    onActiveUpload: (upload) => void sendMessage("activeUploadChanged", upload),
    onUploadPending: (upload) => void sendMessage("uploadPending", upload),
  }),
);

/*
 * Uploads a crash or a dead connection left on this device. Each one waits
 * out an offline spell inside the uploader, so this can run for as long as
 * the document lives. Files no pending upload owns are leftovers and go.
 */
let resuming = false;

async function resumeUploads(uploads: PendingUpload[]): Promise<void> {
  if (resuming) return;
  resuming = true;
  try {
    if (!isRecording()) {
      const owned = new Set(uploads.map((u) => u.slug));
      for (const slug of await listLocalRecordings().catch(() => [])) {
        if (!owned.has(slug)) await removeLocalRecording(slug).catch(() => {});
      }
    }
    for (const upload of uploads) {
      try {
        const { url } = await resumeRecordingUpload(upload, {
          transport: createRecordingTransport(upload.deviceId, null),
          openFiles: openLocalRecording,
        });
        void sendMessage("uploadResumed", {
          slug: upload.slug,
          done: true,
          url,
        });
      } catch (err) {
        // Anything but an empty file stays: losing a recording is worse than retrying one.
        const done = err instanceof NothingRecordedError;
        void sendMessage("uploadResumed", { slug: upload.slug, done });
      }
    }
  } finally {
    resuming = false;
  }
}

onMessage("resumeUploads", ({ data }) => void resumeUploads(data));

onMessage("stopCapture", () => stopActiveRecording());
onMessage("pauseCapture", () => pauseActiveRecording());
onMessage("resumeCapture", () => resumeActiveRecording());
onMessage("restartCapture", () => restartActiveRecording());
onMessage("deleteCapture", () => deleteActiveRecording());
