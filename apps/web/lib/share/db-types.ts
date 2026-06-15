import type { ShareComment, ShareReaction, ShareRow } from './types';

// Backend-agnostic database interface. Both `db-d1.ts` (production) and
// `db-memory.ts` (local Next.js dev) implement this. The dispatcher in
// `db.ts` picks one per call based on whether a Cloudflare D1 binding is
// reachable in the current request context.
export type ShareDb = {
  insertShare(row: ShareRow): Promise<void>;
  getShare(slug: string): Promise<ShareRow | null>;
  updateShare(slug: string, patch: Partial<ShareRow>): Promise<ShareRow | null>;
  deleteShare(slug: string): Promise<boolean>;
  listSharesForDevice(deviceId: string): Promise<ShareRow[]>;
  listSharesForUser(userId: string): Promise<ShareRow[]>;
  totalStorageForDevice(deviceId: string): Promise<number>;
  activeShareCountForDevice(deviceId: string): Promise<number>;
  bumpLastViewed(slug: string): Promise<void>;
  addReaction(input: {
    slug: string;
    emoji: string;
    timestampMs: number;
    userId: string | null;
    userName: string | null;
  }): Promise<ShareReaction>;
  listReactions(slug: string): Promise<ShareReaction[]>;
  countReactions(slug: string): Promise<number>;
  addComment(input: {
    slug: string;
    userId: string;
    userName: string;
    body: string;
    timestampMs: number | null;
  }): Promise<ShareComment>;
  listComments(slug: string): Promise<ShareComment[]>;
  countComments(slug: string): Promise<number>;
  getComment(id: number): Promise<ShareComment | null>;
  deleteComment(id: number): Promise<boolean>;
};
