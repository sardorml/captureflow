/// <reference types="@cloudflare/workers-types" />

import { opendir, stat, statfs } from "node:fs/promises";
import { join } from "node:path";
import {
  audioPartPrefixFor,
  objectKeysFor,
  screenshotObjectKeysFor,
  segmentPrefixFor,
  shareImagePrefixFor,
} from "@captureflow/shared/object-keys";
import { countInstanceAdmins, isInstanceAdmin } from "./instance";

/*
 * What a self-hosted admin may take out of the instance: recordings,
 * screenshots, whole workspaces and accounts, with their storage objects. The
 * web app's own delete paths derive the object list from the same helper, so
 * nothing is stranded by a drift between the two.
 */

export type InstanceStorage = {
  recordings: { count: number; bytes: number };
  screenshots: { count: number; bytes: number };
  stranded: { count: number; bytes: number };
};

export type DiskUsage = {
  dataBytes: number;
  freeBytes: number;
  totalBytes: number;
};

export type StrandedRecording = {
  slug: string;
  title: string | null;
  state: string;
  sizeBytes: number;
  createdAt: number;
  ownerEmail: string | null;
};

export type WorkspaceStorage = {
  id: string;
  name: string;
  kind: "personal" | "team";
  ownerEmail: string;
  recordingCount: number;
  screenshotCount: number;
  bytes: number;
};

const DAY_MS = 24 * 3600 * 1000;

// A pending upload this old never finished; failed ones never will.
const STRANDED_WHERE = `(r.state = 'failed' OR (r.state = 'pending' AND r.created_at < ?1))`;

async function deletePrefix(bucket: R2Bucket, prefix: string): Promise<void> {
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ prefix, cursor });
    if (page.objects.length > 0) {
      await bucket.delete(page.objects.map((o) => o.key));
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}

type RecordingObjectsRow = {
  storage_key: string;
  poster_key: string | null;
  poster_thumb_key: string | null;
  webcam_storage_key: string | null;
  upload_id: string | null;
  webcam_upload_id: string | null;
};

