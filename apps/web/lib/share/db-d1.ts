/// <reference types="@cloudflare/workers-types" />

import type {
  ShareComment,
  ShareReaction,
  ShareRow,
  ShareVisibility,
  WebcamState,
} from "./types";
import type { ShareSource, SharePreset, ShareState } from "./limits";
import type { ShareDb } from "./db-types";

type D1Row = {
  slug: string;
  device_id: string;
  storage_key: string;
  poster_key: string | null;
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

function rowFromD1(r: D1Row): ShareRow {
  return {
    slug: r.slug,
    deviceId: r.device_id,
    storageKey: r.storage_key,
    posterKey: r.poster_key,
    uploadId: r.upload_id,
    sizeBytes: r.size_bytes,
    durationMs: r.duration_ms,
    width: r.width,
    height: r.height,
    source: r.source as ShareSource,
    preset: r.preset as SharePreset,
    createdAt: r.created_at,
    lastViewedAt: r.last_viewed_at,
    viewCount: r.view_count ?? 0,
    title: r.title ?? null,
    state: r.state as ShareState,
    userId: r.user_id ?? null,
    workspaceId: r.workspace_id ?? null,
    visibility: (r.visibility as ShareVisibility) ?? "public",
    webcamStorageKey: r.webcam_storage_key ?? null,
    webcamUploadId: r.webcam_upload_id ?? null,
    webcamSizeBytes: r.webcam_size_bytes ?? 0,
    webcamState: (r.webcam_state as WebcamState) ?? "none",
  };
}

function reactionFromD1(r: D1ReactionRow): ShareReaction {
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

function commentFromD1(r: D1CommentRow): ShareComment {
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
  "slug, device_id, storage_key, poster_key, upload_id, " +
  "size_bytes, duration_ms, width, height, source, preset, " +
  "created_at, last_viewed_at, view_count, title, state, user_id, workspace_id, visibility, " +
  "webcam_storage_key, webcam_upload_id, webcam_size_bytes, webcam_state";

export function createD1Db(d1: D1Database): ShareDb {
  /*
   * bake_status is omitted: the column lingers in D1 from the legacy
   * /api/replace flow but always defaults to 'none' now. Drop it in a
   * follow-up migration once existing rows have been swept.
   */
  const stmtInsert = d1.prepare(
    `INSERT INTO shares (
       slug, device_id, storage_key, poster_key, upload_id,
       size_bytes, duration_ms, width, height,
       source, preset, created_at, last_viewed_at, view_count, title, state,
       user_id, workspace_id, visibility,
       webcam_storage_key, webcam_upload_id, webcam_size_bytes, webcam_state
     )
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18,
             ?19, ?20, ?21, ?22, ?23)`,
  );

  const stmtGet = d1.prepare(
    `SELECT ${COLUMNS_SELECT} FROM shares WHERE slug = ?1 LIMIT 1`,
  );

  const stmtDelete = d1.prepare(`DELETE FROM shares WHERE slug = ?1`);

  const stmtListForDevice = d1.prepare(
    `SELECT ${COLUMNS_SELECT} FROM shares
     WHERE device_id = ?1
     ORDER BY created_at DESC`,
  );

  const stmtListForUser = d1.prepare(
    `SELECT ${COLUMNS_SELECT} FROM shares
     WHERE user_id = ?1
     ORDER BY created_at DESC`,
  );

  const stmtTotalStorage = d1.prepare(
    `SELECT COALESCE(SUM(size_bytes), 0) AS total
     FROM shares
     WHERE device_id = ?1 AND state = 'ready'`,
  );

  const stmtActiveCount = d1.prepare(
    `SELECT COUNT(*) AS n
     FROM shares
     WHERE device_id = ?1 AND state = 'ready'`,
  );

  const stmtBumpLastViewed = d1.prepare(
    `UPDATE shares
       SET last_viewed_at = ?2, view_count = view_count + 1
       WHERE slug = ?1`,
  );

  // Reactions and comments share the unified `share_activity` table
  // (migration 0012), distinguished by `kind`.
  const stmtAddReaction = d1.prepare(
    `INSERT INTO share_activity (slug, kind, emoji, timestamp_ms, created_at, user_id, user_name)
     VALUES (?1, 'reaction', ?2, ?3, ?4, ?5, ?6)
     RETURNING id, slug, emoji, timestamp_ms, created_at, user_id, user_name`,
  );

  const stmtListReactions = d1.prepare(
    `SELECT a.id, a.slug, a.emoji, a.timestamp_ms, a.created_at,
            a.user_id, a.user_name, u.image AS user_image
       FROM share_activity AS a
       LEFT JOIN users AS u ON u.id = a.user_id
       WHERE a.slug = ?1 AND a.kind = 'reaction'
       ORDER BY a.timestamp_ms ASC`,
  );

  const stmtCountReactions = d1.prepare(
    `SELECT COUNT(*) AS n FROM share_activity WHERE slug = ?1 AND kind = 'reaction'`,
  );

  const stmtAddComment = d1.prepare(
    `INSERT INTO share_activity (slug, kind, user_id, user_name, body, created_at, timestamp_ms)
     VALUES (?1, 'comment', ?2, ?3, ?4, ?5, ?6)
     RETURNING id, slug, user_id, user_name, body, created_at, timestamp_ms`,
  );

  const stmtListComments = d1.prepare(
    `SELECT a.id, a.slug, a.user_id, a.user_name, a.body, a.created_at,
            a.timestamp_ms, u.image AS user_image
       FROM share_activity AS a
       LEFT JOIN users AS u ON u.id = a.user_id
       WHERE a.slug = ?1 AND a.kind = 'comment'
       ORDER BY a.created_at ASC`,
  );

  const stmtCountComments = d1.prepare(
    `SELECT COUNT(*) AS n FROM share_activity WHERE slug = ?1 AND kind = 'comment'`,
  );

  const stmtGetComment = d1.prepare(
    `SELECT id, slug, user_id, user_name, body, created_at, timestamp_ms
       FROM share_activity
       WHERE id = ?1 AND kind = 'comment'
       LIMIT 1`,
  );

  const stmtDeleteComment = d1.prepare(
    `DELETE FROM share_activity WHERE id = ?1 AND kind = 'comment'`,
  );

  return {
    async insertShare(row) {
      await stmtInsert
        .bind(
          row.slug,
          row.deviceId,
          row.storageKey,
          row.posterKey,
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
        )
        .run();
    },

    async getShare(slug) {
      const r = await stmtGet.bind(slug).first<D1Row>();
      return r ? rowFromD1(r) : null;
    },

    async updateShare(slug, patch) {
      // Columns come from an allowlist — no caller-supplied SQL.
      const sets: string[] = [];
      const binds: unknown[] = [];
      const map: Partial<Record<keyof ShareRow, string>> = {
        deviceId: "device_id",
        storageKey: "storage_key",
        posterKey: "poster_key",
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
      };
      let placeholder = 1;
      for (const key of Object.keys(patch) as (keyof ShareRow)[]) {
        const col = map[key];
        if (!col) continue;
        sets.push(`${col} = ?${placeholder}`);
        binds.push(patch[key] ?? null);
        placeholder++;
      }
      if (sets.length === 0) return this.getShare(slug);

      const sql = `UPDATE shares SET ${sets.join(
        ", ",
      )} WHERE slug = ?${placeholder} RETURNING ${COLUMNS_SELECT}`;
      binds.push(slug);
      const result = await d1
        .prepare(sql)
        .bind(...binds)
        .first<D1Row>();
      return result ? rowFromD1(result) : null;
    },

    async deleteShare(slug) {
      const res = await stmtDelete.bind(slug).run();
      return (res.meta?.changes ?? 0) > 0;
    },

    async listSharesForDevice(deviceId) {
      const res = await stmtListForDevice.bind(deviceId).all<D1Row>();
      return res.results.map(rowFromD1);
    },

    async listSharesForUser(userId) {
      const res = await stmtListForUser.bind(userId).all<D1Row>();
      return res.results.map(rowFromD1);
    },

    async totalStorageForDevice(deviceId) {
      const r = await stmtTotalStorage
        .bind(deviceId)
        .first<{ total: number | null }>();
      return r?.total ?? 0;
    },

    async activeShareCountForDevice(deviceId) {
      const r = await stmtActiveCount.bind(deviceId).first<{ n: number }>();
      return r?.n ?? 0;
    },

    async bumpLastViewed(slug) {
      await stmtBumpLastViewed.bind(slug, Date.now()).run();
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

    async getComment(id) {
      const r = await stmtGetComment.bind(id).first<D1CommentRow>();
      return r ? commentFromD1(r) : null;
    },

    async deleteComment(id) {
      const r = await stmtDeleteComment.bind(id).run();
      return (r.meta?.changes ?? 0) > 0;
    },
  };
}
