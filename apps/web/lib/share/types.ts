import type { ShareSource, SharePreset, ShareState } from './limits';

export type ShareVisibility = 'public' | 'workspace' | 'private';

// Companion webcam stream state. Mirrors the canonical `state` machine
// for the screen file, plus a `'none'` sentinel for recordings taken
// without a camera (no companion file uploads).
export type WebcamState = 'none' | 'pending' | 'ready' | 'failed';

export type ShareRow = {
  slug: string;
  deviceId: string;
  storageKey: string;
  posterKey: string | null;
  uploadId: string | null;
  sizeBytes: number;
  durationMs: number | null;
  width: number | null;
  height: number | null;
  source: ShareSource;
  preset: SharePreset;
  createdAt: number;
  lastViewedAt: number;
  viewCount: number;
  title: string | null;
  state: ShareState;
  // Owning user from better-auth (null for anonymous / pre-auth shares).
  userId: string | null;
  // Personal workspace the owning user belongs to. Stamped at upload
  // time so the viewer auth gate can answer "is this signed-in user a
  // member of the workspace that owns this share?" in one indexed
  // lookup, without going user_id → workspace_member. Null for legacy
  // anonymous uploads (no user → no workspace).
  workspaceId: string | null;
  visibility: ShareVisibility;
  // Companion webcam fields. The desktop uploads a parallel webcam
  // WebM (video + mic audio) at `webcamStorageKey`; the web edit page
  // composites it on top of the screen MP4 at play time.
  webcamStorageKey: string | null;
  webcamUploadId: string | null;
  webcamSizeBytes: number;
  webcamState: WebcamState;
};

export type InitRequest = {
  contentType: string;
  source: ShareSource;
  preset?: SharePreset;
  durationMs?: number;
  width?: number;
  height?: number;
  title?: string;
  // Initial visibility for an authenticated upload. Ignored when the
  // bearer token is missing/invalid (anonymous uploads always land
  // public — there's no owner to gate against).
  visibility?: ShareVisibility;
  // True when the desktop will stream a parallel webcam companion to
  // `/api/webcam-part` alongside the screen file. When set, /api/init
  // reserves a second R2 multipart upload and the response carries
  // `webcamUploadId` + `webcamStorageKey`. Omitting / false keeps the
  // single-stream behaviour for recordings taken without a camera.
  hasWebcam?: boolean;
  // Target workspace for the new share. The bearer user must be a
  // member; on mismatch we silently fall back to their personal
  // workspace so a stale client never blocks an upload. Omitting it
  // means "personal workspace" (today's behaviour).
  workspaceId?: string;
};

// Single emoji reaction on a share at a specific video timestamp. As
// of migration 0010 reactions carry the reacting user's better-auth
// id + display name. Legacy rows (pre-migration) have nulls and
// render as "Anonymous" on the activity sidebar.
export type ShareReaction = {
  id: number;
  slug: string;
  emoji: string;
  timestampMs: number;
  createdAt: number;
  userId: string | null;
  userName: string | null;
  // Joined from `users.image` at read time so an avatar swap on app-web
  // shows up across every existing reaction/comment row without
  // backfilling. Null for legacy anonymous rows + visitors who haven't
  // uploaded an avatar.
  userImage: string | null;
};

export type AddReactionRequest = {
  emoji: string;
  timestampMs: number;
};

export type AddReactionResponse = {
  reaction: ShareReaction;
};

export type ListReactionsResponse = {
  reactions: ShareReaction[];
};

// Free-form comment on a share, authored by a signed-in user.
// `timestampMs` is the optional video offset the comment was anchored
// to (clicking the chip seeks the player there). Comments live in
// `share_activity` with `kind='comment'`; see migration 0012.
export type ShareComment = {
  id: number;
  slug: string;
  userId: string;
  userName: string;
  // Joined from `users.image` at read time — see ShareReaction.userImage.
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
  comment: ShareComment;
};

export type ListCommentsResponse = {
  comments: ShareComment[];
};

export type InitResponse = {
  slug: string;
  uploadId: string;
  storageKey: string;
  // Only present when the request set `hasWebcam: true`. Mirrors the
  // screen-side fields above; the desktop streams webcam parts to
  // `/api/webcam-part?slug=…&part=N` referencing this uploadId.
  webcamUploadId?: string;
  webcamStorageKey?: string;
};

// Part uploads use native R2 bindings (no presigned URLs). The desktop
// client POSTs each chunk's bytes directly to /api/part?slug=...&part=N
// and the Worker forwards them to R2. The response carries the ETag
// the client must echo back in /api/finalize.
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

export type ShareApiError = {
  error: string;
  code?: string;
};
