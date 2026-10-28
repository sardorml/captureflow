/// <reference types="node" />

import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getRecordingActivityByWeek,
  getRecordingTotals,
  listAdminRecordings,
} from "./recordings";

function d1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string, params: SQLInputValue[] = []) => ({
    bind: (...next: SQLInputValue[]) => prepare(sql, next),
    all: async () => ({ results: sqlite.prepare(sql).all(...params) }),
    first: async () => sqlite.prepare(sql).get(...params) ?? null,
  });
  return { prepare } as unknown as D1Database;
}

const NOW = Date.now();
const DAY = 24 * 3600 * 1000;
let db: D1Database;

beforeEach(() => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, email TEXT);
    CREATE TABLE workspace (id TEXT PRIMARY KEY, name TEXT);
    CREATE TABLE recordings (slug TEXT PRIMARY KEY, user_id TEXT, workspace_id TEXT,
      state TEXT, visibility TEXT, title TEXT, size_bytes INTEGER DEFAULT 0,
      webcam_size_bytes INTEGER DEFAULT 0, duration_ms INTEGER,
      view_count INTEGER DEFAULT 0, created_at INTEGER);
    CREATE TABLE recording_views (slug TEXT, viewer_key TEXT,
      first_viewed_at INTEGER, last_viewed_at INTEGER);
    CREATE TABLE recording_activity (slug TEXT, kind TEXT);
    INSERT INTO users VALUES ('ann', 'Ann', 'ann@x.io'), ('bob', 'Bob', 'bob@x.io');
    INSERT INTO workspace VALUES ('w1', 'Acme');
  `);
  const insert = sqlite.prepare(
    `INSERT INTO recordings VALUES (?, ?, 'w1', ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  insert.run(
    "demo",
    "ann",
    "ready",
    "public",
    "Product demo",
    100,
    50,
    60_000,
    9,
    NOW - DAY,
  );
  insert.run(
    "bug",
    "bob",
    "ready",
    "private",
    "Bug report",
    400,
    0,
    30_000,
    2,
    NOW - 2 * DAY,
  );
  insert.run(
    "old",
    "ann",
    "ready",
    "workspace",
    null,
    10,
    0,
    5_000,
    0,
    NOW - 60 * DAY,
  );
  insert.run(
    "wip",
    "bob",
    "pending",
    "public",
    "Still uploading",
    0,
    0,
    null,
    0,
    NOW,
  );
  sqlite.exec(`
    INSERT INTO recording_views VALUES
      ('demo', 'v1', ${NOW - DAY}, ${NOW - DAY}),
      ('demo', 'v2', ${NOW - 3 * DAY}, ${NOW - 1000}),
      ('bug', 'v3', ${NOW - 20 * DAY}, ${NOW - 20 * DAY});
    INSERT INTO recording_activity VALUES
      ('demo', 'comment'), ('demo', 'comment'), ('demo', 'reaction');
  `);
  db = d1(sqlite);
});

describe("listAdminRecordings", () => {
  it("joins the owner, workspace, viewers and activity", async () => {
    const { rows, total } = await listAdminRecordings(db, {
      search: "",
      page: 1,
      visibility: "all",
    });
    expect(total).toBe(4);
    expect(rows.map((r) => r.slug)).toEqual(["wip", "demo", "bug", "old"]);
    expect(rows[1]).toMatchObject({
      slug: "demo",
      sizeBytes: 150,
      viewCount: 9,
      viewerCount: 2,
      commentCount: 2,
      reactionCount: 1,
      lastViewedAt: NOW - 1000,
      owner: { id: "ann", name: "Ann", email: "ann@x.io" },
      workspace: { id: "w1", name: "Acme" },
    });
  });

  it("filters by visibility and searches titles and owners", async () => {
    const publicOnly = await listAdminRecordings(db, {
      search: "",
      page: 1,
      visibility: "public",
    });
    expect(publicOnly.rows.map((r) => r.slug)).toEqual(["wip", "demo"]);

    const bobs = await listAdminRecordings(db, {
      search: "bob@",
      page: 1,
      visibility: "all",
    });
    expect(bobs.total).toBe(2);

    const titled = await listAdminRecordings(db, {
      search: "demo",
      page: 1,
      visibility: "all",
    });
    expect(titled.rows.map((r) => r.slug)).toEqual(["demo"]);
  });

  it("sorts by views and by size, and pages", async () => {
    const byViews = await listAdminRecordings(db, {
      search: "",
      page: 1,
      visibility: "all",
      sort: "views",
    });
    expect(byViews.rows[0]?.slug).toBe("demo");

    const bySize = await listAdminRecordings(db, {
      search: "",
      page: 2,
      visibility: "all",
      sort: "storage",
      pageSize: 1,
    });
    expect(bySize.rows.map((r) => r.slug)).toEqual(["demo"]);
    expect(bySize.total).toBe(4);
  });
});

describe("getRecordingTotals", () => {
  it("counts views, viewers and length on ready recordings", async () => {
    expect(await getRecordingTotals(db)).toEqual({
      views: 11,
      viewers: 3,
      recordedMs: 95_000,
      recordingBytes: 560,
      publicRecordings: 1,
    });
  });
});

describe("getRecordingActivityByWeek", () => {
  it("buckets finished recordings and first views by week", async () => {
    const weekly = await getRecordingActivityByWeek(db, 4);
    expect(weekly.recordings).toEqual([0, 0, 0, 2]);
    expect(weekly.viewers).toEqual([0, 1, 0, 2]);
  });
});
