/// <reference types="node" />

import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { describeRoute, getUserAccess } from "./access";

function d1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string, params: SQLInputValue[] = []) => ({
    bind: (...next: SQLInputValue[]) => prepare(sql, next),
    all: async () => ({ results: sqlite.prepare(sql).all(...params) }),
    first: async () => sqlite.prepare(sql).get(...params) ?? null,
    run: async () => ({ meta: { changes: 0 } }),
  });
  return { prepare } as unknown as D1Database;
}

const NOW = 1_800_000_000_000;
const HOUR = 60 * 60 * 1000;
const MAC_CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";

let sqlite: DatabaseSync;
let db: D1Database;

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE sessions (id TEXT, userId TEXT, createdAt INTEGER, updatedAt INTEGER,
      expiresAt INTEGER, ipAddress TEXT, userAgent TEXT);
    CREATE TABLE device_tokens (id TEXT, user_id TEXT, label TEXT, created_at INTEGER,
      last_used_at INTEGER, revoked_at INTEGER);
    CREATE TABLE user_access (user_id TEXT, hour INTEGER, via TEXT, credential_id TEXT,
      route TEXT, hits INTEGER, first_at INTEGER, last_at INTEGER, ip TEXT,
      country TEXT, city TEXT, user_agent TEXT);
  `);
  db = d1(sqlite);
});

describe("describeRoute", () => {
  it("marks client check-ins as background", () => {
    expect(describeRoute("GET /api/r/auth/check").isBackground).toBe(true);
    expect(describeRoute("GET /api/auth/get-session").isBackground).toBe(true);
    expect(describeRoute("GET /api/something-new").isBackground).toBe(true);
  });

  it("marks what a person does as foreground", () => {
    expect(describeRoute("POST /api/r/init")).toEqual({
      label: "Started a recording",
      isBackground: false,
    });
    expect(describeRoute("PAGE /recordings")).toEqual({
      label: "Opened a page: /recordings",
      isBackground: false,
    });
  });
});

describe("getUserAccess", () => {
  it("explains a background device check as the cause of last active", async () => {
    sqlite.exec(`
      INSERT INTO sessions VALUES ('s1', 'u1', ${NOW - 6 * 24 * HOUR}, ${NOW - 6 * 24 * HOUR},
        ${NOW + 20 * 24 * HOUR}, '1.2.3.4', '${MAC_CHROME}');
      INSERT INTO device_tokens VALUES ('d1', 'u1', 'Browser extension', ${NOW - 6 * 24 * HOUR},
        ${NOW - 2 * HOUR}, NULL);
      INSERT INTO user_access VALUES ('u1', ${NOW - 3 * HOUR}, 'device', 'd1',
        'GET /api/r/auth/check', 4, ${NOW - 3 * HOUR}, ${NOW - 2 * HOUR}, '5.6.7.8', 'NG', 'Lagos', '${MAC_CHROME}');
      INSERT INTO user_access VALUES ('u1', ${NOW - 6 * 24 * HOUR}, 'session', 's1',
        'PAGE /recordings', 1, ${NOW - 6 * 24 * HOUR}, ${NOW - 6 * 24 * HOUR}, '1.2.3.4', 'NG', NULL, '${MAC_CHROME}');
    `);
    const access = await getUserAccess(db, "u1", NOW);
    expect(access.lastActive?.via).toBe("device");
    expect(access.lastActive?.credential).toBe("Browser extension");
    expect(access.lastActive?.access?.isBackground).toBe(true);
    expect(access.lastActive?.explanation).toContain("background request");
    expect(access.lastForeground?.route).toBe("PAGE /recordings");
    expect(access.sessions[0]?.client).toBe("Chrome on macOS");
    expect(access.devices[0]?.requests).toBe(4);
    expect(access.totals.requests30d).toBe(5);
    expect(access.totals.foregroundDays30d).toBe(1);
  });

  it("says so when the log has no request for a session refresh", async () => {
    sqlite.exec(`
      INSERT INTO sessions VALUES ('s1', 'u1', ${NOW - 9 * 24 * HOUR}, ${NOW - HOUR},
        ${NOW + 20 * 24 * HOUR}, NULL, '${MAC_CHROME}');
    `);
    const access = await getUserAccess(db, "u1", NOW);
    expect(access.lastActive?.via).toBe("session");
    expect(access.lastActive?.access).toBeNull();
    expect(access.lastActive?.explanation).toContain("refreshed");
  });

  it("works before the access table exists", async () => {
    sqlite.exec(`DROP TABLE user_access`);
    const access = await getUserAccess(db, "u1", NOW);
    expect(access.hasLog).toBe(false);
    expect(access.lastActive).toBeNull();
  });
});
