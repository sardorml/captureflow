import { onMessage, sendMessage } from "@/lib/messaging";
import { recordAndUpload, stopActiveRecording } from "@/lib/capture/recorder";

/*
 * getDisplayMedia runs here in an offscreen doc created with the DISPLAY_MEDIA
 * reason — the spec's user-activation requirement isn't enforced for offscreen
 * docs.
 */
onMessage("beginCapture", ({ data }) =>
  recordAndUpload(data, {
    onStatus: (status) => void sendMessage("recordingStatus", status),
    onResult: (result) => void sendMessage("recordingResult", result),
  }),
);

onMessage("stopCapture", () => stopActiveRecording());
