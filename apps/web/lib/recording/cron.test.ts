import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { ACCOUNT_LIMITS } from "@captureflow/quota";
import { encode } from "jpeg-js";
import { backfillPosterDerivatives, runDailyRetentionSweep } from "./cron";

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
let objects: Map<string, { body: Uint8Array; cacheControl?: string }>;

function bucket(): R2Bucket {
  return {
    delete: async (keys: string | string[]) => {
      deleted.push(...(Array.isArray(keys) ? keys : [keys]));
    },
    get: async (key: string) => {
      const obj = objects.get(key);
      return obj ? { arrayBuffer: async () => obj.body.buffer } : null;
    },
    put: async (
      key: string,
      body: Uint8Array,
      opts?: { httpMetadata?: { cacheControl?: string } },
    ) => {
      objects.set(key, {
        body,
        cacheControl: opts?.httpMetadata?.cacheControl,
      });
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

function subscribeWorkspace(workspaceId: string, status: string) {
  sqlite
    .prepare(
      `INSERT INTO workspace_subscription (ls_subscription_id, workspace_id, ls_variant_id, ls_customer_email, status, cycle, quantity, created_at, updated_at)
       VALUES (?, ?, 'v', 'a@b.c', ?, 'monthly', 2, 1, 1)`,
    )
    .run(`wsub-${workspaceId}`, workspaceId, status);
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
      poster_blur TEXT, poster_thumb_key TEXT, width INTEGER, height INTEGER,
      webcam_storage_key TEXT, webcam_state TEXT DEFAULT 'none', state TEXT,
      last_viewed_at INTEGER, created_at INTEGER, user_id TEXT, workspace_id TEXT);
    CREATE TABLE screenshots (id TEXT PRIMARY KEY, storage_key TEXT, state TEXT,
      last_viewed_at INTEGER, created_at INTEGER, updated_at INTEGER,
      user_id TEXT, workspace_id TEXT);
    CREATE TABLE workspace (id TEXT PRIMARY KEY, owner_user_id TEXT);
    CREATE TABLE workspace_subscription (ls_subscription_id TEXT PRIMARY KEY,
      ls_subscription_item_id TEXT, workspace_id TEXT, ls_variant_id TEXT,
      ls_customer_id TEXT, ls_customer_email TEXT, status TEXT, cycle TEXT,
      quantity INTEGER, current_period_end INTEGER, cancelled_at INTEGER,
      created_at INTEGER, updated_at INTEGER);
  `);
  deleted = [];
  objects = new Map();
});

describe("backfillPosterDerivatives", () => {
  it("fills the blur, the card thumbnail and the frame size from a JPEG poster", async () => {
    const data = new Uint8Array(64 * 36 * 4).fill(120);
    objects.set("posters/p1.jpg", {
      body: new Uint8Array(encode({ width: 64, height: 36, data }, 90).data),
    });
    sqlite
      .prepare(
        `INSERT INTO recordings (slug, storage_key, poster_key, state, last_viewed_at, created_at)
         VALUES ('p1', 'videos/p1.mp4', 'posters/p1.jpg', 'ready', 1, 1)`,
      )
      .run();

    await backfillPosterDerivatives({ DB: d1(sqlite), BUCKET: bucket() });

    const row = sqlite
      .prepare(
        `SELECT poster_blur, poster_thumb_key, width, height FROM recordings WHERE slug = 'p1'`,
      )
      .get() as Record<string, unknown>;
    expect(row.poster_blur).toMatch(/^data:image\/jpeg;base64,/);
    expect(row.poster_thumb_key).toMatch(
      /^posters\/p1\.[0-9a-f]{16}\.thumb2\.jpg$/,
    );
    expect(row).toMatchObject({ width: 64, height: 36 });
    const thumb = objects.get(row.poster_thumb_key as string);
    expect(thumb?.cacheControl).toMatch(/immutable/);
    expect(thumb?.body.byteLength).toBeGreaterThan(0);
  });

  it("remakes an older thumbnail for a camera-less recording and keeps a camera card", async () => {
    const data = new Uint8Array(64 * 36 * 4).fill(90);
    const poster = new Uint8Array(
      encode({ width: 64, height: 36, data }, 90).data,
    );
    objects.set("posters/p3.jpg", { body: poster });
    objects.set("posters/p4.jpg", { body: poster });
    sqlite
      .prepare(
        `INSERT INTO recordings (slug, storage_key, poster_key, poster_blur, poster_thumb_key, webcam_state, state, last_viewed_at, created_at)
         VALUES ('p3', 'videos/p3.mp4', 'posters/p3.jpg', 'data:blur', 'posters/p3.old.thumb.jpg', 'none', 'ready', 1, 1),
                ('p4', 'videos/p4.mp4', 'posters/p4.jpg', 'data:blur', 'posters/p4.old.thumb.jpg', 'ready', 'ready', 1, 1)`,
      )
      .run();

    await backfillPosterDerivatives({ DB: d1(sqlite), BUCKET: bucket() });

    const keyOf = (slug: string) =>
      (
        sqlite
          .prepare(`SELECT poster_thumb_key FROM recordings WHERE slug = ?`)
          .get(slug) as { poster_thumb_key: string }
      ).poster_thumb_key;
    expect(keyOf("p3")).toMatch(/^posters\/p3\.[0-9a-f]{16}\.thumb2\.jpg$/);
    expect(keyOf("p4")).toBe("posters/p4.old.thumb.jpg");
    expect(deleted).toEqual(["posters/p3.old.thumb.jpg"]);
  });

  it("leaves rows without a decodable JPEG for the next run", async () => {
    objects.set("posters/p2.jpg", { body: new Uint8Array([1, 2, 3]) });
    sqlite
      .prepare(
        `INSERT INTO recordings (slug, storage_key, poster_key, state, last_viewed_at, created_at)
         VALUES ('p2', 'videos/p2.mp4', 'posters/p2.jpg', 'ready', 1, 1)`,
      )
      .run();

    await backfillPosterDerivatives({ DB: d1(sqlite), BUCKET: bucket() });

    const row = sqlite
      .prepare(`SELECT poster_thumb_key FROM recordings WHERE slug = 'p2'`)
      .get() as Record<string, unknown>;
    expect(row.poster_thumb_key).toBeNull();
    expect(objects.size).toBe(1);
  });
});

describe("runDailyRetentionSweep", () => {
  it("keeps a workspace on a seat plan and sweeps one whose plan lapsed", async () => {
    sqlite.prepare(`INSERT INTO workspace VALUES ('team', 'owner')`).run();
    sqlite.prepare(`INSERT INTO workspace VALUES ('lapsed', 'owner')`).run();
    subscribeWorkspace("team", "active");
    subscribeWorkspace("lapsed", "expired");
    addRecording("in-team", "someone", "team");
    addRecording("in-lapsed", "someone", "lapsed");
    addRecording("free-own", "owner", null);
    addRecording("ownerless", null, null);

    await runDailyRetentionSweep({ DB: d1(sqlite), BUCKET: bucket() });

    expect(remaining()).toEqual(["in-team"]);
    expect(deleted).toContain("videos/free-own.mp4");
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
