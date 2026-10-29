import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import {
  cachedMediaUrls,
  purgeRecordingMedia,
  retryQueuedPurges,
  type PurgeEnv,
} from "./cdn-purge";

type Statement = { run(): Promise<unknown> };

function d1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string, params: SQLInputValue[] = []) => ({
    bind: (...next: SQLInputValue[]) => prepare(sql, next),
    all: async () => ({ results: sqlite.prepare(sql).all(...params) }),
    run: async () => sqlite.prepare(sql).run(...params),
  });
  return {
    prepare,
    batch: async (statements: Statement[]) => {
      for (const s of statements) await s.run();
    },
  } as unknown as D1Database;
}

const ROW = {
  storageKey: "videos/abc.mp4",
  sizeBytes: 1234,
  webcamStorageKey: "videos/abc-webcam.webm",
  webcamSizeBytes: 99,
};

let sqlite: DatabaseSync;
let env: PurgeEnv;
let requests: { url: string; files: string[] }[];

function cloudflare(ok: boolean | (() => boolean)): typeof fetch {
  return (async (url: string, init: RequestInit) => {
    requests.push({ url, files: JSON.parse(String(init.body)).files });
    const success = typeof ok === "function" ? ok() : ok;
    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 500,
    });
  }) as unknown as typeof fetch;
}

const queued = () =>
  sqlite
    .prepare("SELECT url, attempts FROM cdn_purge_queue ORDER BY url")
    .all();

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    "CREATE TABLE cdn_purge_queue (url TEXT PRIMARY KEY, attempts INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)",
  );
  env = {
    DB: d1(sqlite),
    CLOUDFLARE_ZONE_ID: "zone",
    CLOUDFLARE_PURGE_TOKEN: "token",
    R2_PUBLIC_BASE_URL: "https://cdn.example",
  };
  requests = [];
});

describe("cachedMediaUrls", () => {
  it("covers the bare and versioned URL of both files", () => {
    expect(cachedMediaUrls("https://cdn.example", ROW)).toEqual([
      "https://cdn.example/videos/abc.mp4",
      "https://cdn.example/videos/abc.mp4?v=1234",
      "https://cdn.example/videos/abc-webcam.webm",
      "https://cdn.example/videos/abc-webcam.webm?v=99",
    ]);
  });

  it("skips a recording without a camera", () => {
    expect(
      cachedMediaUrls("https://cdn.example", {
        ...ROW,
        webcamStorageKey: null,
        webcamSizeBytes: 0,
      }),
    ).toHaveLength(2);
  });
});

describe("purgeRecordingMedia", () => {
  it("purges every cached URL in the zone", async () => {
    await purgeRecordingMedia(env, ROW, cloudflare(true));
    expect(requests).toHaveLength(1);
    expect(requests[0]!.url).toContain("/zones/zone/purge_cache");
    expect(requests[0]!.files).toHaveLength(4);
    expect(queued()).toEqual([]);
  });

  it("queues the URLs when Cloudflare keeps refusing", async () => {
    await purgeRecordingMedia(env, ROW, cloudflare(false));
    expect(requests.length).toBeGreaterThan(1);
    expect(queued()).toHaveLength(4);
  });

  it("does nothing without a zone and token", async () => {
    await purgeRecordingMedia({ DB: env.DB }, ROW, cloudflare(true));
    expect(requests).toEqual([]);
  });
});

describe("retryQueuedPurges", () => {
  it("clears the queue once a retry lands", async () => {
    await purgeRecordingMedia(env, ROW, cloudflare(false));
    await retryQueuedPurges(env, cloudflare(true));
    expect(queued()).toEqual([]);
  });

  it("keeps and counts URLs that still fail", async () => {
    await purgeRecordingMedia(env, ROW, cloudflare(false));
    await retryQueuedPurges(env, cloudflare(false));
    expect(queued().every((r) => r.attempts === 1)).toBe(true);
  });
});
