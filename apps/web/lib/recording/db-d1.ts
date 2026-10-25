/// <reference types="@cloudflare/workers-types" />

import type {
  RecordingComment,
  RecordingReaction,
  RecordingRow,
  RecordingVisibility,
  TranscriptPartRow,
  TranscriptRow,
  WebcamState,
} from "./types";
import type {
  RecordingSource,
  RecordingPreset,
  RecordingState,
} from "./limits";
import type { RecordingDb } from "./db-types";

type D1Row = {
  slug: string;
  device_id: string;
  storage_key: string;
  poster_key: string | null;
  poster_blur: string | null;
  poster_thumb_key: string | null;
  upload_id: string | null;
  size_bytes: number;
  duration_ms: number | null;
  width: number | null;
  height: number | null;
  source: string;
  preset: string;
  created_at: number;
  last_viewed_at: number;
  view_count: number;
  title: string | null;
  state: string;
  user_id: string | null;
  workspace_id: string | null;
  visibility: string;
  webcam_storage_key: string | null;
  webcam_upload_id: string | null;
  webcam_size_bytes: number;
  webcam_state: string;
  config_json: string | null;
  summary_chapters_json: string | null;
};

type D1ReactionRow = {
  id: number;
  slug: string;
  emoji: string;
  timestamp_ms: number;
  created_at: number;
  user_id: string | null;
  user_name: string | null;
  user_image?: string | null;
};

type D1ViewerRow = {
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_image: string | null;
  last_viewed_at: number;
  views: number;
};

type D1CommentRow = {
  id: number;
  slug: string;
  user_id: string;
  user_name: string;
  body: string;
  created_at: number;
  timestamp_ms: number | null;
  user_image?: string | null;
};

function rowFromD1(r: D1Row): RecordingRow {
  return {
    slug: r.slug,
    deviceId: r.device_id,
    storageKey: r.storage_key,
    posterKey: r.poster_key,
    posterBlur: r.poster_blur ?? null,
    posterThumbKey: r.poster_thumb_key ?? null,
    uploadId: r.upload_id,
    sizeBytes: r.size_bytes,
    durationMs: r.duration_ms,
    width: r.width,
    height: r.height,
    source: r.source as RecordingSource,
    preset: r.preset as RecordingPreset,
    createdAt: r.created_at,
    lastViewedAt: r.last_viewed_at,
    viewCount: r.view_count ?? 0,
    title: r.title ?? null,
    state: r.state as RecordingState,
    userId: r.user_id ?? null,
    workspaceId: r.workspace_id ?? null,
    visibility: (r.visibility as RecordingVisibility) ?? "public",
    webcamStorageKey: r.webcam_storage_key ?? null,
    webcamUploadId: r.webcam_upload_id ?? null,
    webcamSizeBytes: r.webcam_size_bytes ?? 0,
    webcamState: (r.webcam_state as WebcamState) ?? "none",
    configJson: r.config_json ?? null,
    summaryChaptersJson: r.summary_chapters_json ?? null,
  };
}

function reactionFromD1(r: D1ReactionRow): RecordingReaction {
  return {
    id: r.id,
    slug: r.slug,
    emoji: r.emoji,
    timestampMs: r.timestamp_ms,
    createdAt: r.created_at,
    userId: r.user_id ?? null,
    userName: r.user_name ?? null,
    userImage: r.user_image ?? null,
  };
}

type D1TranscriptRow = {
  slug: string;
  status: string;
  language: string | null;
  part_count: number;
  auto_json: string | null;
  edited_json: string | null;
  error: string | null;
  created_at: number;
  updated_at: number;
};

type D1TranscriptPartRow = {
  slug: string;
  part_number: number;
  storage_key: string;
  start_ms: number;
  end_ms: number;
  segments_json: string | null;
  updated_at: number;
};

