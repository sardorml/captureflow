import { WEB_BASE } from "../config";
import { parseResponse, recordingHeaders } from "./client";

// The screenshot domain (`/api/s/*`) is deliberately forked from recording on
// the server; the extension only needs its single-shot upload.
export type ScreenshotUploadResponse = {
  id: string;
  viewUrl: string;
  editUrl: string;
};

export type ScreenshotUploadInput = {
  png: Blob;
  width: number;
  height: number;
  title?: string;
};

export async function uploadScreenshot(
  deviceId: string,
  token: string,
  input: ScreenshotUploadInput,
): Promise<ScreenshotUploadResponse> {
  const headers = recordingHeaders(deviceId, token, {
    "content-type": "image/png",
    "x-captureflow-screenshot-width": String(input.width),
    "x-captureflow-screenshot-height": String(input.height),
  });
  if (input.title) {
    headers["x-captureflow-screenshot-title"] = input.title;
  }
  const res = await fetch(`${WEB_BASE}/api/s/upload`, {
    method: "POST",
    headers,
    body: input.png,
  });
  return parseResponse<ScreenshotUploadResponse>(res, "/s/upload");
}
