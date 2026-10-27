import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyDueDowngrades,
  hasSeatRequest,
  listSeatRequests,
  requestSeat,
  scheduleMemberDowngrade,
  updateWorkspaceMemberRole,
} from "@captureflow/quota";

// Minimal D1 over node:sqlite, the same shim the upload-target tests use.
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

function roleOf(userId: string) {
  return sqlite
    .prepare(
      `SELECT role, downgrade_at FROM workspace_member WHERE workspace_id = 'w' AND user_id = ?`,
    )
    .get(userId) as { role: string; downgrade_at: number | null };
}

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, email TEXT, image TEXT);
    CREATE TABLE workspace_member (workspace_id TEXT, user_id TEXT, role TEXT,
      joined_at INTEGER, downgrade_at INTEGER, PRIMARY KEY (workspace_id, user_id));
    CREATE TABLE seat_request (workspace_id TEXT, user_id TEXT, created_at INTEGER,
      PRIMARY KEY (workspace_id, user_id));
    INSERT INTO users (id, name, email) VALUES ('ann', 'Ann', 'ann@x.io'),
      ('bob', 'Bob', 'bob@x.io'), ('vic', 'Vic', 'vic@x.io');
    INSERT INTO workspace_member (workspace_id, user_id, role, joined_at) VALUES
      ('w', 'ann', 'owner', 1), ('w', 'bob', 'member', 1), ('w', 'vic', 'viewer', 1);
  `);
  db = d1(sqlite);
});

describe("seat requests", () => {
  it("takes one open request from a viewer and lists it", async () => {
    const args = { workspaceId: "w", userId: "vic", now: 5 };
    expect(await requestSeat(db, args)).toEqual({ created: true });
    expect(await requestSeat(db, args)).toEqual({ created: false });
    expect(await hasSeatRequest(db, "w", "vic")).toBe(true);
    const listed = await listSeatRequests(db, "w");
    expect(listed.map((r) => r.user_id)).toEqual(["vic"]);
  });

  it("refuses a request from someone who can already record", async () => {
    const result = await requestSeat(db, {
      workspaceId: "w",
      userId: "bob",
      now: 5,
    });
    expect(result).toEqual({ created: false });
  });

  it("drops a request from the list once the viewer is a member", async () => {
    await requestSeat(db, { workspaceId: "w", userId: "vic", now: 5 });
    await updateWorkspaceMemberRole(db, "w", "vic", "member");
    expect(await listSeatRequests(db, "w")).toEqual([]);
  });
});

describe("scheduled downgrades", () => {
  it("schedules only members", async () => {
    expect(
      await scheduleMemberDowngrade(db, {
        workspaceId: "w",
        userId: "bob",
        at: 100,
      }),
    ).toBe(true);
    expect(
      await scheduleMemberDowngrade(db, {
        workspaceId: "w",
        userId: "ann",
        at: 100,
      }),
    ).toBe(false);
    expect(roleOf("bob")).toEqual({ role: "member", downgrade_at: 100 });
  });

  it("applies a due downgrade and reports the workspace", async () => {
    await scheduleMemberDowngrade(db, {
      workspaceId: "w",
      userId: "bob",
      at: 100,
    });
    expect(await applyDueDowngrades(db, 99)).toEqual([]);
    expect(roleOf("bob").role).toBe("member");
    expect(await applyDueDowngrades(db, 100)).toEqual(["w"]);
    expect(roleOf("bob")).toEqual({ role: "viewer", downgrade_at: null });
  });

  it("clears a pending downgrade when the role is set again", async () => {
    await scheduleMemberDowngrade(db, {
      workspaceId: "w",
      userId: "bob",
      at: 100,
    });
    await updateWorkspaceMemberRole(db, "w", "bob", "viewer");
    expect(roleOf("bob")).toEqual({ role: "viewer", downgrade_at: null });
  });
});
