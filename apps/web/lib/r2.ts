/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv } from './cf-env';

// R2 access for the user dashboard. Delete + put. Share uploads go
// through the share multipart API, but snap editor saves write
// the new PNG bytes directly via this binding (same R2 bucket; the
// server action that owns the bytes is authenticated against the
// session cookie, so we don't need a bearer-round-trip through the
// snap Worker for an editor save).

async function getBucket(): Promise<R2Bucket> {
  const env = await getAppWebEnv();
  if (!env?.BUCKET) {
    throw new Error(
      'R2 binding (BUCKET) not available. Run under OpenNext / Cloudflare.'
    );
  }
  return env.BUCKET;
}

export async function deleteObject(key: string): Promise<void> {
  const bucket = await getBucket();
  await bucket.delete(key);
}

export async function putObject(
  key: string,
  body: ArrayBuffer,
  contentType: string,
  // Snap edits replace the object — pass `no-cache` so viewers see
  // the new bytes on next fetch instead of waiting on edge TTL.
  cacheControl = 'no-cache'
): Promise<void> {
  const bucket = await getBucket();
  await bucket.put(key, body, {
    httpMetadata: { contentType, cacheControl },
  });
}

// Read raw bytes for an object — used by the editor save flow to
// snapshot the unedited screenshot to the `.source` key on the first
// save so future edits always start from the original (instead of
// from a prior bake).
export async function getObjectBytes(key: string): Promise<ArrayBuffer | null> {
  const bucket = await getBucket();
  const obj = await bucket.get(key);
  if (!obj) return null;
  return obj.arrayBuffer();
}

// Whether an R2 object exists — cheap HEAD via the bucket binding.
// Avoids loading the body when we only need to know if the source
// snapshot was already taken.
export async function objectExists(key: string): Promise<boolean> {
  const bucket = await getBucket();
  const head = await bucket.head(key);
  return head !== null;
}

// Tiny JSON read helper for the snap editor's `.state.json` sidecar
// that stores the background choice + annotations. Returns null on
// missing / unparseable so callers can fall back to defaults.
export async function getObjectJson<T>(key: string): Promise<T | null> {
  const bucket = await getBucket();
  const obj = await bucket.get(key);
  if (!obj) return null;
  try {
    const text = await obj.text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
