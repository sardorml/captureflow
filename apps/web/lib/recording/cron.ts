/// <reference types="@cloudflare/workers-types" />

import { ACCOUNT_LIMITS } from "@captureflow/quota";
import { createD1Db } from "./db-d1";
import { objectKeysFor } from "./object-keys";
import { screenshotObjectKeysFor } from "../screenshot-keys";

/*
 * Cron handlers, invoked by the wrapper worker's `scheduled()` entry:
 * runHourlyMultipartGc on `0 * * * *`, runDailyRetentionSweep on `0 4 * * *`.
 * The bucket's only lifecycle rule aborts incomplete multipart uploads after
 * 7 days — there is no object-expiry rule, so nothing catches a silent cron.
 */

type CronEnv = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

const STALE_PENDING_WINDOW_MS = ACCOUNT_LIMITS.multipartTtlSeconds * 1000;
const FAILED_RETENTION_MS = 24 * 60 * 60 * 1000;
const RETENTION_MS =
  ACCOUNT_LIMITS.retentionDaysFromLastView * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 100;
/*
 * Each sweep drains its backlog in BATCH_SIZE pages instead of taking one
 * page per invocation — a single sample silently falls behind forever once
 * more rows expire per day than one page holds. The page cap bounds a run
 * against rows that refuse to clear (every iteration re-reads them).
 */
const MAX_BATCHES = 50;

export async function runHourlyMultipartGc(env: CronEnv): Promise<void> {
  const cutoff = Date.now() - STALE_PENDING_WINDOW_MS;

  for (let batch = 0; batch < MAX_BATCHES; batch++) {
    const stale = await env.DB.prepare(
      `SELECT slug, storage_key AS storageKey, upload_id AS uploadId,
              webcam_storage_key AS webcamStorageKey,
              webcam_upload_id   AS webcamUploadId
         FROM recordings
        WHERE state = 'pending'
          AND upload_id IS NOT NULL
          AND created_at < ?
        LIMIT ?`,
    )
      .bind(cutoff, BATCH_SIZE)
      .all<{
        slug: string;
        storageKey: string;
        uploadId: string;
        webcamStorageKey: string | null;
        webcamUploadId: string | null;
      }>();

    const rows = stale.results ?? [];
    for (const row of rows) {
      try {
        const upload = env.BUCKET.resumeMultipartUpload(
          row.storageKey,
          row.uploadId,
        );
        await upload.abort();
      } catch (err) {
        console.warn(`[cron] abort failed for ${row.slug}:`, err);
      }
      if (row.webcamUploadId && row.webcamStorageKey) {
        try {
          const wc = env.BUCKET.resumeMultipartUpload(
            row.webcamStorageKey,
            row.webcamUploadId,
          );
          await wc.abort();
        } catch (err) {
          console.warn(`[cron] webcam abort failed for ${row.slug}:`, err);
        }
      }
      await env.DB.prepare(
        `UPDATE recordings
            SET state = 'failed',
                upload_id = NULL,
                webcam_state = CASE WHEN webcam_state = 'pending' THEN 'failed' ELSE webcam_state END,
                webcam_upload_id = NULL
          WHERE slug = ?`,
      )
        .bind(row.slug)
        .run();
    }
    if (rows.length < BATCH_SIZE) break;
  }
}

export async function runDailyRetentionSweep(env: CronEnv): Promise<void> {
  const now = Date.now();
  const retentionCutoff = now - RETENTION_MS;
  const failedCutoff = now - FAILED_RETENTION_MS;

  const db = createD1Db(env.DB);
  for (let batch = 0; batch < MAX_BATCHES; batch++) {
    const expiring = await env.DB.prepare(
      `SELECT slug, storage_key AS storageKey, poster_key AS posterKey,
              webcam_storage_key AS webcamStorageKey, state
         FROM recordings
        WHERE (state = 'ready' AND last_viewed_at < ?)
           OR (state = 'failed' AND created_at < ?)
        LIMIT ?`,
    )
      .bind(retentionCutoff, failedCutoff, BATCH_SIZE)
      .all<{
        slug: string;
        storageKey: string;
        posterKey: string | null;
        webcamStorageKey: string | null;
        state: string;
      }>();

    const rows = expiring.results ?? [];
    for (const row of rows) {
      try {
        await env.BUCKET.delete(objectKeysFor(row));
      } catch (err) {
        console.warn(`[cron] r2 delete failed for ${row.slug}:`, err);
      }
      await db.deleteRecording(row.slug);
    }
    if (rows.length < BATCH_SIZE) break;
  }

  await sweepScreenshots(env, retentionCutoff, failedCutoff);
}

/*
 * The screenshot arm of the same sweep. `idx_screenshots_gc` was created for
 * it but nothing ever called it, so screenshots never expired and soft-deleted
 * rows (whose objects the delete action already removed) accumulated forever.
 * last_viewed_at is nullable here, unlike recordings, so idle age falls back to
 * created_at — which costs the index, but a NULL would otherwise never expire.
 */
async function sweepScreenshots(
  env: CronEnv,
  retentionCutoff: number,
  deletedCutoff: number,
): Promise<void> {
  for (let batch = 0; batch < MAX_BATCHES; batch++) {
    const expiring = await env.DB.prepare(
      `SELECT id, storage_key AS storageKey, state
         FROM screenshots
        WHERE (state = 'ready' AND COALESCE(last_viewed_at, created_at) < ?)
           OR (state = 'deleted' AND updated_at < ?)
        LIMIT ?`,
    )
      .bind(retentionCutoff, deletedCutoff, BATCH_SIZE)
      .all<{ id: string; storageKey: string; state: string }>();

    const rows = expiring.results ?? [];
    for (const row of rows) {
      /*
       * Objects are deleted for soft-deleted rows too: the delete action's R2
       * cleanup is best-effort and its comment relies on this sweep to catch
       * what it missed. Purging the row first would strand those bytes with
       * nothing left pointing at them. Re-deleting absent keys is a no-op.
       */
      try {
        await env.BUCKET.delete(screenshotObjectKeysFor(row.storageKey));
      } catch (err) {
        console.warn(`[cron] screenshot r2 delete failed for ${row.id}:`, err);
        continue;
      }
      await env.DB.prepare(`DELETE FROM screenshots WHERE id = ?`)
        .bind(row.id)
        .run();
    }
    if (rows.length < BATCH_SIZE) break;
  }
}
