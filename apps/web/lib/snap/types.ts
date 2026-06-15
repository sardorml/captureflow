// Persisted shape of a snap row. Camel-case at the boundary; the
// snake_case columns live only inside db.ts.

export type SnapState = 'ready' | 'deleted';

// Mirrors shares.visibility — defaults to 'public' for parity with the
// pre-workspace snap behavior (every snap link was unauthenticated).
export type SnapVisibility = 'public' | 'workspace' | 'private';

export type SnapRow = {
  id: string;
  userId: string;
  // Owner's personal workspace at upload time. Stamped so the viewer
  // auth gate can resolve workspace-membership without joining through
  // users. Null only for legacy rows uploaded before the workspaces
  // migration backfilled this column.
  workspaceId: string | null;
  deviceId: string | null;
  storageKey: string;
  sizeBytes: number;
  width: number;
  height: number;
  title: string | null;
  state: SnapState;
  visibility: SnapVisibility;
  createdAt: number;
  updatedAt: number;
  editedAt: number | null;
  lastViewedAt: number | null;
  viewCount: number;
};

// Wire shapes — what the API returns to the desktop / web clients.

export type UploadResponse = {
  id: string;
  viewUrl: string;
  editUrl: string;
};

export type SnapApiError = {
  error: string;
  code?: string;
};
