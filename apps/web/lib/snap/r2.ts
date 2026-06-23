/// <reference types="@cloudflare/workers-types" />

import { getCloudflareEnv } from './cf-env';

// R2 access for snap PNGs. Single-shot put/get/delete — no multipart
// because snaps fit comfortably in one POST body (cap 8 MB).

async function getBucket(): Promise<R2Bucket> {
  const env = await getCloudflareEnv();
  if (!env?.BUCKET) {
    throw new Error(
      'R2 bucket binding (BUCKET) not available. Ensure OpenNext / Cloudflare runtime.'
    );
  }
  return env.BUCKET;
}

export function snapStorageKey(id: string): string {
  return `snaps/${id}.png`;
}

export function snapSourceKey(id: string): string {
  return `snaps/${id}.source.png`;
}

export function snapStateKey(id: string): string {
  return `snaps/${id}.state.json`;
}

export async function putSnap(
  id: string,
  body: ArrayBuffer,
  // `no-cache` so the editor's PUT replaces are visible on next view
  // without waiting for an edge cache TTL.
  cacheControl = 'no-cache'
): Promise<void> {
  const bucket = await getBucket();
  await bucket.put(snapStorageKey(id), body, {
    httpMetadata: { contentType: 'image/png', cacheControl },
  });
}

export async function getSnapBody(id: string): Promise<R2ObjectBody | null> {
  const bucket = await getBucket();
  const obj = await bucket.get(snapStorageKey(id));
  return obj ?? null;
}

export async function deleteSnap(id: string): Promise<void> {
  const bucket = await getBucket();
  // Tear down all three artefacts so a re-uploaded id can't inherit
  // a stale sidecar. R2 doesn't error on missing keys.
  await Promise.all([
    bucket.delete(snapStorageKey(id)),
    bucket.delete(snapSourceKey(id)),
    bucket.delete(snapStateKey(id)),
  ]);
}

export async function putSnapSource(
  id: string,
  body: ArrayBuffer
): Promise<void> {
  const bucket = await getBucket();
  await bucket.put(snapSourceKey(id), body, {
    httpMetadata: { contentType: 'image/png', cacheControl: 'no-cache' },
  });
}

export async function putSnapState(
  id: string,
  body: ArrayBuffer
): Promise<void> {
  const bucket = await getBucket();
  await bucket.put(snapStateKey(id), body, {
    httpMetadata: { contentType: 'application/json', cacheControl: 'no-cache' },
  });
}

// Direct CDN URL — short-circuits the Worker for the actual image
// bytes. Anchored on R2_PUBLIC_BASE_URL (cdn.captureflow.xyz) so
// every CaptureFlow surface points at the same domain.
export function publicSnapUrl(id: string, r2BaseUrl: string): string {
  return `${r2BaseUrl}/${snapStorageKey(id)}`;
}
