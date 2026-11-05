import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  FREE_TIER,
  applyLimitOverrides,
  ensurePersonalWorkspace,
  getLimitOverride,
  getWorkspaceEntitlement,
  resolveWorkspaceEntitlement,
  setLimitOverride,
} from "@captureflow/quota";
import { applyMigrations, createD1 } from "@captureflow/selfhost";
import { beforeEach, describe, expect, it } from "vitest";

const MIGRATIONS = new URL("../migrations/", import.meta.url).pathname;
const MINUTE = 60_000;

const free = resolveWorkspaceEntitlement({
  subscription: null,
  memberCount: 1,
});
const team = resolveWorkspaceEntitlement({
  subscription: { quantity: 2, plan: "light" },
  memberCount: 2,
});

describe("applyLimitOverrides", () => {
  it("raises the count and the length, and sizes the bytes for the length", () => {
    const e = applyLimitOverrides(free, [
      { recordings: 100, maxRecordingMs: 15 * MINUTE },
    ]);
    expect(e.recordingsPerPerson).toBe(100);
    expect(e.maxRecordingMs).toBe(15 * MINUTE);
    expect(e.maxRecordingBytes).toBe(FREE_TIER.maxRecordingBytes * 3);
    expect(e.maxQuality).toBe(free.maxQuality);
  });

  it("takes the larger of two overrides, field by field", () => {
    const e = applyLimitOverrides(free, [
      { recordings: 60, maxRecordingMs: null },
      { recordings: 40, maxRecordingMs: 10 * MINUTE },
    ]);
    expect(e.recordingsPerPerson).toBe(60);
    expect(e.maxRecordingMs).toBe(10 * MINUTE);
  });

  it("never lowers a limit and leaves blank fields at the default", () => {
    expect(
      applyLimitOverrides(free, [{ recordings: 3, maxRecordingMs: MINUTE }]),
    ).toEqual(free);
    expect(applyLimitOverrides(free, [])).toEqual(free);
  });

  it("leaves a paid workspace uncapped", () => {
    expect(
      applyLimitOverrides(team, [{ recordings: 100, maxRecordingMs: MINUTE }]),
    ).toEqual(team);
  });
});

describe("limit overrides in the database", () => {
  let db: D1Database;
  let workspaceId: string;

  beforeEach(async () => {
    const path = join(mkdtempSync(join(tmpdir(), "cf-limits-")), "app.sqlite");
    applyMigrations(path, MIGRATIONS);
    db = createD1(path);
    for (const id of ["pat", "sam"]) {
      await db
        .prepare(
          `INSERT INTO users (id, name, email, emailVerified, createdAt, updatedAt)
             VALUES (?1, ?1, ?1 || '@example.com', 1, 1, 1)`,
        )
        .bind(id)
        .run();
    }
    workspaceId = (await ensurePersonalWorkspace(db, "pat", "Pat")).id;
  });

  it("applies a workspace's override to everyone and a person's only to them", async () => {
    await setLimitOverride(
      db,
      "workspace",
      workspaceId,
      { recordings: 50, maxRecordingMs: null },
      "staff@example.com",
    );
    await setLimitOverride(
      db,
      "user",
      "pat",
      { recordings: 200, maxRecordingMs: 20 * MINUTE },
      "staff@example.com",
    );

    const anyone = await getWorkspaceEntitlement(db, workspaceId);
    expect(anyone.recordingsPerPerson).toBe(50);
    expect(anyone.maxRecordingMs).toBe(FREE_TIER.maxRecordingMs);

    const pat = await getWorkspaceEntitlement(db, workspaceId, {
      userId: "pat",
    });
    expect(pat.recordingsPerPerson).toBe(200);
    expect(pat.maxRecordingMs).toBe(20 * MINUTE);

    const sam = await getWorkspaceEntitlement(db, workspaceId, {
      userId: "sam",
    });
    expect(sam.recordingsPerPerson).toBe(50);
  });

  it("replaces an override and removes it when both fields are cleared", async () => {
    await setLimitOverride(
      db,
      "user",
      "pat",
      { recordings: 80, maxRecordingMs: null },
      "staff@example.com",
    );
    await setLimitOverride(
      db,
      "user",
      "pat",
      { recordings: null, maxRecordingMs: 10 * MINUTE },
      "staff@example.com",
    );
    expect(await getLimitOverride(db, "user", "pat")).toEqual({
      recordings: null,
      maxRecordingMs: 10 * MINUTE,
    });

    await setLimitOverride(
      db,
      "user",
      "pat",
      { recordings: null, maxRecordingMs: null },
      "staff@example.com",
    );
    expect(await getLimitOverride(db, "user", "pat")).toBeNull();
    expect(
      (await getWorkspaceEntitlement(db, workspaceId, { userId: "pat" }))
        .recordingsPerPerson,
    ).toBe(FREE_TIER.recordingsPerPerson);
  });

  it("goes away with the account", async () => {
    await setLimitOverride(
      db,
      "user",
      "sam",
      { recordings: 80, maxRecordingMs: null },
      "staff@example.com",
    );
    await db.prepare(`DELETE FROM users WHERE id = 'sam'`).run();
    expect(await getLimitOverride(db, "user", "sam")).toBeNull();
  });
});
