/// <reference types="@cloudflare/workers-types" />

import { ACCOUNT_LIMITS } from '@captureflow/quota';
import { createD1Db } from './db-d1';

// Cron handlers, invoked by the wrapper worker's `scheduled()` entry.
// Two jobs:
//
//   `0 * * * *` (hourly)     — abort R2 multipart uploads orphaned in
//                              `pending` rows that haven't progressed
//                              within the multipart TTL window.
//
//   `0 4 * * *` (daily 04:00 UTC) — delete shares whose `last_viewed_at`
//                                   is older than the retention window,
//                                   and any `failed` rows beyond the
//                                   short safety window.
//
// Both jobs are eventually-consistent and idempotent. The R2 lifecycle
// rule (delete-objects-after-30d) is the safety net behind these — the
// cron does the right thing fast; the lifecycle rule guarantees nothing
// lingers if the cron is silent for a stretch.

type CronEnv = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

const STALE_PENDING_WINDOW_MS = ACCOUNT_LIMITS.multipartTtlSeconds * 1000;
const FAILED_RETENTION_MS = 24 * 60 * 60 * 1000; // 24h grace for failed rows
const RETENTION_MS =
  ACCOUNT_LIMITS.retentionDaysFromLastView * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 100;

export async function runHourlyMultipartGc(env: CronEnv): Promise<void> {
  const cutoff = Date.now() - STALE_PENDING_WINDOW_MS;

  const stale = await env.DB.prepare(
    `SELECT slug, storage_key AS storageKey, upload_id AS uploadId,
            webcam_storage_key AS webcamStorageKey,
            webcam_upload_id   AS webcamUploadId
       FROM shares
      WHERE state = 'pending'
        AND upload_id IS NOT NULL
        AND created_at < ?
      LIMIT ?`
  )
    .bind(cutoff, BATCH_SIZE)
    .all<{
      slug: string;
      storageKey: string;
      uploadId: string;
      webcamStorageKey: string | null;
      webcamUploadId: string | null;
    }>();

  for (const row of stale.results ?? []) {
    try {
      const upload = env.BUCKET.resumeMultipartUpload(
        row.storageKey,
        row.uploadId
      );
      await upload.abort();
    } catch (err) {
      // Multipart may already be gone (lifecycle rule, manual abort).
      // Either way, nothing to clean — fall through to mark the row.
      console.warn(`[cron] abort failed for ${row.slug}:`, err);
    }
    // Webcam companion: if it had its own multipart in flight, abort
    // that too. Failures are non-fatal — same lifecycle-rule safety
    // net as the screen side.
    if (row.webcamUploadId && row.webcamStorageKey) {
      try {
        const wc = env.BUCKET.resumeMultipartUpload(
          row.webcamStorageKey,
          row.webcamUploadId
        );
        await wc.abort();
      } catch (err) {
        console.warn(`[cron] webcam abort failed for ${row.slug}:`, err);
      }
    }
    await env.DB.prepare(
      `UPDATE shares
          SET state = 'failed',
              upload_id = NULL,
              webcam_state = CASE WHEN webcam_state = 'pending' THEN 'failed' ELSE webcam_state END,
              webcam_upload_id = NULL
        WHERE slug = ?`
    )
      .bind(row.slug)
      .run();
  }
}

export async function runDailyRetentionSweep(env: CronEnv): Promise<void> {
  const now = Date.now();
  const retentionCutoff = now - RETENTION_MS;
  const failedCutoff = now - FAILED_RETENTION_MS;

  const expiring = await env.DB.prepare(
    `SELECT slug, storage_key AS storageKey, poster_key AS posterKey,
            webcam_storage_key AS webcamStorageKey, state
       FROM shares
      WHERE (state = 'ready' AND last_viewed_at < ?)
         OR (state = 'failed' AND created_at < ?)
      LIMIT ?`
  )
    .bind(retentionCutoff, failedCutoff, BATCH_SIZE)
    .all<{
      slug: string;
      storageKey: string;
      posterKey: string | null;
      webcamStorageKey: string | null;
      state: string;
    }>();

  const db = createD1Db(env.DB);
  for (const row of expiring.results ?? []) {
    try {
      await env.BUCKET.delete(row.storageKey);
      if (row.posterKey) {
        await env.BUCKET.delete(row.posterKey);
      }
      if (row.webcamStorageKey) {
        await env.BUCKET.delete(row.webcamStorageKey);
      }
    } catch (err) {
      console.warn(`[cron] r2 delete failed for ${row.slug}:`, err);
    }
    await db.deleteShare(row.slug);
  }
}
