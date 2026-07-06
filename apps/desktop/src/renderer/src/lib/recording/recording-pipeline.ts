import { createRecordPipeline } from "@captureflow/engine/web";
import { logRendererInfo, logRendererWarn } from "./recording-log";

export const RECORDING_CAP_MS = 300_000;

export const recordingPipeline = createRecordPipeline({
  frameEvents: (cb) => {
    window.electronAPI.onRecordingFrameEvent(cb);
  },
  output: (bytes) => {
    // Copy into a fresh ArrayBuffer so IPC's structured clone doesn't
    // transfer the larger buffer backing this Uint8Array view.
    const out = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(out).set(bytes);
    window.electronAPI.recordingPartScreen(out);
  },
  log: { info: logRendererInfo, warn: logRendererWarn },
  capMs: RECORDING_CAP_MS,
});
