import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensurePersonalWorkspace } from "@captureflow/quota";
import { beforeEach, describe, expect, it } from "vitest";
import { createD1 } from "./d1";
import {
  claimFirstInstanceAdmin,
  createTeamWorkspace,
  grantInstanceAdmin,
  isInstanceAdmin,
} from "./instance";
import {
  cleanStrandedRecordings,
  deleteInstanceUser,
  deleteInstanceWorkspace,
  getDiskUsage,
  getInstanceStorage,
  listStrandedRecordings,
  listWorkspaceStorage,
  removeInstanceRecording,
  removeInstanceScreenshot,
} from "./library";
import { applyMigrations } from "./migrate";
import { createR2 } from "./r2";

const MIGRATIONS = new URL("../../../apps/web/migrations/", import.meta.url)
  .pathname;

let db: D1Database;
let bucket: R2Bucket;
let dataDir: string;

async function addUser(id: string) {
  await db
    .prepare(
      `INSERT INTO users (id, name, email, emailVerified, createdAt, updatedAt)
         VALUES (?1, ?1, ?2, 0, ?3, ?3)`,
    )
    .bind(id, `${id}@example.com`, Date.now())
    .run();
  return (await ensurePersonalWorkspace(db, id, id)).id;
}

async function addRecording(args: {
  slug: string;
  userId: string;
  workspaceId: string;
  state?: "ready" | "pending" | "failed";
  createdAt?: number;
  size?: number;
}) {
  const key = `videos/${args.slug}.mp4`;
  const poster = `posters/${args.slug}.jpg`;
  await db
    .prepare(
      `INSERT INTO recordings
         (slug, device_id, storage_key, poster_key, size_bytes, source, preset,
          created_at, last_viewed_at, state, user_id, workspace_id)
         VALUES (?1, 'dev', ?2, ?3, ?4, 'instant', 'recording', ?5, ?5, ?6, ?7, ?8)`,
    )
    .bind(
      args.slug,
      key,
      poster,
      args.size ?? 100,
      args.createdAt ?? Date.now(),
      args.state ?? "ready",
      args.userId,
      args.workspaceId,
    )
    .run();
  await bucket.put(key, "video");
  await bucket.put(poster, "poster");
  await bucket.put(`${key}.peaks`, "peaks");
  await bucket.put(`videos/${args.slug}-audio-1.webm`, "audio");
  await bucket.put(`${key}.seg/1`, "segment");
  return key;
}

async function addScreenshot(id: string, userId: string, workspaceId: string) {
  const key = `shots/${id}.png`;
  await db
    .prepare(
      `INSERT INTO screenshots
         (id, user_id, storage_key, size_bytes, width, height, created_at, updated_at, workspace_id)
         VALUES (?1, ?2, ?3, 10, 1, 1, ?4, ?4, ?5)`,
    )
    .bind(id, userId, key, Date.now(), workspaceId)
    .run();
  await bucket.put(key, "png");
  await bucket.put(`shots/${id}.source.png`, "source");
  return key;
}

async function keys(): Promise<string[]> {
  return (await bucket.list()).objects.map((o) => o.key).sort();
}

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "cf-library-"));
  applyMigrations(join(dataDir, "app.sqlite"), MIGRATIONS);
  db = createD1(join(dataDir, "app.sqlite"));
  bucket = createR2(join(dataDir, "storage"));
});

describe("removeInstanceRecording", () => {
  it("takes every object and the row, and reports a missing slug", async () => {
    const ws = await addUser("a");
    await addRecording({ slug: "one", userId: "a", workspaceId: ws });
    await addRecording({ slug: "two", userId: "a", workspaceId: ws });
    expect(await removeInstanceRecording(db, bucket, "one")).toBe(true);
    expect(await keys()).toEqual([
      "posters/two.jpg",
      "videos/two-audio-1.webm",
      "videos/two.mp4",
      "videos/two.mp4.peaks",
      "videos/two.mp4.seg/1",
    ]);
    const left = await db.prepare(`SELECT slug FROM recordings`).all();
    expect(left.results).toEqual([{ slug: "two" }]);
    expect(await removeInstanceRecording(db, bucket, "one")).toBe(false);
  });
});

describe("removeInstanceScreenshot", () => {
  it("takes the image, its sidecars and the row", async () => {
    const ws = await addUser("a");
    await addScreenshot("s1", "a", ws);
    expect(await removeInstanceScreenshot(db, bucket, "s1")).toBe(true);
    expect(await keys()).toEqual([]);
    expect(await removeInstanceScreenshot(db, bucket, "s1")).toBe(false);
  });
});

