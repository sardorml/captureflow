import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import {
  acceptInvite,
  countWorkspaceMembers,
  countWorkspaceSeats,
  createInvite,
  findInviteByToken,
  getWorkspaceRole,
  listMembers,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from "@captureflow/quota";

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

let sqlite: DatabaseSync;
let db: D1Database;

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, email TEXT, image TEXT);
    CREATE TABLE workspace (id TEXT PRIMARY KEY, slug TEXT, kind TEXT, name TEXT,
      owner_user_id TEXT, created_at INTEGER, updated_at INTEGER, logo_key TEXT,
      allow_public_links INTEGER DEFAULT 1, allow_member_uploads INTEGER DEFAULT 1,
      card_bg TEXT);
    CREATE TABLE workspace_member (workspace_id TEXT, user_id TEXT, role TEXT,
      joined_at INTEGER, PRIMARY KEY (workspace_id, user_id));
    CREATE TABLE workspace_invite (id TEXT PRIMARY KEY, workspace_id TEXT, email TEXT,
      role TEXT NOT NULL DEFAULT 'member', token_hash TEXT UNIQUE,
      invited_by_user_id TEXT, created_at INTEGER, expires_at INTEGER,
      accepted_at INTEGER);
    INSERT INTO users VALUES ('ann', 'Ann', 'ann@x.io', NULL);
    INSERT INTO users VALUES ('bob', 'Bob', 'bob@x.io', NULL);
    INSERT INTO workspace (id, slug, kind, name, owner_user_id, created_at, updated_at)
      VALUES ('team', 'team', 'team', 'Team', 'ann', 1, 1);
    INSERT INTO workspace_member VALUES ('team', 'ann', 'owner', 1);
  `);
  db = d1(sqlite);
});

async function inviteAndAccept(role: "member" | "viewer") {
  const created = await createInvite(db, {
    workspaceId: "team",
    email: "bob@x.io",
    role,
    invitedByUserId: "ann",
  });
  if (!created.ok) throw new Error("invite refused");
  const found = await findInviteByToken(db, created.plaintextToken);
  expect(found?.role).toBe(role);
  return acceptInvite(db, { inviteId: created.invite.id, userId: "bob" });
}

describe("membership data", () => {
  it("grants the role the invite carried", async () => {
    const accepted = await inviteAndAccept("viewer");
    expect(accepted).toEqual({ ok: true, workspaceId: "team", role: "viewer" });
    expect(await getWorkspaceRole(db, "team", "bob")).toBe("viewer");
  });

  it("counts seats for the roles that record, viewers excluded", async () => {
    await inviteAndAccept("viewer");
    expect(await countWorkspaceMembers(db, "team")).toBe(2);
    expect(await countWorkspaceSeats(db, "team")).toBe(1);

    const changed = await updateWorkspaceMemberRole(
      db,
      "team",
      "bob",
      "member",
    );
    expect(changed).toEqual({ ok: true, changed: true });
    expect(await countWorkspaceSeats(db, "team")).toBe(2);
  });

  it("never reassigns or removes the owner", async () => {
    expect(
      await updateWorkspaceMemberRole(db, "team", "ann", "viewer"),
    ).toEqual({ ok: false, reason: "cannot_change_owner" });
    expect(await removeWorkspaceMember(db, "team", "ann")).toEqual({
      ok: false,
      reason: "cannot_remove_owner",
    });
    expect(
      await updateWorkspaceMemberRole(db, "team", "zed", "viewer"),
    ).toEqual({ ok: false, reason: "not_member" });
  });

  it("lists the owner first, then members, then viewers", async () => {
    await inviteAndAccept("viewer");
    sqlite
      .prepare(`INSERT INTO users VALUES ('cat', 'Cat', 'cat@x.io', NULL)`)
      .run();
    sqlite
      .prepare(
        `INSERT INTO workspace_member VALUES ('team', 'cat', 'member', 0)`,
      )
      .run();
    const members = await listMembers(db, "team");
    expect(members.map((m) => m.role)).toEqual(["owner", "member", "viewer"]);
  });

  it("reads a role it does not know as the least privileged one", async () => {
    sqlite
      .prepare(
        `INSERT INTO workspace_member VALUES ('team', 'bob', 'editor', 1)`,
      )
      .run();
    expect(await getWorkspaceRole(db, "team", "bob")).toBe("viewer");
    expect(await countWorkspaceSeats(db, "team")).toBe(1);
  });
});
