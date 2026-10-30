import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import {
  endAgentRecording,
  findRunningAgentRecording,
  getRunningAgentRecording,
  insertAgentRecording,
  SESSION_LIFETIME_MS,
  sweepAgentRecordings,
} from "./agent-recordings-db";

type Stmt = { sql: string; params: SQLInputValue[] };

function d1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string, params: SQLInputValue[] = []) => ({
    sql,
    params,
    bind: (...next: SQLInputValue[]) => prepare(sql, next),
    run: async () => sqlite.prepare(sql).run(...params),
    first: async () => sqlite.prepare(sql).get(...params) ?? null,
  });
  const batch = async (stmts: Stmt[]) =>
    stmts.map((s) => sqlite.prepare(s.sql).run(...s.params));
  return { prepare, batch } as unknown as D1Database;
}

let sqlite: DatabaseSync;
let db: D1Database;

const tokenRevoked = (id: string) =>
  (sqlite.prepare(`SELECT revoked_at FROM device_tokens WHERE id = ?`).get(id)
    ?.revoked_at ?? null) !== null;

beforeEach(async () => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE device_tokens (id TEXT PRIMARY KEY, revoked_at INTEGER);
    CREATE TABLE agent_recordings (id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      device_token_id TEXT NOT NULL, slug TEXT, created_at INTEGER NOT NULL,
      ended_at INTEGER);
    INSERT INTO device_tokens (id) VALUES ('t-old'), ('t-new');
  `);
  db = d1(sqlite);
  await insertAgentRecording(db, {
    id: "old",
    userId: "me",
    deviceTokenId: "t-old",
    now: 1_000,
  });
  await insertAgentRecording(db, {
    id: "new",
    userId: "me",
    deviceTokenId: "t-new",
    now: SESSION_LIFETIME_MS + 5_000,
  });
});

describe("agent recordings", () => {
  it("only finds a running session for its owner", async () => {
    expect(await getRunningAgentRecording(db, "me", "new")).toMatchObject({
      deviceTokenId: "t-new",
    });
    expect(await getRunningAgentRecording(db, "other", "new")).toBeNull();
  });

  it("ending a session revokes its token and stops it counting as running", async () => {
    await endAgentRecording(db, "new", 9_000);
    expect(tokenRevoked("t-new")).toBe(true);
    expect(tokenRevoked("t-old")).toBe(false);
    expect(await getRunningAgentRecording(db, "me", "new")).toBeNull();
    expect((await findRunningAgentRecording(db, "me", 0))?.id).toBe("old");
  });

  it("the sweep ends only sessions too old to still be running", async () => {
    await sweepAgentRecordings(db, SESSION_LIFETIME_MS + 6_000);
    expect(tokenRevoked("t-old")).toBe(true);
    expect(tokenRevoked("t-new")).toBe(false);
    expect(await getRunningAgentRecording(db, "me", "old")).toBeNull();
  });
});
