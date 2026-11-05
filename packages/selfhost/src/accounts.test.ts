import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getPersonalWorkspaceForUser } from "@captureflow/quota";
import { beforeEach, describe, expect, it } from "vitest";
import {
  NEEDS_ACCOUNT_MESSAGE,
  SUSPENDED_MESSAGE,
  createInstanceUser,
  getPasswordLinkEmail,
  inviteRefusal,
  isSuspended,
  issuePasswordLink,
  listInstanceUserOptions,
  listSuspendedUserIds,
  signinRefusal,
  suspendInstanceUser,
  unsuspendInstanceUser,
} from "./accounts";
import { createD1 } from "./d1";
import { claimFirstInstanceAdmin } from "./instance";
import { applyMigrations } from "./migrate";

const MIGRATIONS = new URL("../../../apps/web/migrations/", import.meta.url)
  .pathname;

let db: D1Database;

async function addUser(name: string, email = `${name}@example.com`) {
  const result = await createInstanceUser(db, { name, email });
  if (!result.ok) throw new Error("user exists");
  return result.userId;
}

async function count(sql: string, userId: string): Promise<number> {
  const row = await db.prepare(sql).bind(userId).first<{ n: number }>();
  return row?.n ?? 0;
}

beforeEach(() => {
  const path = join(mkdtempSync(join(tmpdir(), "cf-accounts-")), "app.sqlite");
  applyMigrations(path, MIGRATIONS);
  db = createD1(path);
});

describe("createInstanceUser", () => {
  it("adds an account with its personal workspace and no password", async () => {
    const userId = await addUser("Pat", " Pat@Example.com ");
    const user = await db
      .prepare(`SELECT name, email FROM users WHERE id = ?1`)
      .bind(userId)
      .first<{ name: string; email: string }>();
    expect(user).toEqual({ name: "Pat", email: "pat@example.com" });
    expect(await getPersonalWorkspaceForUser(db, userId)).not.toBe(null);
    expect(
      await count(
        `SELECT COUNT(*) AS n FROM accounts WHERE userId = ?1`,
        userId,
      ),
    ).toBe(0);
  });

  it("refuses an address that already has an account", async () => {
    await addUser("Pat", "pat@example.com");
    expect(
      await createInstanceUser(db, { name: "Other", email: "PAT@example.com" }),
    ).toEqual({ ok: false, reason: "email_taken" });
  });

  it("lists accounts by name for a picker", async () => {
    await addUser("zed");
    await addUser("Amy");
    expect((await listInstanceUserOptions(db)).map((u) => u.name)).toEqual([
      "Amy",
      "zed",
    ]);
  });
});

describe("password links", () => {
  it("names the account until a newer link replaces it", async () => {
    const userId = await addUser("pat");
    const first = await issuePasswordLink(db, userId, "new");
    expect(await getPasswordLinkEmail(db, first)).toBe("pat@example.com");

    const second = await issuePasswordLink(db, userId, "reset");
    expect(await getPasswordLinkEmail(db, first)).toBe(null);
    expect(await getPasswordLinkEmail(db, second)).toBe("pat@example.com");
  });

  it("stops working once expired", async () => {
    const userId = await addUser("pat");
    const token = await issuePasswordLink(db, userId, "reset");
    await db.prepare(`UPDATE verifications SET expiresAt = 1`).run();
    expect(await getPasswordLinkEmail(db, token)).toBe(null);
    expect(await getPasswordLinkEmail(db, "made-up")).toBe(null);
  });
});

describe("suspension", () => {
  it("blocks sign-in and ends what was signed in, until restored", async () => {
    const admin = await addUser("admin");
    const userId = await addUser("pat");
    await db
      .prepare(
        `INSERT INTO sessions (id, expiresAt, token, createdAt, updatedAt, userId)
           VALUES ('s1', ?2, 't1', 1, 1, ?1)`,
      )
      .bind(userId, Date.now() + 60_000)
      .run();

    expect(await suspendInstanceUser(db, { userId, byUserId: admin })).toBe(
      null,
    );
    expect(await isSuspended(db, userId)).toBe(true);
    expect(await listSuspendedUserIds(db)).toEqual([userId]);
    expect(await signinRefusal(db, userId)).toBe(SUSPENDED_MESSAGE);
    expect(
      await count(
        `SELECT COUNT(*) AS n FROM sessions WHERE userId = ?1`,
        userId,
      ),
    ).toBe(0);

    await unsuspendInstanceUser(db, userId);
    expect(await signinRefusal(db, userId)).toBe(null);
  });

  it("never suspends the administrator doing it", async () => {
    const admin = await addUser("admin");
    expect(
      await suspendInstanceUser(db, { userId: admin, byUserId: admin }),
    ).toMatch(/yourself/);
    expect(await isSuspended(db, admin)).toBe(false);
  });
});

describe("inviteRefusal", () => {
  it("lets an administrator invite any address", async () => {
    const admin = await addUser("admin");
    await claimFirstInstanceAdmin(db, admin);
    expect(await inviteRefusal(db, admin, "new@example.com")).toBe(null);
  });

  it("lets anyone else invite existing accounts only", async () => {
    const owner = await addUser("owner");
    await addUser("pat");
    expect(await inviteRefusal(db, owner, "Pat@Example.com")).toBe(null);
    expect(await inviteRefusal(db, owner, "new@example.com")).toBe(
      NEEDS_ACCOUNT_MESSAGE,
    );
  });
});
