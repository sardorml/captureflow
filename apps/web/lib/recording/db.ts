/// <reference types="@cloudflare/workers-types" />

import type {
  RecordingComment,
  RecordingReaction,
  RecordingRow,
} from "./types";
import type { RecordingDb } from "./db-types";
import { memoryDb } from "./db-memory";
import { createD1Db } from "./db-d1";
import { getCloudflareEnv } from "./cf-env";

// Resolve per call: the D1 binding is request-scoped, so a cached reference
// would leak data between requests.
async function resolveDb(): Promise<RecordingDb> {
  const env = await getCloudflareEnv();
  return env?.DB ? createD1Db(env.DB) : memoryDb;
}

export async function insertRecording(row: RecordingRow): Promise<void> {
  return (await resolveDb()).insertRecording(row);
}

export async function getRecording(slug: string): Promise<RecordingRow | null> {
  return (await resolveDb()).getRecording(slug);
}

export async function updateRecording(
  slug: string,
  patch: Partial<RecordingRow>,
): Promise<RecordingRow | null> {
  return (await resolveDb()).updateRecording(slug, patch);
}

export async function deleteRecording(slug: string): Promise<boolean> {
  return (await resolveDb()).deleteRecording(slug);
}

export async function listRecordingsForDevice(
  deviceId: string,
): Promise<RecordingRow[]> {
  return (await resolveDb()).listRecordingsForDevice(deviceId);
}

export async function listRecordingsForUser(
  userId: string,
): Promise<RecordingRow[]> {
  return (await resolveDb()).listRecordingsForUser(userId);
}

export async function getOwnerName(userId: string): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const r = await env.DB.prepare(`SELECT name FROM users WHERE id = ?1 LIMIT 1`)
    .bind(userId)
    .first<{ name: string }>();
  return r?.name ?? null;
}

export async function totalStorageForDevice(deviceId: string): Promise<number> {
  return (await resolveDb()).totalStorageForDevice(deviceId);
}

export async function activeRecordingCountForDevice(
  deviceId: string,
): Promise<number> {
  return (await resolveDb()).activeRecordingCountForDevice(deviceId);
}

// User-scoped aggregations live in lib/recording/quota.ts: they span recordings ∪ screenshots,
// which the recording-only RecordingDb backend can't compute.

export async function bumpLastViewed(slug: string): Promise<void> {
  return (await resolveDb()).bumpLastViewed(slug);
}

export async function addReaction(input: {
  slug: string;
  emoji: string;
  timestampMs: number;
  userId: string | null;
  userName: string | null;
}): Promise<RecordingReaction> {
  return (await resolveDb()).addReaction(input);
}

export async function listReactions(
  slug: string,
): Promise<RecordingReaction[]> {
  return (await resolveDb()).listReactions(slug);
}

export async function countReactions(slug: string): Promise<number> {
  return (await resolveDb()).countReactions(slug);
}

export async function addComment(input: {
  slug: string;
  userId: string;
  userName: string;
  body: string;
  timestampMs: number | null;
}): Promise<RecordingComment> {
  return (await resolveDb()).addComment(input);
}

export async function listComments(slug: string): Promise<RecordingComment[]> {
  return (await resolveDb()).listComments(slug);
}

export async function countComments(slug: string): Promise<number> {
  return (await resolveDb()).countComments(slug);
}

export async function getComment(id: number) {
  return (await resolveDb()).getComment(id);
}

export async function deleteComment(id: number): Promise<boolean> {
  return (await resolveDb()).deleteComment(id);
}
