/// <reference types="node" />

import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { describe, expect, it } from "vitest";
import {
  ACTIVITY_SOURCES,
  type ActivationUser,
  activationFunnel,
  cameBack,
  cohortRetention,
  firstClientSplit,
  getActivation,
  oneAndDone,
  timeToFirstRecording,
} from "./activation";

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const WEEK = 7 * DAY;
const NOW = 1_800_000_000_000;

function user(over: Partial<ActivationUser>): ActivationUser {
  return {
    id: "u",
    name: null,
    email: "u@x.io",
    createdAt: NOW - 10 * DAY,
    recordings: 0,
    firstRecordingAt: null,
    firstClient: null,
    lastActiveAt: null,
    activeWeeks: [0],
    ...over,
  };
}

describe("cameBack", () => {
  it("needs activity after the signup day", () => {
    const createdAt = NOW - 5 * DAY;
    expect(
      cameBack(user({ createdAt, lastActiveAt: createdAt + DAY / 2 })),
    ).toBe(false);
    expect(
      cameBack(user({ createdAt, lastActiveAt: createdAt + 2 * DAY })),
    ).toBe(true);
    expect(cameBack(user({ createdAt, lastActiveAt: null }))).toBe(false);
  });
});

describe("activationFunnel", () => {
  it("counts each step independently", () => {
    const createdAt = NOW - 5 * DAY;
    expect(
      activationFunnel([
        user({ recordings: 0 }),
        user({ recordings: 1, createdAt, lastActiveAt: createdAt + 3 * DAY }),
        user({ recordings: 3 }),
      ]),
    ).toEqual({ signedUp: 3, recorded: 2, recordedTwice: 1, returned: 1 });
  });
});

describe("cohortRetention", () => {
  it("buckets signups by week, newest first, and nulls weeks not yet started", () => {
    const rows = cohortRetention(
      [
        user({ createdAt: NOW - 3 * WEEK + DAY, activeWeeks: [0, 1, 2] }),
        user({ createdAt: NOW - 3 * WEEK + 2 * DAY, activeWeeks: [0] }),
        user({ createdAt: NOW - DAY, activeWeeks: [0] }),
      ],
      3,
      NOW,
    );
    expect(rows.map((r) => r.size)).toEqual([1, 0, 2]);
    expect(rows[0]!.retained).toEqual([1, null, null]);
    expect(rows[2]!.retained).toEqual([2, 1, 1]);
  });
});

describe("timeToFirstRecording", () => {
  it("buckets the wait and counts those who never recorded", () => {
    const createdAt = NOW - 30 * DAY;
    const buckets = timeToFirstRecording([
      user({ createdAt, firstRecordingAt: createdAt + 2 * MIN }),
      user({ createdAt, firstRecordingAt: createdAt + 30 * MIN }),
      user({ createdAt, firstRecordingAt: createdAt + 3 * DAY }),
      user({ createdAt, firstRecordingAt: null }),
    ]);
    expect(Object.fromEntries(buckets.map((b) => [b.label, b.count]))).toEqual({
      "Under 10 min": 1,
      "Under 1 hour": 1,
      "Same day": 0,
      "Within a week": 1,
      Later: 0,
      "Never recorded": 1,
    });
  });
});

describe("firstClientSplit", () => {
  it("labels known clients and folds the rest into Other", () => {
    expect(
      firstClientSplit([
        user({ firstRecordingAt: 1, firstClient: "extension" }),
        user({ firstRecordingAt: 1, firstClient: "extension" }),
        user({ firstRecordingAt: 1, firstClient: null }),
        user({ firstRecordingAt: null, firstClient: "agent" }),
      ]),
    ).toEqual([
      { label: "Chrome extension", count: 2 },
      { label: "Other", count: 1 },
    ]);
  });
});

describe("oneAndDone", () => {
  it("lists single-recording users who never came back, newest first", () => {
    const old = NOW - 10 * DAY;
    const list = oneAndDone(
      [
        user({
          id: "gone",
          createdAt: old,
          recordings: 1,
          firstRecordingAt: old,
        }),
        user({
          id: "back",
          createdAt: old,
          recordings: 1,
          firstRecordingAt: old,
          lastActiveAt: old + 4 * DAY,
        }),
        user({
          id: "fresh",
          createdAt: NOW - DAY,
          recordings: 1,
          firstRecordingAt: NOW,
        }),
        user({
          id: "two",
          createdAt: old,
          recordings: 2,
          firstRecordingAt: old,
        }),
      ],
      NOW,
    );
    expect(list.map((u) => u.id)).toEqual(["gone"]);
  });
});

function d1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string, params: SQLInputValue[] = []) => ({
    bind: (...next: SQLInputValue[]) => prepare(sql, next),
    all: async () => ({ results: sqlite.prepare(sql).all(...params) }),
  });
  return { prepare } as unknown as D1Database;
}

describe("getActivation", () => {
  it("reads signups, recordings and activity from the database", async () => {
    const sqlite = new DatabaseSync(":memory:");
    const signup = NOW - 2 * WEEK;
    sqlite.exec(`
      CREATE TABLE users (id TEXT, name TEXT, email TEXT, createdAt INTEGER);
      CREATE TABLE recordings (slug TEXT, user_id TEXT, state TEXT, client TEXT, created_at INTEGER);
      CREATE TABLE sessions (userId TEXT, createdAt INTEGER, updatedAt INTEGER);
      CREATE TABLE device_tokens (user_id TEXT, last_used_at INTEGER);
      CREATE TABLE screenshots (user_id TEXT, state TEXT, created_at INTEGER);
      CREATE TABLE recording_activity (user_id TEXT, created_at INTEGER);
      CREATE TABLE recording_views (user_id TEXT, last_viewed_at INTEGER);
      INSERT INTO users VALUES
        ('ann', 'Ann', 'ann@x.io', ${signup}),
        ('bob', 'Bob', 'bob@x.io', ${signup}),
        ('old', 'Old', 'old@x.io', ${NOW - 20 * WEEK});
      INSERT INTO recordings VALUES
        ('a1', 'ann', 'ready', 'extension', ${signup + 5 * MIN}),
        ('a2', 'ann', 'ready', 'extension', ${signup + WEEK + DAY}),
        ('b1', 'bob', 'ready', 'agent', ${signup + 2 * DAY}),
        ('b2', 'bob', 'failed', 'agent', ${signup + 3 * DAY});
      INSERT INTO sessions VALUES ('ann', ${signup}, ${signup + MIN}),
        ('bob', ${signup}, ${signup + MIN});
    `);
    const result = await getActivation(d1(sqlite), 4, NOW);
    expect(result.funnel).toEqual({
      signedUp: 2,
      recorded: 2,
      recordedTwice: 1,
      returned: 2,
    });
    const cohort = result.cohorts.find((c) => c.size === 2)!;
    expect(cohort.retained.slice(0, 2)).toEqual([2, 1]);
    expect(result.firstClient).toEqual([
      { label: "Chrome extension", count: 1 },
      { label: "AI agent", count: 1 },
    ]);
  });
});

describe("ACTIVITY_SOURCES", () => {
  it("keeps every compound SELECT within D1's five-term cap", () => {
    for (const group of ACTIVITY_SOURCES)
      expect(group.length).toBeLessThanOrEqual(5);
  });
});
