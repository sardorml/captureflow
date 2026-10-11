import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { ACCOUNT_LIMITS } from "@captureflow/quota";
import { runDailyRetentionSweep } from "./cron";

// Minimal D1 over node:sqlite. Statements compile lazily, as the facade
// prepares queries against columns this fixture schema doesn't have.
function d1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string, params: SQLInputValue[] = []) => ({
    bind: (...next: SQLInputValue[]) => prepare(sql, next),
    all: async () => ({ results: sqlite.prepare(sql).all(...params) }),
    first: async () => sqlite.prepare(sql).get(...params) ?? null,
    run: async () => {
      const r = sqlite.prepare(sql).run(...params);
      return { meta: { changes: Number(r.changes) } };
    },
  });
  return { prepare } as unknown as D1Database;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const STALE =
  Date.now() - (ACCOUNT_LIMITS.retentionDaysFromLastView + 1) * DAY_MS;

let sqlite: DatabaseSync;
let deleted: string[];

function bucket(): R2Bucket {
  return {
    delete: async (keys: string | string[]) => {
      deleted.push(...(Array.isArray(keys) ? keys : [keys]));
    },
  } as unknown as R2Bucket;
}

function addRecording(
  slug: string,
  userId: string | null,
  workspaceId: string | null,
) {
  sqlite
    .prepare(
      `INSERT INTO recordings (slug, storage_key, state, last_viewed_at, created_at, user_id, workspace_id)
       VALUES (?, ?, 'ready', ?, ?, ?, ?)`,
    )
    .run(slug, `videos/${slug}.mp4`, STALE, STALE, userId, workspaceId);
}

function subscribe(userId: string, status: string) {
  sqlite
    .prepare(
      `INSERT INTO pro_subscription (ls_subscription_id, user_id, ls_variant_id, ls_customer_email, status, cycle, current_period_end, created_at, updated_at)
       VALUES (?, ?, 'v', 'a@b.c', ?, 'monthly', NULL, 1, 1)`,
    )
    .run(`sub-${userId}`, userId, status);
}

function grant(userId: string, expiresAt: number | null) {
  sqlite
    .prepare(
      `INSERT INTO user_quotas (user_id, granted_plan_variant_id, granted_plan_expires_at, updated_at)
       VALUES (?, '1849425', ?, 1)`,
    )
    .run(userId, expiresAt);
}

const remaining = () =>
  sqlite
    .prepare(`SELECT slug FROM recordings ORDER BY slug`)
    .all()
    .map((r) => r.slug);

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE recordings (slug TEXT PRIMARY KEY, storage_key TEXT, poster_key TEXT,
      webcam_storage_key TEXT, state TEXT, last_viewed_at INTEGER, created_at INTEGER,
      user_id TEXT, workspace_id TEXT);
    CREATE TABLE screenshots (id TEXT PRIMARY KEY, storage_key TEXT, state TEXT,
      last_viewed_at INTEGER, created_at INTEGER, updated_at INTEGER,
      user_id TEXT, workspace_id TEXT);
    CREATE TABLE workspace (id TEXT PRIMARY KEY, owner_user_id TEXT);
    CREATE TABLE pro_subscription (ls_subscription_id TEXT PRIMARY KEY, user_id TEXT,
      ls_variant_id TEXT, ls_customer_id TEXT, ls_customer_email TEXT, status TEXT,
      cycle TEXT, current_period_end INTEGER, cancelled_at INTEGER,
      created_at INTEGER, updated_at INTEGER);
    CREATE TABLE user_quotas (user_id TEXT PRIMARY KEY, storage_bytes_override INTEGER,
      note TEXT, updated_at INTEGER, granted_plan_variant_id TEXT,
      granted_plan_expires_at INTEGER);
  `);
  deleted = [];
});

describe("runDailyRetentionSweep", () => {
  it("expires idle recordings on free accounts and keeps paid ones", async () => {
    subscribe("paid", "active");
    subscribe("lapsed", "expired");
    sqlite.prepare(`INSERT INTO workspace VALUES ('team', 'paid')`).run();
    addRecording("free-own", "free", null);
    addRecording("paid-own", "paid", null);
    addRecording("lapsed-own", "lapsed", null);
    addRecording("member-in-paid-workspace", "free", "team");
    addRecording("ownerless", null, null);

    await runDailyRetentionSweep({ DB: d1(sqlite), BUCKET: bucket() });

    expect(remaining()).toEqual(["member-in-paid-workspace", "paid-own"]);
    expect(deleted).toContain("videos/free-own.mp4");
  });

  it("keeps idle recordings of accounts with a granted plan until it ends", async () => {
    grant("comped", null);
    grant("trial-ended", Date.now() - DAY_MS);
    grant("trial-running", Date.now() + DAY_MS);
    addRecording("comped-own", "comped", null);
    addRecording("trial-ended-own", "trial-ended", null);
    addRecording("trial-running-own", "trial-running", null);

    await runDailyRetentionSweep({ DB: d1(sqlite), BUCKET: bucket() });

    expect(remaining()).toEqual(["comped-own", "trial-running-own"]);
  });

  it("keeps idle uploads on a self-hosted instance but still clears failed ones", async () => {
    addRecording("idle", "u1", null);
    sqlite
      .prepare(
        `INSERT INTO recordings (slug, storage_key, state, last_viewed_at, created_at, user_id)
         VALUES ('broken', 'videos/broken.mp4', 'failed', NULL, ?, 'u1')`,
      )
      .run(STALE);
    sqlite
      .prepare(
        `INSERT INTO screenshots (id, storage_key, state, last_viewed_at, created_at, updated_at, user_id)
         VALUES ('shot', 'screenshots/shot.png', 'ready', ?, ?, ?, 'u1')`,
      )
      .run(STALE, STALE, STALE);

    await runDailyRetentionSweep({
      DB: d1(sqlite),
      BUCKET: bucket(),
      SELF_HOSTED: "true",
    });

    expect(remaining()).toEqual(["idle"]);
    expect(
      sqlite
        .prepare(`SELECT id FROM screenshots`)
        .all()
        .map((r) => r.id),
    ).toEqual(["shot"]);
  });

  it("expires everything idle when nobody pays", async () => {
    addRecording("a", "u1", null);
    addRecording("b", null, null);

    await runDailyRetentionSweep({ DB: d1(sqlite), BUCKET: bucket() });

    expect(remaining()).toEqual([]);
  });
});
