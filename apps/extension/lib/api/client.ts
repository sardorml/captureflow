import { WEB_BASE } from "../config";
import type {
  FinalizeRequest,
  FinalizeResponse,
  InitRequest,
  InitResponse,
  PartResponse,
  RecordingApiError,
  UploadTransport,
} from "./types";

export const RECORDING_API_BASE = `${WEB_BASE}/api/r`;

export class RecordingApiHttpError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "RecordingApiHttpError";
    this.status = status;
    this.code = code;
  }
}

// Part routes authorize by device + slug ownership, so byte uploads omit the
// bearer token (matching the desktop client).
export function recordingHeaders(
  deviceId: string,
  token: string | null,
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    "x-captureflow-device": deviceId,
    ...extra,
  };
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

export async function parseResponse<T>(
  res: Response,
  path: string,
): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T;
  }
  let message = `HTTP ${res.status}`;
  let code: string | undefined;
  try {
    const err = (await res.json()) as RecordingApiError;
    if (err.error) message = err.error;
    code = err.code;
  } catch {
    /* non-JSON body — keep the HTTP status as the message */
  }
  throw new RecordingApiHttpError(`${path}: ${message}`, res.status, code);
}

export async function postJson<T>(
  path: string,
  deviceId: string,
  token: string | null,
  body: unknown,
): Promise<T> {
  const res = await fetch(`${RECORDING_API_BASE}${path}`, {
    method: "POST",
    headers: recordingHeaders(deviceId, token, {
      "content-type": "application/json",
    }),
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res, path);
}

/*
 * Copy into a fresh ArrayBuffer: a Uint8Array view is typed over
 * ArrayBufferLike (which fetch's BodyInit rejects), and this detaches the slice
 * from the streamer's reused buffers.
 */
function toBody(bytes: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return buf;
}

/*
 * No content-length: it's a forbidden fetch header (the browser sets it),
 * unlike the desktop's Node client. `contentType` is gated by the route:
 * octet-stream for media parts, image/jpeg for the poster.
 */
async function postBytes<T>(
  path: string,
  deviceId: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<T> {
  const res = await fetch(`${RECORDING_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": contentType,
      "x-captureflow-device": deviceId,
    },
    body: toBody(bytes),
  });
  return parseResponse<T>(res, path);
}

const partPath = (route: string, slug: string, partNumber: number): string =>
  `/${route}?slug=${encodeURIComponent(slug)}&part=${partNumber}`;

export function createRecordingTransport(
  deviceId: string,
  token: string | null,
): UploadTransport {
  return {
    init: (req: InitRequest) =>
      postJson<InitResponse>("/init", deviceId, token, req),
    uploadScreenPart: (slug, partNumber, bytes) =>
      postBytes<PartResponse>(
        partPath("part", slug, partNumber),
        deviceId,
        bytes,
        "application/octet-stream",
      ),
    uploadWebcamPart: (slug, partNumber, bytes) =>
      postBytes<PartResponse>(
        partPath("webcam-part", slug, partNumber),
        deviceId,
        bytes,
        "application/octet-stream",
      ),
    finalizeScreen: (req: FinalizeRequest) =>
      postJson<FinalizeResponse>("/finalize", deviceId, token, req),
    finalizeWebcam: async (req: FinalizeRequest) => {
      await postJson<{ ok: true }>("/webcam-finalize", deviceId, token, req);
    },
    uploadPoster: async (slug: string, bytes: Uint8Array) => {
      await postBytes<{ posterKey: string; url: string }>(
        `/poster?slug=${encodeURIComponent(slug)}`,
        deviceId,
        bytes,
        "image/jpeg",
      );
    },
  };
}
