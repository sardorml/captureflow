export type ScreenshotState = "ready" | "deleted";

export type ScreenshotVisibility = "public" | "workspace" | "private";

export type ScreenshotRow = {
  id: string;
  userId: string;
  workspaceId: string | null;
  deviceId: string | null;
  storageKey: string;
  sizeBytes: number;
  width: number;
  height: number;
  title: string | null;
  state: ScreenshotState;
  visibility: ScreenshotVisibility;
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

export type ScreenshotApiError = {
  error: string;
  code?: string;
};
