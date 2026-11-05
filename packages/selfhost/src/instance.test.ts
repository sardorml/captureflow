import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createInvite,
  ensurePersonalWorkspace,
  getWorkspaceById,
  getWorkspaceRole,
} from "@captureflow/quota";
import { beforeEach, describe, expect, it } from "vitest";
import { createD1 } from "./d1";
import { inviteTokenFromPath } from "./hooks";
import {
  addWorkspaceMembers,
  claimFirstInstanceAdmin,
  createTeamWorkspace,
  getInstanceSignupState,
  grantInstanceAdmin,
  instanceSignupRefusal,
  isInstanceAdmin,
  listInstanceAdminIds,
  listTeamWorkspaceOptions,
  markInstanceSetupCompleted,
  parseDomains,
  revokeInstanceAdmin,
  setInstanceSignupDomains,
  transferWorkspaceOwnership,
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
    expect(await listInstanceAdminIds(db)).toEqual(["b"]);
  });
});

describe("instanceSignupRefusal", () => {
  const stranger = { email: "new@example.com", emailVerified: false };

  it("lets the first account in", async () => {
    expect(await getInstanceSignupState(db)).toEqual({
      firstRun: true,
      domains: [],
      setupCompleted: false,
    });
    expect(await instanceSignupRefusal(db, stranger, null)).toBe(null);
  });

  it("refuses strangers once someone has signed up", async () => {
    await addUser("a");
    expect(await instanceSignupRefusal(db, stranger, null)).toMatch(
      /invite-only/,
    );
    expect(await instanceSignupRefusal(db, stranger, "bad-token")).toMatch(
      /invite-only/,
    );
  });

  it("lets company addresses in once domains are set", async () => {
    await addUser("a");
    await setInstanceSignupDomains(db, [
      " @Acme.com ",
      "acme.io",
      "bad domain",
    ]);
    expect((await getInstanceSignupState(db)).domains).toEqual([
      "acme.com",
      "acme.io",
    ]);
    expect(
      await instanceSignupRefusal(db, { email: "Pat@ACME.com" }, null),
    ).toBe(null);
    expect(await instanceSignupRefusal(db, stranger, null)).toBe(
      "Sign up with an address on @acme.com or @acme.io, or ask an administrator for an invite.",
    );
    await setInstanceSignupDomains(db, []);
    expect(
      await instanceSignupRefusal(db, { email: "pat@acme.com" }, null),
    ).toMatch(/invite-only/);
  });

  describe("with an invite", () => {
    async function invite(email: string, { asAdmin = true } = {}) {
      await addUser("a");
      if (asAdmin) await claimFirstInstanceAdmin(db, "a");
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
      expect(await instanceSignupRefusal(db, stranger, token)).toBe(null);
      expect(await instanceSignupRefusal(db, stranger, null)).toMatch(
        /invite-only/,
      );
    });

    it("won't let a link be used for a different address", async () => {
      const token = await invite("someone-else@example.com");
      expect(await instanceSignupRefusal(db, stranger, token)).toMatch(
        /invite-only/,
      );
    });

    it("ignores an invite that no administrator sent", async () => {
      const token = await invite("new@example.com", { asAdmin: false });
      expect(await instanceSignupRefusal(db, stranger, token)).toMatch(
        /invite-only/,
      );
      expect(
        await instanceSignupRefusal(
          db,
          { email: "new@example.com", emailVerified: true },
          null,
        ),
      ).toMatch(/invite-only/);
    });

    it("takes a provider's verified address without the link", async () => {
      await invite("new@example.com");
      expect(
        await instanceSignupRefusal(
          db,
          { email: "new@example.com", emailVerified: true },
          null,
        ),
      ).toBe(null);
    });
  });
});

describe("markInstanceSetupCompleted", () => {
  it("is remembered", async () => {
    await markInstanceSetupCompleted(db);
    expect(await getInstanceSignupState(db)).toMatchObject({
      setupCompleted: true,
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
    expect((await getWorkspaceById(db, first))?.name).toBe("Design");
  });
});

describe("addWorkspaceMembers", () => {
  it("adds accounts to a team once and keeps existing roles", async () => {
    await addUser("a");
    await addUser("b");
    const id = await createTeamWorkspace(db, {
      name: "Design",
      ownerUserId: "a",
    });

    await addWorkspaceMembers(db, {
      workspaceId: id,
      userIds: ["a", "b", "nobody"],
      role: "viewer",
    });
    await addWorkspaceMembers(db, {
      workspaceId: id,
      userIds: ["b"],
      role: "member",
    });

    expect(await getWorkspaceRole(db, id, "a")).toBe("owner");
    expect(await getWorkspaceRole(db, id, "b")).toBe("viewer");
    expect(await getWorkspaceRole(db, id, "nobody")).toBe(null);
    expect(await listTeamWorkspaceOptions(db)).toEqual([
      { id, name: "Design" },
    ]);
  });

  it("never fills a personal workspace", async () => {
    await addUser("a");
    await addUser("b");
    const personal = await ensurePersonalWorkspace(db, "a", "a");
    await addWorkspaceMembers(db, {
      workspaceId: personal.id,
      userIds: ["b"],
      role: "member",
    });
    expect(await getWorkspaceRole(db, personal.id, "b")).toBe(null);
  });
});

describe("transferWorkspaceOwnership", () => {
  it("hands a team to a member and keeps the old owner as a member", async () => {
    await addUser("a");
    await addUser("b");
    const id = await createTeamWorkspace(db, {
      name: "Design",
      ownerUserId: "a",
    });

    expect(
      await transferWorkspaceOwnership(db, { workspaceId: id, userId: "b" }),
    ).toBe(null);
    expect((await getWorkspaceById(db, id))?.owner_user_id).toBe("b");
    expect(await getWorkspaceRole(db, id, "b")).toBe("owner");
    expect(await getWorkspaceRole(db, id, "a")).toBe("member");
  });

  it("promotes someone who was already in the workspace", async () => {
    await addUser("a");
    await addUser("b");
    const id = await createTeamWorkspace(db, {
      name: "Design",
      ownerUserId: "a",
    });
    await db
      .prepare(
        `INSERT INTO workspace_member (workspace_id, user_id, role, joined_at)
           VALUES (?1, 'b', 'viewer', 1)`,
      )
      .bind(id)
      .run();

    await transferWorkspaceOwnership(db, { workspaceId: id, userId: "b" });
    expect(await getWorkspaceRole(db, id, "b")).toBe("owner");
  });

  it("leaves personal workspaces and unknown accounts alone", async () => {
    await addUser("a");
    await addUser("b");
    const personal = await ensurePersonalWorkspace(db, "a", "a");
    expect(
      await transferWorkspaceOwnership(db, {
        workspaceId: personal.id,
        userId: "b",
      }),
    ).toMatch(/personal workspace/);
    const team = await createTeamWorkspace(db, {
      name: "Design",
      ownerUserId: "a",
    });
    expect(
      await transferWorkspaceOwnership(db, {
        workspaceId: team,
        userId: "nobody",
      }),
    ).toMatch(/account no longer exists/);
    expect((await getWorkspaceById(db, team))?.owner_user_id).toBe("a");
  });
});

describe("parseDomains", () => {
  it("keeps real domains, lowercased and without the @", () => {
    expect(parseDomains("@Acme.com, acme.io\nnot a domain;acme.com")).toEqual([
      "acme.com",
      "acme.io",
    ]);
    expect(parseDomains(undefined)).toEqual([]);
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
