import { getRecordingAuthToken } from "./recording-auth";

// Override via CAPTUREFLOW_RECORDING_API_BASE for one-off staging tests.
export const RECORDING_API_BASE =
  process.env.CAPTUREFLOW_RECORDING_API_BASE ?? "https://captureflow.xyz/api/r";

// R2 multipart minimum part size (except the last); worker caps a part at 100 MiB.
export const CHUNK_BYTES = 5 * 1024 * 1024;

export class RecordingApiHttpError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type ApiError = { error: string; code?: string };

export function recordingHeaders(
  deviceId: string,
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    "x-captureflow-device": deviceId,
    ...extra,
  };
  const token = getRecordingAuthToken();
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
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
    const err = (await res.json()) as ApiError;
    if (err.error) message = err.error;
    code = err.code;
  } catch {
    /* non-JSON body — keep HTTP status as message */
  }
  throw new RecordingApiHttpError(`${path}: ${message}`, res.status, code);
}

export async function postJson<T>(
  path: string,
  deviceId: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(`${RECORDING_API_BASE}${path}`, {
    method: "POST",
    headers: recordingHeaders(deviceId, { "content-type": "application/json" }),
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res, path);
}

// Node's fetch body type rejects a Uint8Array view directly; copy into a fresh ArrayBuffer.
function toBody(bytes: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return buf;
}

export async function postBytes<T>(
  path: string,
  deviceId: string,
  bytes: Uint8Array,
): Promise<T> {
  const res = await fetch(`${RECORDING_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/octet-stream",
      "x-captureflow-device": deviceId,
      "content-length": String(bytes.byteLength),
    },
    body: toBody(bytes),
  });
  return parseResponse<T>(res, path);
}

// Worker's route gate (ALLOWED_TYPES) requires image/jpeg here; octet-stream would be rejected.
export async function postPoster<T>(
  path: string,
  deviceId: string,
  bytes: Uint8Array,
): Promise<T> {
  const res = await fetch(`${RECORDING_API_BASE}${path}`, {
    method: "POST",
    headers: recordingHeaders(deviceId, {
      "content-type": "image/jpeg",
      "content-length": String(bytes.byteLength),
    }),
    body: toBody(bytes),
  });
  return parseResponse<T>(res, path);
}

export async function deleteWithDevice(
  path: string,
  deviceId: string,
): Promise<void> {
  const res = await fetch(`${RECORDING_API_BASE}${path}`, {
    method: "DELETE",
    headers: recordingHeaders(deviceId),
  });
  await parseResponse<{ ok: true }>(res, path);
}
