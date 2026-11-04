import type { UploadStream } from "./recording-upload";

// The editor's audio lane: this many peaks over the recording, in order.
export const WAVEFORM_BUCKETS = 2000;

export type WaveformUpload = {
  track: UploadStream;
  peaks: number[];
};
