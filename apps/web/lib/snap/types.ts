export type SnapState = 'ready' | 'deleted';

export type SnapVisibility = 'public' | 'workspace' | 'private';

export type SnapRow = {
  id: string;
  userId: string;
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

export type UploadResponse = {
  id: string;
  viewUrl: string;
  editUrl: string;
};

export type SnapApiError = {
  error: string;
  code?: string;
};
