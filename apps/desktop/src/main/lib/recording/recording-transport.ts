import type {
  RecordingUploadTransport,
  UploadInitResponse,
} from "@captureflow/engine/media";
import {
  postBytes,
  postJson,
  RECORDING_API_BASE,
  parseResponse,
  recordingHeaders,
} from "./recording-api-client";
import { buildRecordingEditUrl } from "./recording-edit-url";

export type RecordingInitRequest = {
  contentType: string;
  source: "instant";
  preset: "recording";
  client: "desktop";
  title?: string;
  hasWebcam: boolean;
  workspaceId?: string;
};

export function createRecordingTransport(
  deviceId: string,
): RecordingUploadTransport<RecordingInitRequest> {
  return {
    init: (req) => postJson<UploadInitResponse>("/init", deviceId, req),
    uploadSegment: async (slug, stream, offset, bytes, signal) => {
      await postBytes(
        `/segment?slug=${encodeURIComponent(slug)}&stream=${stream}&offset=${offset}`,
        deviceId,
        bytes,
        signal,
      );
    },
    uploadedThrough: async (slug, stream) => {
      const path = `/segment?slug=${encodeURIComponent(slug)}&stream=${stream}`;
      const res = await fetch(`${RECORDING_API_BASE}${path}`, {
        headers: recordingHeaders(deviceId),
        signal: AbortSignal.timeout(10_000),
      });
      return (await parseResponse<{ covered: number }>(res, path)).covered;
    },
    finalizeScreen: (req) =>
      postJson<{ url: string }>("/finalize", deviceId, req),
    finalizeWebcam: async (req) => {
      await postJson("/webcam-finalize", deviceId, req);
    },
    abort: async (req) => {
      await postJson("/abort", deviceId, req);
    },
    state: async (slug) => {
      const res = await fetch(
        `${RECORDING_API_BASE}/state?slug=${encodeURIComponent(slug)}`,
      );
      return parseResponse<{ state: string }>(res, "/state");
    },
    viewUrl: buildRecordingEditUrl,
  };
}
