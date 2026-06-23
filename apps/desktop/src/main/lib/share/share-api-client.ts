/**
 * HTTP plumbing for captureflow.xyz. Every call carries the device-id
 * header and (when present) the share-auth bearer. Lives in main so the
 * renderer's CSP stays narrow and the device-id never leaves the main
 * process.
 *
 * Stateless — callers provide deviceId per request. Higher-level state
 * (slug, uploadId, etag accumulators, connectivity) lives in
 * share-upload-streamer.ts.
 */

import { getShareAuthToken } from './share-auth'

// Override via CAPTUREFLOW_SHARE_API_BASE for one-off staging tests.
export const SHARE_API_BASE = process.env.CAPTUREFLOW_SHARE_API_BASE ?? 'https://captureflow.xyz/api/r'

// R2 multipart minimum part size (except the last). 5 MiB is the lower
// bound; the streamer buffers up to this threshold before POSTing a part.
// The worker's hard cap per part is 100 MiB.
export const CHUNK_BYTES = 5 * 1024 * 1024

export class ShareApiHttpError extends Error {
  readonly status: number
  readonly code: string | undefined
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

type ApiError = { error: string; code?: string }

export function shareHeaders(
  deviceId: string,
  extra: Record<string, string> = {}
): Record<string, string> {
  const headers: Record<string, string> = {
    'x-captureflow-device': deviceId,
    ...extra
  }
  const token = getShareAuthToken()
  if (token) {
    headers.authorization = `Bearer ${token}`
  }
  return headers
}

export async function parseResponse<T>(res: Response, path: string): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T
  }
  let message = `HTTP ${res.status}`
  let code: string | undefined
  try {
    const err = (await res.json()) as ApiError
    if (err.error) message = err.error
    code = err.code
  } catch {
    /* non-JSON body — keep HTTP status as message */
  }
  throw new ShareApiHttpError(`${path}: ${message}`, res.status, code)
}

export async function postJson<T>(path: string, deviceId: string, body: unknown): Promise<T> {
  const res = await fetch(`${SHARE_API_BASE}${path}`, {
    method: 'POST',
    headers: shareHeaders(deviceId, { 'content-type': 'application/json' }),
    body: JSON.stringify(body)
  })
  return parseResponse<T>(res, path)
}

// Node's fetch body type rejects a Uint8Array view directly; copy into a
// fresh ArrayBuffer, which satisfies both Node and DOM lib typings.
function toBody(bytes: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buf).set(bytes)
  return buf
}

export async function postBytes<T>(path: string, deviceId: string, bytes: Uint8Array): Promise<T> {
  const res = await fetch(`${SHARE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/octet-stream',
      'x-captureflow-device': deviceId,
      'content-length': String(bytes.byteLength)
    },
    body: toBody(bytes)
  })
  return parseResponse<T>(res, path)
}

// Same bearer + device pair as multipart parts, but the worker's route
// gate (ALLOWED_TYPES) requires image/jpeg (or png/webp) — octet-stream
// from postBytes would be rejected.
export async function postPoster<T>(path: string, deviceId: string, bytes: Uint8Array): Promise<T> {
  const res = await fetch(`${SHARE_API_BASE}${path}`, {
    method: 'POST',
    headers: shareHeaders(deviceId, {
      'content-type': 'image/jpeg',
      'content-length': String(bytes.byteLength)
    }),
    body: toBody(bytes)
  })
  return parseResponse<T>(res, path)
}

export async function deleteWithDevice(path: string, deviceId: string): Promise<void> {
  const res = await fetch(`${SHARE_API_BASE}${path}`, {
    method: 'DELETE',
    headers: shareHeaders(deviceId)
  })
  await parseResponse<{ ok: true }>(res, path)
}
