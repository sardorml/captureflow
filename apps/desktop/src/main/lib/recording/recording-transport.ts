import type {
  PartRef,
  RecordingUploadTransport,
  UploadInitResponse,
} from "@captureflow/engine/media";
import {
  postBytes,
  postJson,
  RECORDING_API_BASE,
  parseResponse,
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
  const part = (path: string, slug: string, n: number, bytes: Uint8Array) =>
    postBytes<PartRef>(
      `${path}?slug=${encodeURIComponent(slug)}&part=${n}`,
      deviceId,
      bytes,
    );
  return {
    init: (req) => postJson<UploadInitResponse>("/init", deviceId, req),
    uploadScreenPart: (slug, n, bytes) => part("/part", slug, n, bytes),
    uploadWebcamPart: (slug, n, bytes) => part("/webcam-part", slug, n, bytes),
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
