/// <reference types="@cloudflare/workers-types" />

import {
  ACCOUNT_LIMITS,
  isSelfHosted,
  listPaidWorkspaceIds,
} from "@captureflow/quota";
import { purgeRecordingMedia, retryQueuedPurges } from "./cdn-purge";
import { createD1Db } from "./db-d1";
import {
  audioPartPrefixFor,
  objectKeysFor,
  segmentPrefixFor,
  THUMB_SUFFIX,
  posterThumbKeyFor,
} from "./object-keys";
import {
  THUMB_CACHE_CONTROL,
  posterDigest,
  posterThumbnail,
} from "./poster-blur";
import { deleteObjectsWithPrefix } from "./r2-prefix";
import { screenshotObjectKeysFor } from "../screenshot-keys";

/*
 * Cron handlers, invoked by the wrapper worker's `scheduled()` entry:
 * runHourlyMultipartGc and backfillPosterDerivatives on `0 * * * *`,
 * runDailyRetentionSweep on `0 4 * * *`.
 * The bucket's only lifecycle rule aborts incomplete multipart uploads after
 * 7 days — there is no object-expiry rule, so nothing catches a silent cron.
 */

type CronEnv = {
  DB: D1Database;
  BUCKET: R2Bucket;
  SELF_HOSTED?: string;
  CLOUDFLARE_ZONE_ID?: string;
  CLOUDFLARE_PURGE_TOKEN?: string;
  R2_PUBLIC_BASE_URL?: string;
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

export async function retryCdnPurges(env: CronEnv): Promise<void> {
  await retryQueuedPurges(env);
}

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
          AND created_at < ?1
          AND NOT EXISTS (
            SELECT 1 FROM recording_upload_segments s
             WHERE s.slug = recordings.slug AND s.received_at >= ?1
          )
        LIMIT ?2`,
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

/*
 * Upload segments (see segments.ts) only matter while their stream is still
 * uploading. Once it is finalized, failed or aborted they are copies, so this
 * removes them here rather than on the finalize path. Deleted recordings take
 * their rows with them (ON DELETE CASCADE) and their objects in remove.ts.
 */
export async function sweepUploadSegments(env: CronEnv): Promise<void> {
  for (let batch = 0; batch < MAX_BATCHES; batch++) {
    const done = await env.DB.prepare(
      `SELECT DISTINCT s.slug, s.stream,
              CASE s.stream WHEN 'screen' THEN r.storage_key
                            ELSE r.webcam_storage_key END AS storageKey
         FROM recording_upload_segments s
         JOIN recordings r ON r.slug = s.slug
        WHERE CASE s.stream WHEN 'screen' THEN r.state
                            ELSE r.webcam_state END != 'pending'
        LIMIT ?`,
    )
      .bind(BATCH_SIZE)
      .all<{ slug: string; stream: string; storageKey: string | null }>();
    const rows = done.results ?? [];
    for (const row of rows) {
      try {
        if (row.storageKey) {
          await deleteObjectsWithPrefix(
            env.BUCKET,
            segmentPrefixFor(row.storageKey),
          );
        }
        await env.DB.batch([
          env.DB.prepare(
            `DELETE FROM recording_upload_segments WHERE slug = ? AND stream = ?`,
          ).bind(row.slug, row.stream),
          env.DB.prepare(
            `DELETE FROM recording_upload_parts WHERE slug = ? AND stream = ?`,
          ).bind(row.slug, row.stream),
        ]);
      } catch (err) {
        console.warn(`[cron] segment sweep failed for ${row.slug}:`, err);
      }
    }
    if (rows.length < BATCH_SIZE) break;
  }
}

/*
 * Posters uploaded before poster_blur or poster_thumb_key existed get both
 * here, and rows without a frame size get it from the same decode, one page
 * an hour. A thumbnail from an earlier generation is remade too, but only
 * where the recording has no camera: a camera card was drawn by the client
 * and the server cannot draw the bubble back in. Only JPEGs can be decoded;
 * a poster that still fails is picked up again next run.
 */
export async function backfillPosterDerivatives(env: CronEnv): Promise<void> {
  const pending = await env.DB.prepare(
    `SELECT slug, poster_key AS posterKey, poster_thumb_key AS oldThumbKey
       FROM recordings
      WHERE poster_key LIKE '%.jpg'
        AND (poster_blur IS NULL
          OR poster_thumb_key IS NULL
          OR (webcam_state != 'ready' AND poster_thumb_key NOT LIKE ?))
      LIMIT ?`,
  )
    .bind(`%${THUMB_SUFFIX}`, BATCH_SIZE)
    .all<{ slug: string; posterKey: string; oldThumbKey: string | null }>();

  for (const row of pending.results ?? []) {
    try {
      const obj = await env.BUCKET.get(row.posterKey);
      if (!obj) continue;
      const bytes = await obj.arrayBuffer();
      const thumb = posterThumbnail(bytes, "image/jpeg");
      if (!thumb) continue;
      const thumbKey = posterThumbKeyFor(
        row.posterKey,
        await posterDigest(bytes),
      );
      await env.BUCKET.put(thumbKey, thumb.thumb, {
        httpMetadata: {
          contentType: "image/jpeg",
          cacheControl: THUMB_CACHE_CONTROL,
        },
      });
      await env.DB.prepare(
        `UPDATE recordings
            SET poster_blur = ?,
                poster_thumb_key = ?,
                width = COALESCE(width, ?),
                height = COALESCE(height, ?)
          WHERE slug = ? AND poster_key = ?`,
      )
        .bind(
          thumb.blur,
          thumbKey,
          thumb.width,
          thumb.height,
          row.slug,
          row.posterKey,
        )
        .run();
      if (row.oldThumbKey && row.oldThumbKey !== thumbKey) {
        await env.BUCKET.delete(row.oldThumbKey).catch(() => undefined);
      }
    } catch (err) {
      console.warn(`[cron] poster derivatives failed for ${row.slug}:`, err);
    }
  }
}

export async function runDailyRetentionSweep(env: CronEnv): Promise<void> {
  const now = Date.now();
  // A cutoff of 0 matches no idle row, so self-hosting keeps only the cleanup arms.
  const retentionCutoff = isSelfHosted(env) ? 0 : now - RETENTION_MS;
  const failedCutoff = now - FAILED_RETENTION_MS;

  // Paid storage is kept until someone deletes it; the idle sweep only
  // reclaims free workspaces. The '' fallback keeps workspace-less rows
  // expiring, since NULL NOT IN (...) is never true.
  const paidWorkspaces = JSON.stringify(await listPaidWorkspaceIds(env.DB));

  const db = createD1Db(env.DB);
  for (let batch = 0; batch < MAX_BATCHES; batch++) {
    const expiring = await env.DB.prepare(
      `SELECT slug, storage_key AS storageKey, poster_key AS posterKey,
              poster_thumb_key AS posterThumbKey,
              webcam_storage_key AS webcamStorageKey, state,
              size_bytes AS sizeBytes, webcam_size_bytes AS webcamSizeBytes
         FROM recordings
        WHERE (state = 'ready' AND last_viewed_at < ?
               AND COALESCE(workspace_id, '') NOT IN (SELECT value FROM json_each(?)))
           OR (state = 'failed' AND created_at < ?)
        LIMIT ?`,
    )
      .bind(retentionCutoff, paidWorkspaces, failedCutoff, BATCH_SIZE)
      .all<{
        slug: string;
        storageKey: string;
        posterKey: string | null;
        posterThumbKey: string | null;
        webcamStorageKey: string | null;
        state: string;
        sizeBytes: number;
        webcamSizeBytes: number;
      }>();

    const rows = expiring.results ?? [];
    for (const row of rows) {
      try {
        await env.BUCKET.delete(objectKeysFor(row));
        await deleteObjectsWithPrefix(
          env.BUCKET,
          audioPartPrefixFor(row.storageKey),
        );
      } catch (err) {
        console.warn(`[cron] r2 delete failed for ${row.slug}:`, err);
      }
      await purgeRecordingMedia(env, row);
      await db.deleteRecording(row.slug);
    }
    if (rows.length < BATCH_SIZE) break;
  }

  await sweepScreenshots(env, retentionCutoff, failedCutoff, paidWorkspaces);
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
  paidWorkspaces: string,
): Promise<void> {
  for (let batch = 0; batch < MAX_BATCHES; batch++) {
    const expiring = await env.DB.prepare(
      `SELECT id, storage_key AS storageKey, state
         FROM screenshots
        WHERE (state = 'ready' AND COALESCE(last_viewed_at, created_at) < ?
               AND COALESCE(workspace_id, '') NOT IN (SELECT value FROM json_each(?)))
           OR (state = 'deleted' AND updated_at < ?)
        LIMIT ?`,
    )
      .bind(retentionCutoff, paidWorkspaces, deletedCutoff, BATCH_SIZE)
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
