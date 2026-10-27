import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import {
  addNotification,
  countUnreadNotifications,
  declineInvite,
  findPendingInviteForEmail,
  listInvitesForEmail,
  listNotifications,
  markNotificationsRead,
  type NotificationRow,
} from "@captureflow/quota";
import { notificationMessage } from "@/lib/notification-text";

// Minimal D1 over node:sqlite, the same shim the seat request tests use.
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

const FUTURE = Date.now() + 86_400_000;

let sqlite: DatabaseSync;
let db: D1Database;

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, email TEXT, image TEXT);
    CREATE TABLE workspace (id TEXT PRIMARY KEY, name TEXT);
    CREATE TABLE notification (id TEXT PRIMARY KEY, user_id TEXT, workspace_id TEXT,
      kind TEXT, actor_user_id TEXT, role TEXT, effective_at INTEGER,
      created_at INTEGER, read_at INTEGER);
    CREATE TABLE workspace_invite (id TEXT PRIMARY KEY, workspace_id TEXT, email TEXT,
      role TEXT, token_hash TEXT, invited_by_user_id TEXT, created_at INTEGER,
      expires_at INTEGER, accepted_at INTEGER);
    INSERT INTO users (id, name, email) VALUES ('ann', 'Ann Lee', 'ann@x.io'),
      ('vic', 'Vic', 'vic@x.io');
    INSERT INTO workspace (id, name) VALUES ('w', 'Acme');
  `);
  db = d1(sqlite);
});

describe("notifications", () => {
  it("lists newest first with the actor and workspace, and marks them read", async () => {
    await addNotification(db, {
      userId: "ann",
      workspaceId: "w",
      kind: "member_joined",
      actorUserId: "vic",
      role: "viewer",
      now: 1,
    });
    await addNotification(db, {
      userId: "ann",
      workspaceId: "w",
      kind: "seat_requested",
      actorUserId: "vic",
      now: 2,
    });
    const rows = await listNotifications(db, "ann", 10);
    expect(rows.map((r) => r.kind)).toEqual([
      "seat_requested",
      "member_joined",
    ]);
    expect(rows[1]).toMatchObject({
      actor_name: "Vic",
      workspace_name: "Acme",
      role: "viewer",
    });
    expect(await countUnreadNotifications(db, "ann")).toBe(2);
    await markNotificationsRead(db, "ann", 3);
    expect(await countUnreadNotifications(db, "ann")).toBe(0);
    expect(await countUnreadNotifications(db, "vic")).toBe(0);
  });

  it("drops kinds this build doesn't know", async () => {
    sqlite.exec(`INSERT INTO notification (id, user_id, workspace_id, kind, created_at)
      VALUES ('x', 'ann', 'w', 'from_the_future', 1)`);
    expect(await listNotifications(db, "ann", 10)).toEqual([]);
  });
});

describe("invites for the signed-in account", () => {
  beforeEach(() => {
    sqlite.exec(`INSERT INTO workspace_invite VALUES
      ('i1', 'w', 'Vic@X.io', 'viewer', 'h1', 'ann', 1, ${FUTURE}, NULL),
      ('i2', 'w', 'vic@x.io', 'member', 'h2', 'ann', 1, 0, NULL),
      ('i3', 'w', 'other@x.io', 'member', 'h3', 'ann', 1, ${FUTURE}, NULL)`);
  });

  it("lists only open invites to that email, with who sent them", async () => {
    const invites = await listInvitesForEmail(db, "vic@x.io");
    expect(invites).toHaveLength(1);
    expect(invites[0]).toMatchObject({
      id: "i1",
      workspace_name: "Acme",
      role: "viewer",
      inviter_name: "Ann Lee",
    });
  });

  it("finds and declines an invite only for its own email", async () => {
    expect(await findPendingInviteForEmail(db, "i3", "vic@x.io")).toBeNull();
    expect(
      await findPendingInviteForEmail(db, "i1", "vic@x.io"),
    ).not.toBeNull();
    await declineInvite(db, { inviteId: "i3", email: "vic@x.io" });
    await declineInvite(db, { inviteId: "i1", email: "vic@x.io" });
    const left = sqlite.prepare(`SELECT id FROM workspace_invite`).all();
    expect(left.map((r) => r.id)).toEqual(["i2", "i3"]);
  });
});

describe("notificationMessage", () => {
  const row = (patch: Partial<NotificationRow>): NotificationRow => ({
    id: "n",
    workspace_id: "w",
    workspace_name: "Acme",
    kind: "member_joined",
    actor_name: "Vic",
    actor_email: "vic@x.io",
    actor_image: null,
    role: null,
    effective_at: null,
    created_at: 1,
    read_at: null,
    ...patch,
  });

  it("says who joined and as what, linking the owner to members", () => {
    expect(notificationMessage(row({ role: "viewer" }))).toMatchObject({
      actor: "Vic",
      action: "joined",
      workspace: "Acme",
      suffix: "as a viewer",
      href: "/members",
    });
  });

  it("names the date a scheduled downgrade lands", () => {
    const message = notificationMessage(
      row({
        kind: "downgrade_scheduled",
        effective_at: Date.UTC(2026, 10, 12),
      }),
    );
    expect(message.note).toBe("You can keep recording until 12 November.");
  });

  it("falls back to the email, then to someone", () => {
    expect(notificationMessage(row({ actor_name: null })).actor).toBe(
      "vic@x.io",
    );
    expect(
      notificationMessage(row({ actor_name: null, actor_email: null })).actor,
    ).toBe("Someone");
  });
});
