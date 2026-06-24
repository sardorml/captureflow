// Wire types for the share upload protocol (`/api/r/*`), forked from the web
// app's `lib/share/types.ts`. The extension depends on zero `@captureflow/*`
// packages (desktop precedent), so these are a deliberate copy and must stay
// wire-compatible with the server — change both sides together.

export type ShareSource = "instant" | "edited";
export type SharePreset = "share";
export type ShareVisibility = "public" | "workspace" | "private";

export type InitRequest = {
  contentType: string;
  source: ShareSource;
  preset?: SharePreset;
  durationMs?: number;
  width?: number;
  height?: number;
  title?: string;
  visibility?: ShareVisibility;
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

export type ShareApiError = {
  error: string;
  code?: string;
};

// The streamer's I/O contract. `lib/api/client.ts` provides the HTTP-backed
// implementation; tests inject an in-memory fake. finalizeWebcam returns void —
// the webcam is best-effort, so its `{ ok }` body is unused.
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
};
