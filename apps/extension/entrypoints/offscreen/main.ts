import { onMessage, sendMessage } from "@/lib/messaging";
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
onMessage("beginCapture", ({ data }) =>
  recordAndUpload(data, {
    onStatus: (status) => void sendMessage("recordingStatus", status),
    onResult: (result) => void sendMessage("recordingResult", result),
    onActiveUpload: (upload) => void sendMessage("activeUploadChanged", upload),
  }),
);

onMessage("stopCapture", () => stopActiveRecording());
onMessage("pauseCapture", () => pauseActiveRecording());
onMessage("resumeCapture", () => resumeActiveRecording());
onMessage("restartCapture", () => restartActiveRecording());
onMessage("deleteCapture", () => deleteActiveRecording());
