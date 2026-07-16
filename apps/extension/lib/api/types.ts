/*
 * Wire types for the recording upload protocol (`/api/r/*`), a deliberate copy of
 * the web app's `lib/recording/types.ts` (extension depends on zero
 * `@captureflow/*` packages). Must stay wire-compatible — change both sides.
 */

export type RecordingSource = "instant" | "edited";
export type RecordingPreset = "recording";
export type RecordingVisibility = "public" | "workspace" | "private";

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
};

export type InitResponse = {
  slug: string;
  uploadId: string;
  storageKey: string;
  webcamUploadId?: string;
  webcamStorageKey?: string;
};

export type PartResponse = {
  partNumber: number;
  etag: string;
};

export type FinalizeRequest = {
  slug: string;
  parts: { partNumber: number; etag: string }[];
  sizeBytes: number;
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
  abort(req: AbortRequest): Promise<void>;
  state(slug: string): Promise<StateResponse>;
  viewUrl(slug: string): string;
};
