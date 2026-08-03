import type { RecordingStatus } from "../storage";

// Kinds where the capture pipeline holds the devices, so nothing else may open
// them and no session may be dropped out from under an upload.
export const LIVE_KINDS: ReadonlySet<RecordingStatus["kind"]> = new Set([
  "preparing",
  "recording",
  "paused",
  "uploading",
]);
