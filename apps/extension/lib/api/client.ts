import type {
  FinalizeRequest,
  FinalizeResponse,
  InitRequest,
  InitResponse,
  PartResponse,
  ShareApiError,
  UploadTransport,
} from "./types";

// The share API lives on the web app. Override the origin for staging via the
// WXT_WEB_BASE build env (see `.env.example`); defaults to production.
const WEB_BASE = import.meta.env.WXT_WEB_BASE ?? "https://captureflow.xyz";
export const SHARE_API_BASE = `${WEB_BASE}/api/r`;

export class ShareApiHttpError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ShareApiHttpError";
    this.status = status;
    this.code = code;
  }
}

// Device header identifies the uploader; the bearer token authorizes it. The
// part route authorizes by device + slug ownership, so byte uploads omit the
// token (matching the desktop client).
export function shareHeaders(
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
    const err = (await res.json()) as ShareApiError;
    if (err.error) message = err.error;
    code = err.code;
  } catch {
    /* non-JSON body — keep the HTTP status as the message */
  }
  throw new ShareApiHttpError(`${path}: ${message}`, res.status, code);
}

export async function postJson<T>(
  path: string,
  deviceId: string,
  token: string | null,
  body: unknown,
): Promise<T> {
  const res = await fetch(`${SHARE_API_BASE}${path}`, {
    method: "POST",
    headers: shareHeaders(deviceId, token, {
      "content-type": "application/json",
    }),
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res, path);
}

// Copy into a fresh ArrayBuffer: a Uint8Array view is typed over ArrayBufferLike
// (which fetch's BodyInit rejects), and this also detaches the slice from the
// streamer's reused buffers.
function toBody(bytes: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return buf;
}

// content-length is set automatically by the browser (a forbidden header for
// fetch), so it's omitted here unlike the desktop's Node client.
export async function postBytes<T>(
  path: string,
  deviceId: string,
  bytes: Uint8Array,
): Promise<T> {
  const res = await fetch(`${SHARE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/octet-stream",
      "x-captureflow-device": deviceId,
    },
    body: toBody(bytes),
  });
  return parseResponse<T>(res, path);
}

// HTTP-backed transport for the upload streamer.
export function createShareTransport(
  deviceId: string,
  token: string | null,
): UploadTransport {
  return {
    init: (req: InitRequest) =>
      postJson<InitResponse>("/init", deviceId, token, req),
    uploadPart: (slug: string, partNumber: number, bytes: Uint8Array) =>
      postBytes<PartResponse>(
        `/part?slug=${encodeURIComponent(slug)}&part=${partNumber}`,
        deviceId,
        bytes,
      ),
    finalize: (req: FinalizeRequest) =>
      postJson<FinalizeResponse>("/finalize", deviceId, token, req),
  };
}
