import type {
  RecordingSource,
  RecordingPreset,
  RecordingState,
} from "./limits";

export type RecordingVisibility = "public" | "workspace" | "private";

// Companion webcam stream state. Mirrors the screen file's `state`
// machine, plus a `'none'` sentinel for recordings without a camera.
export type WebcamState = "none" | "pending" | "ready" | "failed";

export type RecordingRow = {
  slug: string;
  deviceId: string;
  storageKey: string;
  posterKey: string | null;
  uploadId: string | null;
  sizeBytes: number;
  durationMs: number | null;
  width: number | null;
  height: number | null;
  source: RecordingSource;
  preset: RecordingPreset;
  createdAt: number;
  lastViewedAt: number;
  viewCount: number;
  title: string | null;
  state: RecordingState;
  // Owning user from better-auth (null for anonymous / pre-auth recordings).
  userId: string | null;
  // Workspace owning the recording, stamped at upload time so the viewer auth gate can check membership in one indexed lookup (no user_id → workspace_member hop). Null for legacy anonymous uploads.
  workspaceId: string | null;
  visibility: RecordingVisibility;
  // Companion webcam fields. The desktop uploads a parallel webcam WebM (video + mic audio); the web edit page composites it over the screen MP4 at play time.
  webcamStorageKey: string | null;
  webcamUploadId: string | null;
  webcamSizeBytes: number;
  webcamState: WebcamState;
};

export type InitRequest = {
  contentType: string;
  source: RecordingSource;
  preset?: RecordingPreset;
  durationMs?: number;
  width?: number;
  height?: number;
  title?: string;
  // Initial visibility for an authenticated upload. Ignored without a valid bearer token: anonymous uploads always land public, since there's no owner to gate against.
  visibility?: RecordingVisibility;
  // When true, /api/init reserves a second R2 multipart upload for a parallel webcam companion and returns `webcamUploadId` + `webcamStorageKey`. Omit / false for single-stream (no camera).
  hasWebcam?: boolean;
  // Target workspace for the new recording. The bearer user must be a member; on mismatch we silently fall back to their personal workspace so a stale client never blocks an upload. Omitted means personal workspace.
  workspaceId?: string;
};

/*
 * Single emoji reaction on a recording at a video timestamp. Since migration
 * 0010 reactions carry the user's better-auth id + display name; legacy
 * rows have nulls and render as "Anonymous".
 */
export type RecordingReaction = {
  id: number;
  slug: string;
  emoji: string;
  timestampMs: number;
  createdAt: number;
  userId: string | null;
  userName: string | null;
  // Joined from `users.image` at read time so an avatar swap shows up across existing reaction/comment rows without backfilling. Null for legacy anonymous rows + visitors with no avatar.
  userImage: string | null;
};

export type AddReactionRequest = {
  emoji: string;
  timestampMs: number;
};

export type AddReactionResponse = {
  reaction: RecordingReaction;
};

export type ListReactionsResponse = {
  reactions: RecordingReaction[];
};

/*
 * Free-form comment on a recording by a signed-in user. `timestampMs` is the
 * optional video offset the comment was anchored to (clicking the chip
 * seeks there). Stored in `recording_activity` with `kind='comment'`; see
 * migration 0012.
 */
export type RecordingComment = {
  id: number;
  slug: string;
  userId: string;
  userName: string;
  // Joined from `users.image` at read time — see RecordingReaction.userImage.
  userImage: string | null;
  body: string;
  createdAt: number;
  timestampMs: number | null;
};

export type AddCommentRequest = {
  body: string;
  timestampMs?: number | null;
};

export type AddCommentResponse = {
  comment: RecordingComment;
};

export type ListCommentsResponse = {
  comments: RecordingComment[];
};

export type InitResponse = {
  slug: string;
  uploadId: string;
  storageKey: string;
  // Present only when the request set `hasWebcam: true`. The desktop streams webcam parts to `/api/webcam-part?slug=…&part=N` against this uploadId.
  webcamUploadId?: string;
  webcamStorageKey?: string;
};

/*
 * Part uploads use native R2 bindings (no presigned URLs): the client
 * POSTs each chunk to /api/part?slug=...&part=N and the Worker forwards
 * it to R2. The response ETag must be echoed back in /api/finalize.
 */
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
