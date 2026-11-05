/*
 * What a recording was made from, sent with finalize so a recording that
 * came out wrong (no sound, no camera) can be traced to the device the user
 * picked and what the browser did with it.
 */
export type CaptureDevice = {
  requested: boolean;
  acquired: boolean;
  deviceId?: string;
  label?: string;
  sampleRate?: number;
  channelCount?: number;
};

export type CaptureAudio =
  | {
      muxed: "aac" | "opus";
      sampleRate: number;
      channelCount: number;
      bitrate: number;
    }
  | { muxed: "webcam" }
  | { muxed: "none"; reason: string };

export type CaptureReport = {
  userAgent: string;
  surface: string | null;
  camera: CaptureDevice;
  mic: CaptureDevice;
  audio: CaptureAudio;
  warnings: string[];
};
