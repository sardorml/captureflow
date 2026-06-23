/// <reference types="@cloudflare/workers-types" />

import { getCloudflareEnv } from './cf-env';

// R2 access via the native Workers binding (`BUCKET` in wrangler.toml).
// Multipart upload state lives in the bucket itself; we persist only the
// `uploadId` + `storageKey` in our own DB row.
//
// Outside a Cloudflare runtime (unit tests, dev shells without OpenNext),
// `getCloudflareEnv()` returns null and these helpers throw. Exercise
// routes under `next dev` (with OpenNext) or `pnpm cf:preview`.

async function getBucket(): Promise<R2Bucket> {
  const env = await getCloudflareEnv();
  if (!env?.BUCKET) {
    throw new Error(
      'R2 bucket binding (BUCKET) not available. ' +
        'Ensure you are running under OpenNext / Cloudflare runtime.'
    );
  }
  return env.BUCKET;
}

export type R2MultipartHandle = {
  uploadId: string;
  storageKey: string;
};

export type R2UploadedPart = {
  partNumber: number;
  etag: string;
};

export async function createMultipartUpload(
  storageKey: string,
  contentType: string,
  // Sets the R2 object's cache-control header up front. Without it the CDN
  // edge caches with R2's long default TTL, so a regenerated poster takes a
  // long time to propagate. Pass a short TTL ('public, max-age=60') for
  // objects we expect to rotate.
  cacheControl?: string
): Promise<R2MultipartHandle> {
  const bucket = await getBucket();
  const upload = await bucket.createMultipartUpload(storageKey, {
    httpMetadata: cacheControl
      ? { contentType, cacheControl }
      : { contentType },
  });
  return { uploadId: upload.uploadId, storageKey };
}

export async function uploadPart(
  storageKey: string,
  uploadId: string,
  partNumber: number,
  body: ArrayBuffer | ReadableStream | string
): Promise<R2UploadedPart> {
  const bucket = await getBucket();
  const upload = bucket.resumeMultipartUpload(storageKey, uploadId);
  const result = await upload.uploadPart(partNumber, body);
  return { partNumber, etag: result.etag };
}

export async function completeMultipartUpload(
  storageKey: string,
  uploadId: string,
  parts: R2UploadedPart[]
): Promise<void> {
  const bucket = await getBucket();
  const upload = bucket.resumeMultipartUpload(storageKey, uploadId);
  await upload.complete(parts);
}

export async function abortMultipartUpload(
  storageKey: string,
  uploadId: string
): Promise<void> {
  const bucket = await getBucket();
  const upload = bucket.resumeMultipartUpload(storageKey, uploadId);
  await upload.abort();
}

export async function deleteObject(storageKey: string): Promise<void> {
  const bucket = await getBucket();
  await bucket.delete(storageKey);
}

export async function putObject(
  storageKey: string,
  body: ArrayBuffer,
  contentType: string,
  // Forwarded as the R2 object's cache-control header (the public CDN
  // response header). /api/poster passes a short TTL on regen so
  // social-embed previews pick up the new image within ~60s.
  cacheControl?: string
): Promise<void> {
  const bucket = await getBucket();
  await bucket.put(storageKey, body, {
    httpMetadata: cacheControl
      ? { contentType, cacheControl }
      : { contentType },
  });
}

export async function headObject(storageKey: string): Promise<boolean> {
  const bucket = await getBucket();
  const head = await bucket.head(storageKey);
  return head !== null;
}

// JSON write helper paired with `getObjectJson`. Used by sidecar surfaces
// (share-config, summary+chapters) to persist mutations alongside the
// immutable video bytes.
export async function putObjectJson<T>(
  storageKey: string,
  value: T
): Promise<void> {
  const bucket = await getBucket();
  await bucket.put(storageKey, JSON.stringify(value), {
    httpMetadata: {
      contentType: 'application/json; charset=utf-8',
      // Sidecars mutate freely (renames, summary edits), so keep them out
      // of the CDN cache.
      cacheControl: 'no-store',
    },
  });
}

// JSON read helper for the share-config sidecar. Returns null on missing
// or unparseable objects so callers can fall back to defaults.
export async function getObjectJson<T>(storageKey: string): Promise<T | null> {
  const bucket = await getBucket();
  const obj = await bucket.get(storageKey);
  if (!obj) return null;
  try {
    const text = await obj.text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function publicUrlFor(storageKey: string): Promise<string> {
  const env = await getCloudflareEnv();
  const base =
    env?.R2_PUBLIC_BASE_URL ??
    process.env.R2_PUBLIC_BASE_URL ??
    'https://cdn.captureflow.xyz';
  return `${base}/${storageKey}`;
}
