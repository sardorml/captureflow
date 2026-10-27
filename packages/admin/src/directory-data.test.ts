/// <reference types="node" />

import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getAdminTotals,
  getAdminUser,
  getAdminWorkspace,
  listAdminUsers,
  listUserSubscriptions,
} from "./directory";

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

const NOW_S = Math.floor(Date.now() / 1000);
let sqlite: DatabaseSync;
let db: D1Database;

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, email TEXT, image TEXT,
      emailVerified INTEGER DEFAULT 1, createdAt INTEGER DEFAULT 1);
    CREATE TABLE accounts (userId TEXT, providerId TEXT);
    CREATE TABLE sessions (userId TEXT, updatedAt INTEGER, expiresAt INTEGER);
    CREATE TABLE device_tokens (user_id TEXT, last_used_at INTEGER, revoked_at INTEGER);
    CREATE TABLE workspace (id TEXT PRIMARY KEY, name TEXT, slug TEXT, kind TEXT,
      owner_user_id TEXT, created_at INTEGER DEFAULT 1,
      allow_public_links INTEGER DEFAULT 1, allow_member_uploads INTEGER DEFAULT 1);
    CREATE TABLE workspace_member (workspace_id TEXT, user_id TEXT, role TEXT,
      joined_at INTEGER DEFAULT 1);
    CREATE TABLE workspace_invite (id TEXT, workspace_id TEXT, email TEXT,
      accepted_at INTEGER, expires_at INTEGER, created_at INTEGER,
      invited_by_user_id TEXT);
    CREATE TABLE recordings (slug TEXT, user_id TEXT, workspace_id TEXT, state TEXT,
      size_bytes INTEGER DEFAULT 0, webcam_size_bytes INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0, duration_ms INTEGER, created_at INTEGER DEFAULT 1,
      title TEXT, visibility TEXT, client TEXT, capture_source TEXT, quality TEXT);
    CREATE TABLE screenshots (id TEXT, user_id TEXT, workspace_id TEXT, state TEXT,
      size_bytes INTEGER DEFAULT 0, view_count INTEGER DEFAULT 0, created_at INTEGER DEFAULT 1);
    CREATE TABLE workspace_subscription (ls_subscription_id TEXT PRIMARY KEY,
      ls_subscription_item_id TEXT, workspace_id TEXT, ls_variant_id TEXT,
      ls_customer_id TEXT, ls_customer_email TEXT, status TEXT, cycle TEXT,
      quantity INTEGER, current_period_end INTEGER, cancelled_at INTEGER,
      created_at INTEGER, updated_at INTEGER);
    INSERT INTO users (id, name, email) VALUES ('ann', 'Ann', 'ann@x.io'),
      ('bob', 'Bob', 'bob@x.io'), ('vic', 'Vic', 'vic@x.io'), ('zed', 'Zed', 'zed@x.io');
    INSERT INTO workspace (id, name, slug, kind, owner_user_id)
      VALUES ('team', 'Team', 'team', 'team', 'ann'), ('solo', 'Solo', 'solo', 'personal', 'zed');
    INSERT INTO workspace_member (workspace_id, user_id, role) VALUES
      ('team', 'ann', 'owner'), ('team', 'bob', 'member'), ('team', 'vic', 'viewer'),
      ('solo', 'zed', 'owner');
    INSERT INTO workspace_subscription VALUES ('sub-1', 'item-1', 'team', 'v', NULL,
      'ann@x.io', 'active', 'monthly', 2, ${NOW_S + 3600}, NULL, 1, 2);
    INSERT INTO recordings (slug, user_id, workspace_id, state, size_bytes)
      VALUES ('r1', 'bob', 'team', 'ready', 100), ('r2', 'zed', 'solo', 'ready', 5);
  `);
  db = d1(sqlite);
});

describe("admin directory on seat plans", () => {
  it("marks seat holders of a paid workspace as Team and leaves viewers free", async () => {
    const { rows } = await listAdminUsers(db, {
      search: "",
      page: 1,
      plan: "all",
    });
    const tier = Object.fromEntries(rows.map((r) => [r.id, r.plan.tier]));
    expect(tier).toEqual({
      ann: "team",
      bob: "team",
      vic: "free",
      zed: "free",
    });
    expect(rows.find((r) => r.id === "ann")?.plan.subscriptionStatus).toBe(
      "active",
    );
    expect(rows.find((r) => r.id === "ann")?.storageBytes).toBe(100);
  });

  it("filters the list by plan", async () => {
    const team = await listAdminUsers(db, {
      search: "",
      page: 1,
      plan: "team",
    });
    expect(team.rows.map((r) => r.id).sort()).toEqual(["ann", "bob"]);
    expect(team.total).toBe(2);
    const free = await listAdminUsers(db, {
      search: "",
      page: 1,
      plan: "free",
    });
    expect(free.rows.map((r) => r.id).sort()).toEqual(["vic", "zed"]);
  });

  it("reads one user with the same plan column", async () => {
    expect((await getAdminUser(db, "bob"))?.plan.tier).toBe("team");
    expect((await getAdminUser(db, "zed"))?.plan.tier).toBe("free");
  });

  it("reports a workspace's seats from its latest subscription", async () => {
    expect((await getAdminWorkspace(db, "team"))?.plan).toMatchObject({
      tier: "team",
      seats: 2,
      status: "active",
    });
    expect((await getAdminWorkspace(db, "solo"))?.plan).toMatchObject({
      tier: "free",
      seats: 0,
      status: null,
    });
  });

  it("lists the subscriptions on workspaces a user owns", async () => {
    const subs = await listUserSubscriptions(db, "ann");
    expect(subs).toHaveLength(1);
    expect(subs[0]).toMatchObject({
      workspaceId: "team",
      workspaceName: "Team",
      quantity: 2,
      isActive: true,
    });
    expect(await listUserSubscriptions(db, "bob")).toEqual([]);
  });

  it("counts Team users and paid workspaces in the totals", async () => {
    expect(await getAdminTotals(db)).toMatchObject({
      users: 4,
      teamUsers: 2,
      paidWorkspaces: 1,
      teamWorkspaces: 1,
    });
  });
});
