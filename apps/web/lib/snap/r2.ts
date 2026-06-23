/// <reference types="@cloudflare/workers-types" />

import { getCloudflareEnv } from './cf-env';

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
  // `no-cache` so editor PUT replaces are visible without an edge cache TTL.
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
  // Delete all three artefacts so a re-uploaded id can't inherit a stale sidecar.
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

export function publicSnapUrl(id: string, r2BaseUrl: string): string {
  return `${r2BaseUrl}/${snapStorageKey(id)}`;
}
