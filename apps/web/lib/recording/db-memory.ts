import type {
  RecordingComment,
  RecordingReaction,
  RecordingRow,
  TranscriptPartRow,
  TranscriptRow,
} from "./types";
import type { RecordingDb } from "./db-types";

// In-memory backend for local Next.js dev only; production uses D1.
const store = new Map<string, RecordingRow>();
const transcripts = new Map<string, TranscriptRow>();
const transcriptParts = new Map<string, TranscriptPartRow[]>();
const reactions: RecordingReaction[] = [];
const comments: RecordingComment[] = [];
type MemoryView = {
  userId: string | null;
  lastViewedAt: number;
  views: number;
};
const views = new Map<string, Map<string, MemoryView>>();
let nextReactionId = 1;
let nextCommentId = 1;

export const memoryDb: RecordingDb = {
  async insertRecording(row) {
    store.set(row.slug, row);
  },

  async getRecording(slug) {
    return store.get(slug) ?? null;
  },

  async updateRecording(slug, patch) {
    const existing = store.get(slug);
    if (!existing) return null;
    const next = { ...existing, ...patch };
    store.set(slug, next);
    return next;
  },

  async deleteRecording(slug) {
    transcripts.delete(slug);
    transcriptParts.delete(slug);
    views.delete(slug);
    return store.delete(slug);
  },

  async listRecordingsForDevice(deviceId) {
    return Array.from(store.values())
      .filter((r) => r.deviceId === deviceId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async listRecordingsForUser(userId) {
    return Array.from(store.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async totalStorageForDevice(deviceId) {
    let total = 0;
    for (const row of store.values()) {
      if (row.deviceId === deviceId && row.state === "ready") {
        total += row.sizeBytes;
      }
    }
    return total;
  },

  async activeRecordingCountForDevice(deviceId) {
    let n = 0;
    for (const row of store.values()) {
      if (row.deviceId === deviceId && row.state === "ready") n++;
    }
    return n;
  },

  async recordView(slug, viewerKey, userId) {
    const row = store.get(slug);
    if (!row) return;
    const now = Date.now();
    store.set(slug, {
      ...row,
      lastViewedAt: now,
      viewCount: row.viewCount + 1,
    });
    const viewers = views.get(slug) ?? new Map<string, MemoryView>();
    const seen = viewers.get(viewerKey);
    viewers.set(viewerKey, {
      userId: userId ?? seen?.userId ?? null,
      lastViewedAt: now,
      views: (seen?.views ?? 0) + 1,
    });
    views.set(slug, viewers);
  },

  async touchLastViewed(slug) {
    const row = store.get(slug);
    if (row) store.set(slug, { ...row, lastViewedAt: Date.now() });
  },

  async listViewers(slug, excludeUserId) {
    return Array.from(views.get(slug)?.values() ?? [])
      .filter((v) => v.userId === null || v.userId !== excludeUserId)
      .sort((a, b) => b.lastViewedAt - a.lastViewedAt)
      .map((v) => ({ ...v, name: null, email: null, image: null }));
  },

  async addReaction({ slug, emoji, timestampMs, userId, userName }) {
    const row: RecordingReaction = {
      id: nextReactionId++,
      slug,
      emoji,
      timestampMs,
      createdAt: Date.now(),
      userId,
      userName,
      userImage: null,
    };
    reactions.push(row);
    return row;
  },

  async listReactions(slug) {
    return reactions
      .filter((r) => r.slug === slug)
      .sort((a, b) => a.timestampMs - b.timestampMs);
  },

  async countReactions(slug) {
    let n = 0;
    for (const r of reactions) if (r.slug === slug) n++;
    return n;
  },

  async addComment({ slug, userId, userName, body, timestampMs }) {
    const row: RecordingComment = {
      id: nextCommentId++,
      slug,
      userId,
      userName,
      userImage: null,
      body,
      createdAt: Date.now(),
      timestampMs,
    };
    comments.push(row);
    return row;
  },

  async listComments(slug) {
    return comments
      .filter((r) => r.slug === slug)
      .sort((a, b) => a.createdAt - b.createdAt);
  },

  async countComments(slug) {
    let n = 0;
    for (const r of comments) if (r.slug === slug) n++;
    return n;
  },

  async getReaction(id) {
    return reactions.find((r) => r.id === id) ?? null;
  },

  async deleteReaction(id) {
    const idx = reactions.findIndex((r) => r.id === id);
    if (idx < 0) return false;
    reactions.splice(idx, 1);
    return true;
  },

  async getComment(id) {
    return comments.find((c) => c.id === id) ?? null;
  },

  async deleteComment(id) {
    const idx = comments.findIndex((c) => c.id === id);
    if (idx < 0) return false;
    comments.splice(idx, 1);
    return true;
  },

  async createTranscriptJob({ slug, language, parts }) {
    const now = Date.now();
    transcripts.set(slug, {
      slug,
      status: "pending",
      language,
      partCount: parts.length,
      autoJson: null,
      editedJson: null,
      error: null,
      createdAt: transcripts.get(slug)?.createdAt ?? now,
      updatedAt: now,
    });
    transcriptParts.set(
      slug,
      parts.map((p) => ({ slug, ...p, segmentsJson: null, updatedAt: now })),
    );
  },

  async getTranscript(slug) {
    return transcripts.get(slug) ?? null;
  },

  async getTranscriptPart(slug, partNumber) {
    return (
      transcriptParts.get(slug)?.find((p) => p.partNumber === partNumber) ??
      null
    );
  },

  async listTranscriptParts(slug) {
    return [...(transcriptParts.get(slug) ?? [])].sort(
      (a, b) => a.partNumber - b.partNumber,
    );
  },

  async setTranscriptPartLines(slug, partNumber, segmentsJson) {
    const part = transcriptParts
      .get(slug)
      ?.find((p) => p.partNumber === partNumber);
    if (part) {
      part.segmentsJson = segmentsJson;
      part.updatedAt = Date.now();
    }
  },

  async finishTranscript(slug, autoJson) {
    const row = transcripts.get(slug);
    if (row?.status === "pending") {
      transcripts.set(slug, {
        ...row,
        status: "ready",
        autoJson,
        error: null,
        updatedAt: Date.now(),
      });
    }
  },

  async failTranscript(slug, error) {
    const row = transcripts.get(slug);
    if (row?.status === "pending") {
      transcripts.set(slug, {
        ...row,
        status: "failed",
        error,
        updatedAt: Date.now(),
      });
    }
  },
};
