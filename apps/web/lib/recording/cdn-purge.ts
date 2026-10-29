/// <reference types="@cloudflare/workers-types" />

/*
 * Screen and webcam files sit in Cloudflare's edge cache for a year (their
 * URLs change whenever the file does), so deleting a recording has to purge
 * those URLs too or it keeps playing for anyone holding a link. A purge that
 * fails is queued and retried by the hourly cron. No binding/runtime imports:
 * the cron bundle can't resolve @opennextjs/cloudflare.
 */

export type PurgeEnv = {
  DB: D1Database;
  CLOUDFLARE_ZONE_ID?: string;
  CLOUDFLARE_PURGE_TOKEN?: string;
  R2_PUBLIC_BASE_URL?: string;
};

export type CachedMedia = {
  storageKey: string;
  sizeBytes: number;
  webcamStorageKey: string | null;
  webcamSizeBytes: number;
};

const DEFAULT_BASE = "https://cdn.captureflow.dev";
// Cloudflare's per-request limit on purge-by-URL.
const PURGE_BATCH = 30;
const ATTEMPTS = 3;

// Every URL a viewer may have fetched the files under: bare and ?v=<size>.
export function cachedMediaUrls(base: string, row: CachedMedia): string[] {
  const urls: string[] = [];
  const add = (key: string | null, size: number) => {
    if (!key) return;
    urls.push(`${base}/${key}`);
    if (size > 0) urls.push(`${base}/${key}?v=${size}`);
  };
  add(row.storageKey, row.sizeBytes);
  add(row.webcamStorageKey, row.webcamSizeBytes);
  return urls;
}

async function purgeOnce(
  env: PurgeEnv,
  urls: string[],
  fetchImpl: typeof fetch,
): Promise<boolean> {
  const res = await fetchImpl(
    `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.CLOUDFLARE_PURGE_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ files: urls }),
    },
  );
  if (!res.ok) return false;
  const body = (await res.json().catch(() => null)) as {
    success?: boolean;
  } | null;
  return body?.success === true;
}

async function purge(
  env: PurgeEnv,
  urls: string[],
  fetchImpl: typeof fetch,
): Promise<boolean> {
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      if (await purgeOnce(env, urls, fetchImpl)) return true;
    } catch {
      /* retried below */
    }
  }
  return false;
}

// Without a zone and token (self-hosted, local dev) there is no CDN cache to clear.
function canPurge(env: PurgeEnv): boolean {
  return !!env.CLOUDFLARE_ZONE_ID && !!env.CLOUDFLARE_PURGE_TOKEN;
}

export async function purgeRecordingMedia(
  env: PurgeEnv,
  row: CachedMedia,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  if (!canPurge(env)) return;
  const urls = cachedMediaUrls(env.R2_PUBLIC_BASE_URL ?? DEFAULT_BASE, row);
  if (await purge(env, urls, fetchImpl)) return;
  console.error(`[cdn] purge failed, queued for retry: ${urls[0]}`);
  const now = Date.now();
  await env.DB.batch(
    urls.map((url) =>
      env.DB.prepare(
        "INSERT INTO cdn_purge_queue (url, created_at) VALUES (?, ?) ON CONFLICT (url) DO NOTHING",
      ).bind(url, now),
    ),
  );
}

export async function retryQueuedPurges(
  env: PurgeEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  if (!canPurge(env)) return;
  const queued = await env.DB.prepare(
    "SELECT url FROM cdn_purge_queue ORDER BY created_at LIMIT ?",
  )
    .bind(PURGE_BATCH * 10)
    .all<{ url: string }>();
  const urls = (queued.results ?? []).map((r) => r.url);
  for (let i = 0; i < urls.length; i += PURGE_BATCH) {
    const batch = urls.slice(i, i + PURGE_BATCH);
    const ok = await purge(env, batch, fetchImpl);
    await env.DB.batch(
      batch.map((url) =>
        ok
          ? env.DB.prepare("DELETE FROM cdn_purge_queue WHERE url = ?").bind(
              url,
            )
          : env.DB.prepare(
              "UPDATE cdn_purge_queue SET attempts = attempts + 1 WHERE url = ?",
            ).bind(url),
      ),
    );
    if (!ok) console.error(`[cdn] queued purge still failing: ${batch[0]}`);
  }
}