function transcriptFromD1(r: D1TranscriptRow): TranscriptRow {
  return {
    slug: r.slug,
    status: r.status as TranscriptRow["status"],
    language: r.language ?? null,
    partCount: r.part_count,
    autoJson: r.auto_json ?? null,
    editedJson: r.edited_json ?? null,
    error: r.error ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function transcriptPartFromD1(r: D1TranscriptPartRow): TranscriptPartRow {
  return {
    slug: r.slug,
    partNumber: r.part_number,
    storageKey: r.storage_key,
    startMs: r.start_ms,
    endMs: r.end_ms,
    segmentsJson: r.segments_json ?? null,
    updatedAt: r.updated_at,
  };
}

const TRANSCRIPT_COLUMNS =
  "slug, status, language, part_count, auto_json, edited_json, error, created_at, updated_at";
const TRANSCRIPT_PART_COLUMNS =
  "slug, part_number, storage_key, start_ms, end_ms, segments_json, updated_at";

function commentFromD1(r: D1CommentRow): RecordingComment {
  return {
    id: r.id,
    slug: r.slug,
    userId: r.user_id,
    userName: r.user_name,
    body: r.body,
    createdAt: r.created_at,
    timestampMs: r.timestamp_ms ?? null,
    userImage: r.user_image ?? null,
  };
}

const COLUMNS_SELECT =
  "slug, device_id, storage_key, poster_key, poster_blur, poster_thumb_key, upload_id, " +
  "size_bytes, duration_ms, width, height, source, preset, " +
  "created_at, last_viewed_at, view_count, title, state, user_id, workspace_id, visibility, " +
  "webcam_storage_key, webcam_upload_id, webcam_size_bytes, webcam_state, " +
  "config_json, summary_chapters_json";

export function createD1Db(d1: D1Database): RecordingDb {
  /*
   * bake_status is omitted: the column lingers in D1 from the legacy
   * /api/replace flow but always defaults to 'none' now. Drop it in a
   * follow-up migration once existing rows have been swept.
   */
  const stmtInsert = d1.prepare(
    `INSERT INTO recordings (
       slug, device_id, storage_key, poster_key, poster_blur, poster_thumb_key, upload_id,
       size_bytes, duration_ms, width, height,
       source, preset, created_at, last_viewed_at, view_count, title, state,
       user_id, workspace_id, visibility,
       webcam_storage_key, webcam_upload_id, webcam_size_bytes, webcam_state,
       config_json, summary_chapters_json
     )
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18,
             ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27)`,
  );

  const stmtGet = d1.prepare(
    `SELECT ${COLUMNS_SELECT} FROM recordings WHERE slug = ?1 LIMIT 1`,
  );

  // recording_activity rows go with the recording via ON DELETE CASCADE
  // (migration 0008); no delete path touches that table directly.
  const stmtDelete = d1.prepare(`DELETE FROM recordings WHERE slug = ?1`);

  const stmtListForDevice = d1.prepare(
    `SELECT ${COLUMNS_SELECT} FROM recordings
     WHERE device_id = ?1
     ORDER BY created_at DESC`,
  );

  const stmtListForUser = d1.prepare(
    `SELECT ${COLUMNS_SELECT} FROM recordings
     WHERE user_id = ?1
     ORDER BY created_at DESC`,
  );

  const stmtTotalStorage = d1.prepare(
    `SELECT COALESCE(SUM(size_bytes), 0) AS total
     FROM recordings
     WHERE device_id = ?1 AND state = 'ready'`,
  );

  const stmtActiveCount = d1.prepare(
    `SELECT COUNT(*) AS n
     FROM recordings
     WHERE device_id = ?1 AND state = 'ready'`,
  );

  const stmtBumpLastViewed = d1.prepare(
    `UPDATE recordings
       SET last_viewed_at = ?2, view_count = view_count + 1
       WHERE slug = ?1`,
  );

  // A viewer who signs in between visits keeps one row: the user id lands on
  // the next view under their new key, and the anonymous row stays as it was.
  const stmtUpsertView = d1.prepare(
    `INSERT INTO recording_views
       (slug, viewer_key, user_id, first_viewed_at, last_viewed_at, views)
     VALUES (?1, ?2, ?3, ?4, ?4, 1)
     ON CONFLICT (slug, viewer_key) DO UPDATE
       SET last_viewed_at = excluded.last_viewed_at,
           views = views + 1,
           user_id = COALESCE(excluded.user_id, user_id)`,
  );

  const stmtTouchLastViewed = d1.prepare(
    `UPDATE recordings SET last_viewed_at = ?2 WHERE slug = ?1`,
  );

  const stmtListViewers = d1.prepare(
    `SELECT v.user_id, v.last_viewed_at, v.views,
            u.name AS user_name, u.email AS user_email, u.image AS user_image
       FROM recording_views AS v
       LEFT JOIN users AS u ON u.id = v.user_id
       WHERE v.slug = ?1 AND (v.user_id IS NULL OR v.user_id <> ?2)
       ORDER BY v.last_viewed_at DESC
       LIMIT 100`,
  );

  // Reactions and comments recording the unified `recording_activity` table
  // (migration 0012), distinguished by `kind`.
  const stmtAddReaction = d1.prepare(
    `INSERT INTO recording_activity (slug, kind, emoji, timestamp_ms, created_at, user_id, user_name)
     VALUES (?1, 'reaction', ?2, ?3, ?4, ?5, ?6)
     RETURNING id, slug, emoji, timestamp_ms, created_at, user_id, user_name`,
  );

  const stmtListReactions = d1.prepare(
    `SELECT a.id, a.slug, a.emoji, a.timestamp_ms, a.created_at,
            a.user_id, a.user_name, u.image AS user_image
       FROM recording_activity AS a
       LEFT JOIN users AS u ON u.id = a.user_id
       WHERE a.slug = ?1 AND a.kind = 'reaction'
       ORDER BY a.timestamp_ms ASC`,
  );

  const stmtCountReactions = d1.prepare(
    `SELECT COUNT(*) AS n FROM recording_activity WHERE slug = ?1 AND kind = 'reaction'`,
  );

  const stmtAddComment = d1.prepare(
    `INSERT INTO recording_activity (slug, kind, user_id, user_name, body, created_at, timestamp_ms)
     VALUES (?1, 'comment', ?2, ?3, ?4, ?5, ?6)
     RETURNING id, slug, user_id, user_name, body, created_at, timestamp_ms`,
  );

  const stmtListComments = d1.prepare(
    `SELECT a.id, a.slug, a.user_id, a.user_name, a.body, a.created_at,
            a.timestamp_ms, u.image AS user_image
       FROM recording_activity AS a
       LEFT JOIN users AS u ON u.id = a.user_id
       WHERE a.slug = ?1 AND a.kind = 'comment'
       ORDER BY a.created_at ASC`,
  );

  const stmtCountComments = d1.prepare(
    `SELECT COUNT(*) AS n FROM recording_activity WHERE slug = ?1 AND kind = 'comment'`,
  );

  const stmtGetReaction = d1.prepare(
    `SELECT a.id, a.slug, a.emoji, a.timestamp_ms, a.created_at,
            a.user_id, a.user_name, u.image AS user_image
       FROM recording_activity AS a
       LEFT JOIN users AS u ON u.id = a.user_id
       WHERE a.id = ?1 AND a.kind = 'reaction'
       LIMIT 1`,
  );

  const stmtDeleteReaction = d1.prepare(
    `DELETE FROM recording_activity WHERE id = ?1 AND kind = 'reaction'`,
  );

  const stmtGetComment = d1.prepare(
    `SELECT id, slug, user_id, user_name, body, created_at, timestamp_ms
       FROM recording_activity
       WHERE id = ?1 AND kind = 'comment'
       LIMIT 1`,
  );

  const stmtDeleteComment = d1.prepare(
    `DELETE FROM recording_activity WHERE id = ?1 AND kind = 'comment'`,
  );

  const stmtStartTranscript = d1.prepare(
    `INSERT INTO recording_transcripts
       (slug, status, language, part_count, auto_json, edited_json, error, created_at, updated_at)
     VALUES (?1, 'pending', ?2, ?3, NULL, NULL, NULL, ?4, ?4)
     ON CONFLICT(slug) DO UPDATE SET
       status = 'pending',
       language = excluded.language,
       part_count = excluded.part_count,
       auto_json = NULL,
       edited_json = NULL,
       error = NULL,
       updated_at = excluded.updated_at`,
  );

  const stmtDeleteTranscriptParts = d1.prepare(
    `DELETE FROM recording_transcript_parts WHERE slug = ?1`,
  );

  const stmtInsertTranscriptPart = d1.prepare(
    `INSERT INTO recording_transcript_parts
       (slug, part_number, storage_key, start_ms, end_ms, segments_json, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, NULL, ?6)`,
  );

  const stmtGetTranscript = d1.prepare(
    `SELECT ${TRANSCRIPT_COLUMNS} FROM recording_transcripts WHERE slug = ?1 LIMIT 1`,
  );

  const stmtGetTranscriptPart = d1.prepare(
    `SELECT ${TRANSCRIPT_PART_COLUMNS} FROM recording_transcript_parts
       WHERE slug = ?1 AND part_number = ?2
       LIMIT 1`,
  );

  const stmtListTranscriptParts = d1.prepare(
    `SELECT ${TRANSCRIPT_PART_COLUMNS} FROM recording_transcript_parts
       WHERE slug = ?1
       ORDER BY part_number ASC`,
  );

  const stmtSetTranscriptPartLines = d1.prepare(
    `UPDATE recording_transcript_parts SET segments_json = ?3, updated_at = ?4
       WHERE slug = ?1 AND part_number = ?2`,
  );

  const stmtFinishTranscript = d1.prepare(
    `UPDATE recording_transcripts
       SET status = 'ready', auto_json = ?2, error = NULL, updated_at = ?3
       WHERE slug = ?1 AND status = 'pending'`,
  );

  const stmtFailTranscript = d1.prepare(
    `UPDATE recording_transcripts
       SET status = 'failed', error = ?2, updated_at = ?3
       WHERE slug = ?1 AND status = 'pending'`,
  );

  return {
    async insertRecording(row) {
      await stmtInsert
        .bind(
          row.slug,
          row.deviceId,
          row.storageKey,
          row.posterKey,
          row.posterBlur,
          row.posterThumbKey,
          row.uploadId,
          row.sizeBytes,
          row.durationMs,
          row.width,
          row.height,
          row.source,
          row.preset,
          row.createdAt,
          row.lastViewedAt,
          row.viewCount,
          row.title,
          row.state,
          row.userId,
          row.workspaceId,
          row.visibility,
          row.webcamStorageKey,
          row.webcamUploadId,
          row.webcamSizeBytes,
          row.webcamState,
          row.configJson,
          row.summaryChaptersJson,
        )
        .run();
    },

    async getRecording(slug) {
      const r = await stmtGet.bind(slug).first<D1Row>();
      return r ? rowFromD1(r) : null;
    },

    async updateRecording(slug, patch) {
      // Columns come from an allowlist — no caller-supplied SQL.
      const sets: string[] = [];
      const binds: unknown[] = [];
      const map: Partial<Record<keyof RecordingRow, string>> = {
        deviceId: "device_id",
        storageKey: "storage_key",
        posterKey: "poster_key",
        posterBlur: "poster_blur",
        posterThumbKey: "poster_thumb_key",
        uploadId: "upload_id",
        sizeBytes: "size_bytes",
        durationMs: "duration_ms",
        width: "width",
        height: "height",
        source: "source",
        preset: "preset",
        createdAt: "created_at",
        lastViewedAt: "last_viewed_at",
        viewCount: "view_count",
        title: "title",
        state: "state",
        userId: "user_id",
        workspaceId: "workspace_id",
        visibility: "visibility",
        webcamStorageKey: "webcam_storage_key",
        webcamUploadId: "webcam_upload_id",
        webcamSizeBytes: "webcam_size_bytes",
        webcamState: "webcam_state",
        configJson: "config_json",
        summaryChaptersJson: "summary_chapters_json",
      };
      let placeholder = 1;
      for (const key of Object.keys(patch) as (keyof RecordingRow)[]) {
        const col = map[key];
        if (!col) continue;
        sets.push(`${col} = ?${placeholder}`);
        binds.push(patch[key] ?? null);
        placeholder++;
      }
      if (sets.length === 0) return this.getRecording(slug);

      const sql = `UPDATE recordings SET ${sets.join(
        ", ",
      )} WHERE slug = ?${placeholder} RETURNING ${COLUMNS_SELECT}`;
      binds.push(slug);
      const result = await d1
        .prepare(sql)
        .bind(...binds)
        .first<D1Row>();
      return result ? rowFromD1(result) : null;
    },

    async deleteRecording(slug) {
      const res = await stmtDelete.bind(slug).run();
      return (res.meta?.changes ?? 0) > 0;
    },

    async listRecordingsForDevice(deviceId) {
      const res = await stmtListForDevice.bind(deviceId).all<D1Row>();
      return res.results.map(rowFromD1);
    },

    async listRecordingsForUser(userId) {
      const res = await stmtListForUser.bind(userId).all<D1Row>();
      return res.results.map(rowFromD1);
    },

    async totalStorageForDevice(deviceId) {
      const r = await stmtTotalStorage
        .bind(deviceId)
        .first<{ total: number | null }>();
      return r?.total ?? 0;
    },

    async activeRecordingCountForDevice(deviceId) {
      const r = await stmtActiveCount.bind(deviceId).first<{ n: number }>();
      return r?.n ?? 0;
    },

    async recordView(slug, viewerKey, userId) {
      const now = Date.now();
      await d1.batch([
        stmtBumpLastViewed.bind(slug, now),
        stmtUpsertView.bind(slug, viewerKey, userId, now),
      ]);
    },

    async touchLastViewed(slug) {
      await stmtTouchLastViewed.bind(slug, Date.now()).run();
    },

    async listViewers(slug, excludeUserId) {
      const { results } = await stmtListViewers
        .bind(slug, excludeUserId ?? "")
        .all<D1ViewerRow>();
      return results.map((r) => ({
        userId: r.user_id,
        name: r.user_name,
        email: r.user_email,
        image: r.user_image,
        lastViewedAt: r.last_viewed_at,
        views: r.views,
      }));
    },

    async addReaction({ slug, emoji, timestampMs, userId, userName }) {
      const now = Date.now();
      const r = await stmtAddReaction
        .bind(slug, emoji, timestampMs, now, userId, userName)
        .first<D1ReactionRow>();
      if (!r) throw new Error("addReaction: insert returned no row");
      return reactionFromD1(r);
    },

    async listReactions(slug) {
      const res = await stmtListReactions.bind(slug).all<D1ReactionRow>();
      return res.results.map(reactionFromD1);
    },

    async countReactions(slug) {
      const r = await stmtCountReactions.bind(slug).first<{ n: number }>();
      return r?.n ?? 0;
    },

    async addComment({ slug, userId, userName, body, timestampMs }) {
      const now = Date.now();
      const r = await stmtAddComment
        .bind(slug, userId, userName, body, now, timestampMs)
        .first<D1CommentRow>();
      if (!r) throw new Error("addComment: insert returned no row");
      return commentFromD1(r);
    },

    async listComments(slug) {
      const res = await stmtListComments.bind(slug).all<D1CommentRow>();
      return res.results.map(commentFromD1);
    },

    async countComments(slug) {
      const r = await stmtCountComments.bind(slug).first<{ n: number }>();
      return r?.n ?? 0;
    },

    async getReaction(id) {
      const r = await stmtGetReaction.bind(id).first<D1ReactionRow>();
      return r ? reactionFromD1(r) : null;
    },

    async deleteReaction(id) {
      const r = await stmtDeleteReaction.bind(id).run();
      return (r.meta?.changes ?? 0) > 0;
    },

    async getComment(id) {
      const r = await stmtGetComment.bind(id).first<D1CommentRow>();
      return r ? commentFromD1(r) : null;
    },

    async deleteComment(id) {
      const r = await stmtDeleteComment.bind(id).run();
      return (r.meta?.changes ?? 0) > 0;
    },

    async createTranscriptJob({ slug, language, parts }) {
      const now = Date.now();
      await d1.batch([
        stmtStartTranscript.bind(slug, language, parts.length, now),
        stmtDeleteTranscriptParts.bind(slug),
        ...parts.map((p) =>
          stmtInsertTranscriptPart.bind(
            slug,
            p.partNumber,
            p.storageKey,
            p.startMs,
            p.endMs,
            now,
          ),
        ),
      ]);
    },

    async getTranscript(slug) {
      const r = await stmtGetTranscript.bind(slug).first<D1TranscriptRow>();
      return r ? transcriptFromD1(r) : null;
    },

    async getTranscriptPart(slug, partNumber) {
      const r = await stmtGetTranscriptPart
        .bind(slug, partNumber)
        .first<D1TranscriptPartRow>();
      return r ? transcriptPartFromD1(r) : null;
    },

    async listTranscriptParts(slug) {
      const res = await stmtListTranscriptParts
        .bind(slug)
        .all<D1TranscriptPartRow>();
      return res.results.map(transcriptPartFromD1);
    },

    async setTranscriptPartLines(slug, partNumber, segmentsJson) {
      await stmtSetTranscriptPartLines
        .bind(slug, partNumber, segmentsJson, Date.now())
        .run();
    },

    async finishTranscript(slug, autoJson) {
      await stmtFinishTranscript.bind(slug, autoJson, Date.now()).run();
    },

    async failTranscript(slug, error) {
      await stmtFailTranscript.bind(slug, error, Date.now()).run();
    },
  };
}
