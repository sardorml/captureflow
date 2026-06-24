import { onMessage, sendMessage } from "@/lib/messaging";
import { recordAndUpload, stopActiveRecording } from "@/lib/capture/recorder";

// getDisplayMedia (Chrome's native Screen/Window/Tab picker) runs here, in an
// offscreen document created with the DISPLAY_MEDIA reason — the spec's
// user-activation requirement isn't enforced for offscreen docs. The recorder
// streams chunks straight into the multipart share upload.
onMessage("beginCapture", ({ data }) =>
  recordAndUpload(data, {
    onStatus: (status) => void sendMessage("recordingStatus", status),
    onResult: (result) => void sendMessage("recordingResult", result),
  }),
);

onMessage("stopCapture", () => stopActiveRecording());
