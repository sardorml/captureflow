import { readFile } from "fs/promises";

import { loadDeviceId } from "./device-id";
import { logError, logInfo, logWarn } from "./logger";
import {
  clearRecordingAuth,
  getRecordingAuthToken,
} from "./recording/recording-auth";
import {
  markRecordingUsageCapReached,
  refreshRecordingUsage,
} from "./recording/recording-usage";
import { getActiveWorkspaceId } from "./recording/recording-workspaces";
import { bakeScreenshotWithDefaultBackground } from "./screenshot-bake";

const SCREENSHOT_API_BASE =
  process.env.CAPTUREFLOW_SCREENSHOT_API_BASE ??
  "https://captureflow.xyz/api/s";

export type ScreenshotUploadOk = {
  ok: true;
  id: string;
  viewUrl: string;
  editUrl: string;
};

export type ScreenshotUploadErr = {
  ok: false;
  error: string;
  code?: string;
  status?: number;
};

export type ScreenshotUploadResult = ScreenshotUploadOk | ScreenshotUploadErr;

export type ScreenshotUploadInput = {
  tempPath: string;
  width: number;
  height: number;
  title?: string;
};

export async function uploadScreenshot(
  input: ScreenshotUploadInput,
): Promise<ScreenshotUploadResult> {
  const token = getRecordingAuthToken();
  if (!token) {
    return {
      ok: false,
      error: "Sign in to upload screenshots.",
      code: "missing_token",
      status: 401,
    };
  }

  let composedBytes: Buffer;
  let sourceBytes: Buffer;
  let composedWidth: number;
  let composedHeight: number;
  let background: "violet";
  try {
    const raw = await readFile(input.tempPath);
    const baked = bakeScreenshotWithDefaultBackground(raw);
    composedBytes = baked.composedBytes;
    sourceBytes = baked.sourceBytes;
    composedWidth = baked.composedWidth || input.width;
    composedHeight = baked.composedHeight || input.height;
    background = baked.background;
  } catch (err) {
    logError(
      "screenshot-upload",
      `failed to read PNG at ${input.tempPath}: ${String(err)}`,
    );
    return {
      ok: false,
      error: "Failed to read captured screenshot",
      code: "read_failed",
    };
  }

  const deviceId = await loadDeviceId();
  const headers: Record<string, string> = {
    authorization: `Bearer ${token}`,
    "x-captureflow-device": deviceId,
    "x-captureflow-screenshot-width": String(composedWidth),
    "x-captureflow-screenshot-height": String(composedHeight),
  };
  if (input.title) {
    headers["x-captureflow-screenshot-title"] = input.title.slice(0, 200);
  }
  const activeWorkspaceId = getActiveWorkspaceId();
  if (activeWorkspaceId) {
    headers["x-captureflow-workspace"] = activeWorkspaceId;
  }

  let res: Response;
  try {
    const composedAb = composedBytes.buffer.slice(
      composedBytes.byteOffset,
      composedBytes.byteOffset + composedBytes.byteLength,
    ) as ArrayBuffer;
    const sourceAb = sourceBytes.buffer.slice(
      sourceBytes.byteOffset,
      sourceBytes.byteOffset + sourceBytes.byteLength,
    ) as ArrayBuffer;
    const stateJson = JSON.stringify({ background, annotations: [] });
    const form = new FormData();
    form.append(
      "composed",
      new Blob([composedAb], { type: "image/png" }),
      "composed.png",
    );
    form.append(
      "source",
      new Blob([sourceAb], { type: "image/png" }),
      "source.png",
    );
    form.append(
      "state",
      new Blob([stateJson], { type: "application/json" }),
      "state.json",
    );
    res = await fetch(`${SCREENSHOT_API_BASE}/upload`, {
      method: "POST",
      headers,
      body: form,
    });
  } catch (err) {
    logWarn("screenshot-upload", `network error: ${String(err)}`);
    return {
      ok: false,
      error: "Network error — check your connection and try again.",
      code: "network_error",
    };
  }

  if (res.status === 401) {
    clearRecordingAuth();
    return {
      ok: false,
      error: "Sign-in expired. Sign in again to keep uploading screenshots.",
      code: "invalid_token",
      status: 401,
    };
  }

  if (res.status === 429) {
    let code = "storage_limit";
    try {
      const j = (await res.json()) as { code?: string };
      if (j.code) code = j.code;
    } catch {
      // ignore
    }
    markRecordingUsageCapReached();
    return {
      ok: false,
      error:
        code === "active_limit"
          ? "Too many active screenshots + recordings."
          : "Storage cap reached.",
      code,
      status: 429,
    };
  }

  if (!res.ok) {
    let errText = `Upload failed (${res.status})`;
    let code: string | undefined;
    try {
      const j = (await res.json()) as { error?: string; code?: string };
      errText = j.error ?? errText;
      code = j.code;
    } catch {
      // ignore
    }
    logWarn("screenshot-upload", `upload non-OK ${res.status}: ${errText}`);
    return { ok: false, error: errText, code, status: res.status };
  }

  const payload = (await res.json()) as {
    id?: string;
    viewUrl?: string;
    editUrl?: string;
  };
  if (!payload.id || !payload.viewUrl || !payload.editUrl) {
    return {
      ok: false,
      error: "Malformed upload response",
      code: "bad_response",
    };
  }

  logInfo(
    "screenshot-upload",
    `uploaded ${payload.id} (composed ${composedWidth}×${composedHeight}, composed=${composedBytes.byteLength}B source=${sourceBytes.byteLength}B)`,
  );

  refreshRecordingUsage().catch(() => {});

  return {
    ok: true,
    id: payload.id,
    viewUrl: payload.viewUrl,
    editUrl: payload.editUrl,
  };
}

export async function deleteScreenshot(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = getRecordingAuthToken();
  if (!token) return { ok: false, error: "missing_token" };
  const deviceId = await loadDeviceId();
  try {
    const res = await fetch(
      `${SCREENSHOT_API_BASE}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
          "x-captureflow-device": deviceId,
        },
      },
    );
    if (!res.ok) {
      logWarn("screenshot-upload", `delete ${id} returned ${res.status}`);
      return { ok: false, error: `status_${res.status}` };
    }
    refreshRecordingUsage().catch(() => {});
    return { ok: true };
  } catch (err) {
    logWarn("screenshot-upload", `delete ${id} network error: ${String(err)}`);
    return { ok: false, error: "network_error" };
  }
}
