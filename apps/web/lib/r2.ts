/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv } from './cf-env';

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
  cacheControl = 'no-cache'
): Promise<void> {
  const bucket = await getBucket();
  await bucket.put(key, body, {
    httpMetadata: { contentType, cacheControl },
  });
}

export async function getObjectBytes(key: string): Promise<ArrayBuffer | null> {
  const bucket = await getBucket();
  const obj = await bucket.get(key);
  if (!obj) return null;
  return obj.arrayBuffer();
}

export async function objectExists(key: string): Promise<boolean> {
  const bucket = await getBucket();
  const head = await bucket.head(key);
  return head !== null;
}

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