describe("deleteInstanceWorkspace", () => {
  it("empties a team workspace and removes it, but never a personal one", async () => {
    const personal = await addUser("a");
    const team = await createTeamWorkspace(db, {
      name: "Design",
      ownerUserId: "a",
    });
    await addRecording({ slug: "mine", userId: "a", workspaceId: personal });
    await addRecording({ slug: "team", userId: "a", workspaceId: team });
    await addScreenshot("s1", "a", team);

    expect(await deleteInstanceWorkspace(db, bucket, personal)).toMatch(
      /personal/,
    );
    expect(await deleteInstanceWorkspace(db, bucket, team)).toBe(null);
    expect(await deleteInstanceWorkspace(db, bucket, team)).toMatch(
      /no longer exists/,
    );
    const slugs = await db.prepare(`SELECT slug FROM recordings`).all();
    expect(slugs.results).toEqual([{ slug: "mine" }]);
    expect(await keys()).not.toContain("videos/team.mp4");
    expect(await keys()).toContain("videos/mine.mp4");
    const members = await db
      .prepare(
        `SELECT COUNT(*) AS n FROM workspace_member WHERE workspace_id = ?1`,
      )
      .bind(team)
      .first<{ n: number }>();
    expect(members?.n).toBe(0);
  });
});

describe("deleteInstanceUser", () => {
  it("refuses the caller, the last admin and owners of team workspaces", async () => {
    await addUser("a");
    await addUser("b");
    await claimFirstInstanceAdmin(db, "a");
    expect(
      await deleteInstanceUser(db, bucket, { userId: "a", byUserId: "a" }),
    ).toMatch(/own account/);
    expect(
      await deleteInstanceUser(db, bucket, { userId: "a", byUserId: "b" }),
    ).toMatch(/someone else an admin/);
    await createTeamWorkspace(db, { name: "Sales", ownerUserId: "b" });
    expect(
      await deleteInstanceUser(db, bucket, { userId: "b", byUserId: "a" }),
    ).toMatch(/Sales/);
    expect(
      await deleteInstanceUser(db, bucket, { userId: "zz", byUserId: "a" }),
    ).toMatch(/no longer exists/);
  });

  it("removes the account with its recordings, screenshots and workspace", async () => {
    const wsA = await addUser("a");
    const wsB = await addUser("b");
    await claimFirstInstanceAdmin(db, "a");
    await grantInstanceAdmin(db, "b");
    await addRecording({ slug: "keep", userId: "a", workspaceId: wsA });
    await addRecording({ slug: "gone", userId: "b", workspaceId: wsB });
    await addScreenshot("s1", "b", wsB);

    expect(
      await deleteInstanceUser(db, bucket, { userId: "b", byUserId: "a" }),
    ).toBe(null);
    expect(await isInstanceAdmin(db, "b")).toBe(false);
    const users = await db.prepare(`SELECT id FROM users`).all();
    expect(users.results).toEqual([{ id: "a" }]);
    const workspaces = await db.prepare(`SELECT id FROM workspace`).all();
    expect(workspaces.results).toEqual([{ id: wsA }]);
    expect(await keys()).toEqual([
      "posters/keep.jpg",
      "videos/keep-audio-1.webm",
      "videos/keep.mp4",
      "videos/keep.mp4.peaks",
      "videos/keep.mp4.seg/1",
    ]);
  });
});

describe("storage", () => {
  it("totals ready media, flags stranded uploads and cleans them", async () => {
    const ws = await addUser("a");
    await addRecording({ slug: "ok", userId: "a", workspaceId: ws, size: 500 });
    await addRecording({
      slug: "failed",
      userId: "a",
      workspaceId: ws,
      state: "failed",
      size: 70,
    });
    await addRecording({
      slug: "stale",
      userId: "a",
      workspaceId: ws,
      state: "pending",
      createdAt: Date.now() - 2 * 24 * 3600 * 1000,
      size: 30,
    });
    await addRecording({
      slug: "uploading",
      userId: "a",
      workspaceId: ws,
      state: "pending",
      size: 5,
    });
    await addScreenshot("s1", "a", ws);

    expect(await getInstanceStorage(db)).toEqual({
      recordings: { count: 1, bytes: 500 },
      screenshots: { count: 1, bytes: 10 },
      stranded: { count: 2, bytes: 100 },
    });
    expect((await listStrandedRecordings(db)).map((r) => r.slug)).toEqual([
      "failed",
      "stale",
    ]);
    expect(await listWorkspaceStorage(db)).toMatchObject([
      {
        id: ws,
        kind: "personal",
        recordingCount: 1,
        screenshotCount: 1,
        bytes: 510,
      },
    ]);

    expect(await cleanStrandedRecordings(db, bucket)).toBe(2);
    expect((await getInstanceStorage(db)).stranded).toEqual({
      count: 0,
      bytes: 0,
    });
    expect(await keys()).not.toContain("videos/failed.mp4");
    expect(await keys()).toContain("videos/uploading.mp4");
  });

  it("measures the data directory and the volume", async () => {
    const ws = await addUser("a");
    await addRecording({ slug: "one", userId: "a", workspaceId: ws });
    const usage = await getDiskUsage(dataDir);
    expect(usage.dataBytes).toBeGreaterThan(0);
    expect(usage.totalBytes).toBeGreaterThan(usage.freeBytes);
  });
});