export async function removeInstanceRecording(
  db: D1Database,
  bucket: R2Bucket,
  slug: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT storage_key, poster_key, poster_thumb_key, webcam_storage_key,
              upload_id, webcam_upload_id
         FROM recordings WHERE slug = ?1`,
    )
    .bind(slug)
    .first<RecordingObjectsRow>();
  if (!row) return false;
  const uploads: [string | null, string | null][] = [
    [row.storage_key, row.upload_id],
    [row.webcam_storage_key, row.webcam_upload_id],
  ];
  for (const [key, uploadId] of uploads) {
    if (!key || !uploadId) continue;
    try {
      await bucket.resumeMultipartUpload(key, uploadId).abort();
    } catch {
      // Already completed or aborted; the objects below are what matter.
    }
  }
  await bucket.delete(
    objectKeysFor({
      storageKey: row.storage_key,
      posterKey: row.poster_key,
      posterThumbKey: row.poster_thumb_key,
      webcamStorageKey: row.webcam_storage_key,
    }),
  );
  await deletePrefix(bucket, audioPartPrefixFor(row.storage_key));
  await deletePrefix(bucket, segmentPrefixFor(row.storage_key));
  await deletePrefix(bucket, shareImagePrefixFor(row.storage_key));
  if (row.webcam_storage_key) {
    await deletePrefix(bucket, segmentPrefixFor(row.webcam_storage_key));
  }
  await db.prepare(`DELETE FROM recordings WHERE slug = ?1`).bind(slug).run();
  return true;
}

export async function removeInstanceScreenshot(
  db: D1Database,
  bucket: R2Bucket,
  id: string,
): Promise<boolean> {
  const row = await db
    .prepare(`SELECT storage_key FROM screenshots WHERE id = ?1`)
    .bind(id)
    .first<{ storage_key: string }>();
  if (!row) return false;
  await bucket.delete(screenshotObjectKeysFor(row.storage_key));
  await db.prepare(`DELETE FROM screenshots WHERE id = ?1`).bind(id).run();
  return true;
}

// Everything recorded by one person or into one workspace.
async function removeLibrary(
  db: D1Database,
  bucket: R2Bucket,
  by: { column: "user_id" | "workspace_id"; value: string },
): Promise<void> {
  const [recordings, screenshots] = await Promise.all([
    db
      .prepare(`SELECT slug FROM recordings WHERE ${by.column} = ?1`)
      .bind(by.value)
      .all<{ slug: string }>(),
    db
      .prepare(`SELECT id FROM screenshots WHERE ${by.column} = ?1`)
      .bind(by.value)
      .all<{ id: string }>(),
  ]);
  for (const { slug } of recordings.results ?? []) {
    await removeInstanceRecording(db, bucket, slug);
  }
  for (const { id } of screenshots.results ?? []) {
    await removeInstanceScreenshot(db, bucket, id);
  }
}

// The message to refuse with, or null once the workspace is gone.
export async function deleteInstanceWorkspace(
  db: D1Database,
  bucket: R2Bucket,
  id: string,
): Promise<string | null> {
  const row = await db
    .prepare(`SELECT kind FROM workspace WHERE id = ?1`)
    .bind(id)
    .first<{ kind: string }>();
  if (!row) return "That workspace no longer exists.";
  if (row.kind === "personal") {
    return "A personal workspace goes with its owner's account.";
  }
  await removeLibrary(db, bucket, { column: "workspace_id", value: id });
  await db.prepare(`DELETE FROM workspace WHERE id = ?1`).bind(id).run();
  return null;
}

// The message to refuse with, or null once the account is gone.
export async function deleteInstanceUser(
  db: D1Database,
  bucket: R2Bucket,
  args: { userId: string; byUserId: string },
): Promise<string | null> {
  if (args.userId === args.byUserId) {
    return "You can't delete your own account from here.";
  }
  const user = await db
    .prepare(`SELECT 1 AS yes FROM users WHERE id = ?1`)
    .bind(args.userId)
    .first<{ yes: number }>();
  if (!user) return "That account no longer exists.";
  if (
    (await isInstanceAdmin(db, args.userId)) &&
    (await countInstanceAdmins(db)) === 1
  ) {
    return "Make someone else an admin first.";
  }
  const owned = await db
    .prepare(
      `SELECT name FROM workspace WHERE owner_user_id = ?1 AND kind = 'team'`,
    )
    .bind(args.userId)
    .all<{ name: string }>();
  const names = (owned.results ?? []).map((w) => w.name);
  if (names.length > 0) {
    return `Give these workspaces a new owner or delete them first: ${names.join(", ")}.`;
  }
  await removeLibrary(db, bucket, { column: "user_id", value: args.userId });
  await db.prepare(`DELETE FROM users WHERE id = ?1`).bind(args.userId).run();
  return null;
}

export async function getInstanceStorage(
  db: D1Database,
): Promise<InstanceStorage> {
  const row = await db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM recordings WHERE state = 'ready') AS rec_count,
         (SELECT COALESCE(SUM(size_bytes + webcam_size_bytes), 0) FROM recordings
           WHERE state = 'ready') AS rec_bytes,
         (SELECT COUNT(*) FROM screenshots WHERE state = 'ready') AS shot_count,
         (SELECT COALESCE(SUM(size_bytes), 0) FROM screenshots
           WHERE state = 'ready') AS shot_bytes,
         (SELECT COUNT(*) FROM recordings r WHERE ${STRANDED_WHERE}) AS stranded_count,
         (SELECT COALESCE(SUM(size_bytes + webcam_size_bytes), 0) FROM recordings r
           WHERE ${STRANDED_WHERE}) AS stranded_bytes`,
    )
    .bind(Date.now() - DAY_MS)
    .first<{
      rec_count: number;
      rec_bytes: number;
      shot_count: number;
      shot_bytes: number;
      stranded_count: number;
      stranded_bytes: number;
    }>();
  return {
    recordings: { count: row?.rec_count ?? 0, bytes: row?.rec_bytes ?? 0 },
    screenshots: { count: row?.shot_count ?? 0, bytes: row?.shot_bytes ?? 0 },
    stranded: {
      count: row?.stranded_count ?? 0,
      bytes: row?.stranded_bytes ?? 0,
    },
  };
}

