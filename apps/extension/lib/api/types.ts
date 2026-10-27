/*
 * Wire types for the recording upload protocol (`/api/r/*`), a deliberate copy of
 * the web app's `lib/recording/types.ts` (extension depends on zero
 * `@captureflow/*` packages). Must stay wire-compatible — change both sides.
 */

import type { RecordingQualityId } from "@captureflow/engine";

export type RecordingSource = "instant" | "edited";
export type RecordingPreset = "recording";
export type RecordingVisibility = "public" | "workspace" | "private";
export type RecordingClient = "extension" | "desktop";
export type RecordingCaptureSource = "tab" | "window" | "screen";

export type InitRequest = {
  contentType: string;
  source: RecordingSource;
  preset?: RecordingPreset;
  durationMs?: number;
  width?: number;
  height?: number;
  title?: string;
  visibility?: RecordingVisibility;
  hasWebcam?: boolean;
  workspaceId?: string;
  // What made the recording and how, for the admin's usage view.
  client?: RecordingClient;
  captureSource?: RecordingCaptureSource;
  quality?: RecordingQualityId;
};

/*
 * `remainingBytes` is how far this recording may grow before it hits its
 * ceiling, and `maxDurationMs` how long it may run; the client stops itself
 * at both. Absent means uncapped, which is a paid workspace or a dev device.
 * `maxQuality` is the highest preset the workspace may record at.
 */
export type InitResponse = {
  slug: string;
  uploadId: string;
  storageKey: string;
  remainingBytes?: number;
  maxDurationMs?: number;
  maxQuality?: RecordingQualityId;
  webcamUploadId?: string;
  webcamStorageKey?: string;
};

// The limits probe (GET /api/r/usage), read before a recording starts.
export type UsageResponse = {
  usedBytes: number;
  limitBytes: number;
  capReached: boolean;
  isDev: boolean;
  tier: "free" | "team";
  maxDurationMs: number | null;
  maxQuality: RecordingQualityId | null;
};

export type PartResponse = {
  partNumber: number;
  etag: string;
};

export type FinalizeRequest = {
  slug: string;
  parts: { partNumber: number; etag: string }[];
  sizeBytes: number;
  durationMs?: number;
};

export type FinalizeResponse = {
  url: string;
};

export type AbortRequest = {
  slug: string;
};

export type RecordingApiError = {
  error: string;
  code?: string;
};

/*
 * The recorder uploads the mic as short standalone audio chunks
 * (POST /api/r/audio-part) and then asks the server to transcribe them with
 * the chunk layout. Times are recording time in milliseconds (pauses
 * removed), the same clock as `durationMs`.
 */
export type TranscribeRequest = {
  slug: string;
  language?: string;
  parts: { partNumber: number; startMs: number; endMs: number }[];
};

// The no-auth probe: /api/r/state answers "ready" once a finalize has been
// applied, letting the client treat a finalize lost to the network as success.
export type StateResponse = {
  state: string;
};

// finalizeWebcam returns void: the webcam is best-effort, so its `{ ok }` body
// is unused.
export type UploadTransport = {
  init(req: InitRequest): Promise<InitResponse>;
  uploadScreenPart(
    slug: string,
    partNumber: number,
    bytes: Uint8Array,
  ): Promise<PartResponse>;
  uploadWebcamPart(
    slug: string,
    partNumber: number,
    bytes: Uint8Array,
  ): Promise<PartResponse>;
  finalizeScreen(req: FinalizeRequest): Promise<FinalizeResponse>;
  finalizeWebcam(req: FinalizeRequest): Promise<void>;
  uploadPoster(slug: string, bytes: Uint8Array): Promise<void>;
  uploadPosterCard(slug: string, bytes: Uint8Array): Promise<void>;
  uploadAudioPart(
    slug: string,
    partNumber: number,
    bytes: Uint8Array,
  ): Promise<void>;
  transcribe(req: TranscribeRequest): Promise<void>;
  abort(req: AbortRequest): Promise<void>;
  state(slug: string): Promise<StateResponse>;
  viewUrl(slug: string): string;
};
