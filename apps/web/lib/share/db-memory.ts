import type { ShareComment, ShareReaction, ShareRow } from "./types";
import type { ShareDb } from "./db-types";

// In-memory backend for local Next.js dev only; production uses D1.
const store = new Map<string, ShareRow>();
const reactions: ShareReaction[] = [];
const comments: ShareComment[] = [];
let nextReactionId = 1;
let nextCommentId = 1;

export const memoryDb: ShareDb = {
  async insertShare(row) {
    store.set(row.slug, row);
  },

  async getShare(slug) {
    return store.get(slug) ?? null;
  },

  async updateShare(slug, patch) {
    const existing = store.get(slug);
    if (!existing) return null;
    const next = { ...existing, ...patch };
    store.set(slug, next);
    return next;
  },

  async deleteShare(slug) {
    return store.delete(slug);
  },

  async listSharesForDevice(deviceId) {
    return Array.from(store.values())
      .filter((r) => r.deviceId === deviceId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async listSharesForUser(userId) {
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

  async activeShareCountForDevice(deviceId) {
    let n = 0;
    for (const row of store.values()) {
      if (row.deviceId === deviceId && row.state === "ready") n++;
    }
    return n;
  },

  async bumpLastViewed(slug) {
    const row = store.get(slug);
    if (row) {
      store.set(slug, {
        ...row,
        lastViewedAt: Date.now(),
        viewCount: row.viewCount + 1,
      });
    }
  },

  async addReaction({ slug, emoji, timestampMs, userId, userName }) {
    const row: ShareReaction = {
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
    const row: ShareComment = {
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

  async getComment(id) {
    return comments.find((c) => c.id === id) ?? null;
  },

  async deleteComment(id) {
    const idx = comments.findIndex((c) => c.id === id);
    if (idx < 0) return false;
    comments.splice(idx, 1);
    return true;
  },
};

// Quota fallback when no D1 binding is reachable. The snaps table is D1-only,
// so these walk the shares store alone.

export function memoryTotalStorageForUser(userId: string): number {
  let total = 0;
  for (const row of store.values()) {
    if (row.userId === userId && row.state === "ready") {
      total += row.sizeBytes;
    }
  }
  return total;
}

export function memoryActiveArtifactCountForUser(userId: string): number {
  let n = 0;
  for (const row of store.values()) {
    if (row.userId === userId && row.state === "ready") n++;
  }
  return n;
}
