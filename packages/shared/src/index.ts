/** Shared types & constants for CaptureFlow (desktop recorder + web/cloud). */

export const APP_NAME = "CaptureFlow";

/** How widely a recording can be viewed via its share link. */
export type RecordingVisibility = "public" | "unlisted" | "private";

/** A single uploaded recording's metadata — stored in D1, referenced by share links. */
export interface Recording {
  id: string;
  title: string;
  /** Unix epoch milliseconds. */
  createdAt: number;
  durationMs: number;
  /** R2 object key for the muxed mp4. */
  objectKey: string;
  visibility: RecordingVisibility;
  /** Owner user id, or null for anonymous self-host uploads. */
  ownerId: string | null;
}

/** Canonical share path for a recording id — keep all link construction here. */
export function sharePath(id: string): string {
  return `/r/${id}`;
}