export async function listStrandedRecordings(
  db: D1Database,
): Promise<StrandedRecording[]> {
  const { results } = await db
    .prepare(
      `SELECT r.slug, r.title, r.state, r.created_at,
              r.size_bytes + r.webcam_size_bytes AS size_bytes,
              u.email AS owner_email
         FROM recordings r
         LEFT JOIN users u ON u.id = r.user_id
        WHERE ${STRANDED_WHERE}
        ORDER BY r.created_at DESC`,
    )
    .bind(Date.now() - DAY_MS)
    .all<{
      slug: string;
      title: string | null;
      state: string;
      created_at: number;
      size_bytes: number;
      owner_email: string | null;
    }>();
  return (results ?? []).map((r) => ({
    slug: r.slug,
    title: r.title,
    state: r.state,
    sizeBytes: r.size_bytes,
    createdAt: r.created_at,
    ownerEmail: r.owner_email,
  }));
}

export async function cleanStrandedRecordings(
  db: D1Database,
  bucket: R2Bucket,
): Promise<number> {
  let removed = 0;
  for (const { slug } of await listStrandedRecordings(db)) {
    if (await removeInstanceRecording(db, bucket, slug)) removed += 1;
  }
  return removed;
}

export async function listWorkspaceStorage(
  db: D1Database,
  limit = 20,
): Promise<WorkspaceStorage[]> {
  const { results } = await db
    .prepare(
      `SELECT w.id, w.name, w.kind, u.email AS owner_email,
              (SELECT COUNT(*) FROM recordings r
                WHERE r.workspace_id = w.id AND r.state = 'ready') AS recording_count,
              (SELECT COUNT(*) FROM screenshots s
                WHERE s.workspace_id = w.id AND s.state = 'ready') AS screenshot_count,
              (SELECT COALESCE(SUM(r.size_bytes + r.webcam_size_bytes), 0) FROM recordings r
                WHERE r.workspace_id = w.id AND r.state = 'ready')
              + (SELECT COALESCE(SUM(s.size_bytes), 0) FROM screenshots s
                WHERE s.workspace_id = w.id AND s.state = 'ready') AS bytes
         FROM workspace w
         JOIN users u ON u.id = w.owner_user_id
        ORDER BY bytes DESC, w.created_at ASC
        LIMIT ?1`,
    )
    .bind(limit)
    .all<{
      id: string;
      name: string;
      kind: "personal" | "team";
      owner_email: string;
      recording_count: number;
      screenshot_count: number;
      bytes: number;
    }>();
  return (results ?? []).map((w) => ({
    id: w.id,
    name: w.name,
    kind: w.kind,
    ownerEmail: w.owner_email,
    recordingCount: w.recording_count,
    screenshotCount: w.screenshot_count,
    bytes: w.bytes,
  }));
}

async function directoryBytes(dir: string): Promise<number> {
  let total = 0;
  const handle = await opendir(dir);
  for await (const entry of handle) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) total += await directoryBytes(path);
    else if (entry.isFile()) total += (await stat(path)).size;
  }
  return total;
}

// What the data directory takes on disk and what the volume has left.
export async function getDiskUsage(dataDir: string): Promise<DiskUsage> {
  const [dataBytes, fs] = await Promise.all([
    directoryBytes(dataDir),
    statfs(dataDir),
  ]);
  return {
    dataBytes,
    freeBytes: fs.bavail * fs.bsize,
    totalBytes: fs.blocks * fs.bsize,
  };
}
