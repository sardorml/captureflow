/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv } from './cf-env';

// R2 access for the user dashboard. Share uploads go through the share
// multipart API, but snap editor saves write the new PNG bytes directly via
// this binding: the server action is authenticated against the session cookie,
// so an editor save doesn't need a bearer round-trip through the snap Worker.

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
  // Snap edits replace the object, so default to `no-cache`: viewers see the
  // new bytes on next fetch instead of waiting on the edge TTL.
  cacheControl = 'no-cache'
): Promise<void> {
  const bucket = await getBucket();
  await bucket.put(key, body, {
    httpMetadata: { contentType, cacheControl },
  });
}

// Read raw bytes for an object. The editor save flow uses this to snapshot the
// unedited screenshot to the `.source` key on first save, so future edits
// always start from the original rather than from a prior bake.
export async function getObjectBytes(key: string): Promise<ArrayBuffer | null> {
  const bucket = await getBucket();
  const obj = await bucket.get(key);
  if (!obj) return null;
  return obj.arrayBuffer();
}

// Cheap existence check via HEAD — avoids loading the body when we only need to
// know whether the source snapshot was already taken.
export async function objectExists(key: string): Promise<boolean> {
  const bucket = await getBucket();
  const head = await bucket.head(key);
  return head !== null;
}

// JSON read helper for the snap editor's `.state.json` sidecar (background
// choice + annotations). Returns null on missing/unparseable so callers can
// fall back to defaults.
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
