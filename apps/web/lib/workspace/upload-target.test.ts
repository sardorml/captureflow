import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { resolveUploadWorkspace } from "@captureflow/quota";

// Minimal D1 over node:sqlite, the same shim the cron tests use.
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

function workspace(id: string, owner: string, allowMemberUploads = 1) {
  sqlite
    .prepare(
      `INSERT INTO workspace (id, slug, kind, name, owner_user_id, created_at, updated_at, allow_member_uploads)
       VALUES (?, ?, 'team', ?, ?, 1, 1, ?)`,
    )
    .run(id, id, id, owner, allowMemberUploads);
  sqlite
    .prepare(
      `INSERT INTO workspace_member (workspace_id, user_id, role, joined_at) VALUES (?, ?, 'owner', 1)`,
    )
    .run(id, owner);
}

function member(workspaceId: string, userId: string, role: string) {
  sqlite
    .prepare(
      `INSERT INTO workspace_member (workspace_id, user_id, role, joined_at) VALUES (?, ?, ?, 1)`,
    )
    .run(workspaceId, userId, role);
}

function personal(userId: string) {
  sqlite
    .prepare(
      `INSERT INTO workspace (id, slug, kind, name, owner_user_id, created_at, updated_at, allow_member_uploads)
       VALUES (?, ?, 'personal', ?, ?, 1, 1, 1)`,
    )
    .run(`${userId}-home`, `${userId}-home`, "home", userId);
  member(`${userId}-home`, userId, "owner");
}

function pointAt(userId: string, workspaceId: string | null) {
  sqlite
    .prepare(`UPDATE users SET current_workspace_id = ? WHERE id = ?`)
    .run(workspaceId, userId);
}

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, current_workspace_id TEXT);
    CREATE TABLE workspace (id TEXT PRIMARY KEY, slug TEXT, kind TEXT, name TEXT,
      owner_user_id TEXT, created_at INTEGER, updated_at INTEGER, logo_key TEXT,
      allow_public_links INTEGER DEFAULT 1, allow_member_uploads INTEGER DEFAULT 1,
      card_bg TEXT);
    CREATE TABLE workspace_member (workspace_id TEXT, user_id TEXT, role TEXT,
      joined_at INTEGER, PRIMARY KEY (workspace_id, user_id));
  `);
  sqlite.prepare(`INSERT INTO users (id, name) VALUES ('ann', 'Ann')`).run();
  personal("ann");
  db = d1(sqlite);
});

describe("resolveUploadWorkspace", () => {
  it("lands a member's upload in the workspace they asked for", async () => {
    workspace("team", "bob");
    member("team", "ann", "member");
    const target = await resolveUploadWorkspace(db, {
      userId: "ann",
      requestedWorkspaceId: "team",
    });
    expect(target.workspace.id).toBe("team");
    expect(target.role).toBe("member");
  });

  it("sends a viewer's upload to their own workspace", async () => {
    workspace("team", "bob");
    member("team", "ann", "viewer");
    pointAt("ann", "team");
    const target = await resolveUploadWorkspace(db, {
      userId: "ann",
      requestedWorkspaceId: "team",
    });
    expect(target.workspace.id).toBe("ann-home");
    expect(target.role).toBe("owner");
  });

  it("follows the account's current workspace when none is named", async () => {
    workspace("team", "bob");
    member("team", "ann", "member");
    pointAt("ann", "team");
    const target = await resolveUploadWorkspace(db, { userId: "ann" });
    expect(target.workspace.id).toBe("team");
  });

  it("ignores a workspace the person is not in, or one that keeps uploads to its owner", async () => {
    workspace("private", "bob");
    workspace("owner-only", "bob", 0);
    member("owner-only", "ann", "member");
    for (const requested of ["private", "owner-only", "no-such-id"]) {
      const target = await resolveUploadWorkspace(db, {
        userId: "ann",
        requestedWorkspaceId: requested,
      });
      expect(target.workspace.id).toBe("ann-home");
    }
  });

  it("creates the personal workspace for an account that has none yet", async () => {
    sqlite.prepare(`INSERT INTO users (id, name) VALUES ('new', 'New')`).run();
    const target = await resolveUploadWorkspace(db, {
      userId: "new",
      displayName: "New Person",
    });
    expect(target.workspace.kind).toBe("personal");
    expect(target.workspace.owner_user_id).toBe("new");
    expect(target.role).toBe("owner");
  });
});
