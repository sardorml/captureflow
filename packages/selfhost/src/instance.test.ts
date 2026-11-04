import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createInvite,
  getWorkspaceById,
  getWorkspaceRole,
} from "@captureflow/quota";
import { beforeEach, describe, expect, it } from "vitest";
import { createD1 } from "./d1";
import { inviteTokenFromPath } from "./hooks";
import {
  claimFirstInstanceAdmin,
  createTeamWorkspace,
  getInstanceSignupState,
  grantInstanceAdmin,
  instanceSignupAllowed,
  isInstanceAdmin,
  listInstanceTeams,
  listInstanceUsers,
  revokeInstanceAdmin,
  setInstanceOpenSignup,
} from "./instance";
import { applyMigrations } from "./migrate";

const MIGRATIONS = new URL("../../../apps/web/migrations/", import.meta.url)
  .pathname;

let db: D1Database;

async function addUser(id: string, email = `${id}@example.com`) {
  await db
    .prepare(
      `INSERT INTO users (id, name, email, emailVerified, createdAt, updatedAt)
         VALUES (?1, ?1, ?2, 0, ?3, ?3)`,
    )
    .bind(id, email, Date.now())
    .run();
}

// The real schema, so the tables the admin app relies on are the migrated ones.
beforeEach(() => {
  const path = join(mkdtempSync(join(tmpdir(), "cf-instance-")), "app.sqlite");
  applyMigrations(path, MIGRATIONS);
  db = createD1(path);
});

describe("instance admins", () => {
  it("makes only the first claimant the admin", async () => {
    await addUser("a");
    await addUser("b");
    await claimFirstInstanceAdmin(db, "a");
    await claimFirstInstanceAdmin(db, "b");
    expect(await isInstanceAdmin(db, "a")).toBe(true);
    expect(await isInstanceAdmin(db, "b")).toBe(false);
  });

  it("promotes real accounts only", async () => {
    await addUser("a");
    await grantInstanceAdmin(db, "a");
    await grantInstanceAdmin(db, "ghost");
    expect(await isInstanceAdmin(db, "a")).toBe(true);
    expect(await isInstanceAdmin(db, "ghost")).toBe(false);
  });

  it("never removes the last admin", async () => {
    await addUser("a");
    await addUser("b");
    await grantInstanceAdmin(db, "a");
    expect(await revokeInstanceAdmin(db, "a")).toBe(false);
    expect(await isInstanceAdmin(db, "a")).toBe(true);

    await grantInstanceAdmin(db, "b");
    expect(await revokeInstanceAdmin(db, "a")).toBe(true);
    expect(await isInstanceAdmin(db, "a")).toBe(false);
  });

  it("lists who is an admin", async () => {
    await addUser("a");
    await addUser("b");
    await grantInstanceAdmin(db, "b");
    const users = await listInstanceUsers(db);
    expect(users.map((u) => [u.id, u.is_admin])).toEqual([
      ["a", false],
      ["b", true],
    ]);
  });
});

describe("instanceSignupAllowed", () => {
  const stranger = { email: "new@example.com", emailVerified: false };

  it("lets the first account in", async () => {
    expect(await getInstanceSignupState(db)).toEqual({
      firstRun: true,
      open: false,
    });
    expect(await instanceSignupAllowed(db, stranger, null)).toBe(true);
  });

  it("refuses strangers once someone has signed up", async () => {
    await addUser("a");
    expect(await instanceSignupAllowed(db, stranger, null)).toBe(false);
    expect(await instanceSignupAllowed(db, stranger, "bad-token")).toBe(false);
  });

  it("lets anyone in when sign-up is open, and closes again", async () => {
    await addUser("a");
    await setInstanceOpenSignup(db, true);
    expect(await instanceSignupAllowed(db, stranger, null)).toBe(true);
    await setInstanceOpenSignup(db, false);
    expect(await instanceSignupAllowed(db, stranger, null)).toBe(false);
  });

  describe("with an invite", () => {
    async function invite(email: string) {
      await addUser("a");
      const id = await createTeamWorkspace(db, {
        name: "Design",
        ownerUserId: "a",
      });
      const result = await createInvite(db, {
        workspaceId: id,
        email,
        role: "member",
        invitedByUserId: "a",
      });
      if (!result.ok) throw new Error("invite failed");
      return result.plaintextToken;
    }

    it("needs the link for a password sign-up, whatever the case", async () => {
      const token = await invite("New@Example.com");
      expect(await instanceSignupAllowed(db, stranger, token)).toBe(true);
      expect(await instanceSignupAllowed(db, stranger, null)).toBe(false);
    });

    it("won't let a link be used for a different address", async () => {
      const token = await invite("someone-else@example.com");
      expect(await instanceSignupAllowed(db, stranger, token)).toBe(false);
    });

    it("takes a provider's verified address without the link", async () => {
      await invite("new@example.com");
      expect(
        await instanceSignupAllowed(
          db,
          { email: "new@example.com", emailVerified: true },
          null,
        ),
      ).toBe(true);
    });
  });
});

describe("createTeamWorkspace", () => {
  it("creates a team owned by its creator, however many they make", async () => {
    await addUser("a");
    const first = await createTeamWorkspace(db, {
      name: "Design",
      ownerUserId: "a",
    });
    await createTeamWorkspace(db, { name: "Sales", ownerUserId: "a" });

    expect((await getWorkspaceById(db, first))?.kind).toBe("team");
    expect(await getWorkspaceRole(db, first, "a")).toBe("owner");
    const teams = await listInstanceTeams(db);
    expect(teams.map((t) => [t.name, t.member_count])).toEqual([
      ["Design", 1],
      ["Sales", 1],
    ]);
  });
});

describe("inviteTokenFromPath", () => {
  it("reads the token off the sign-up's return path only", () => {
    expect(inviteTokenFromPath("/invite/abc_-1")).toBe("abc_-1");
    expect(inviteTokenFromPath("/invite/abc/../x")).toBe(null);
    expect(inviteTokenFromPath("/dashboard")).toBe(null);
    expect(inviteTokenFromPath(undefined)).toBe(null);
  });
});
