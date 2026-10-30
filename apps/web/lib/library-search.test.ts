import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { searchLibrary } from "./library-search";

function d1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string, params: SQLInputValue[] = []) => ({
    bind: (...next: SQLInputValue[]) => prepare(sql, next),
    all: async () => ({ results: sqlite.prepare(sql).all(...params) }),
  });
  return { prepare } as unknown as D1Database;
}

let sqlite: DatabaseSync;

beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE recordings (slug TEXT, title TEXT, poster_key TEXT,
      created_at INTEGER, user_id TEXT, state TEXT);
    CREATE TABLE screenshots (id TEXT, title TEXT, created_at INTEGER,
      user_id TEXT, state TEXT);
  `);
  const rec = sqlite.prepare(
    `INSERT INTO recordings VALUES (?, ?, ?, ?, ?, ?)`,
  );
  rec.run("r1", "Onboarding demo", "posters/r1.jpg", 10, "me", "ready");
  rec.run("r2", "Demo 100% done", null, 30, "me", "ready");
  rec.run("r3", "Demo pending", null, 40, "me", "pending");
  rec.run("r4", "Someone else's demo", null, 50, "other", "ready");
  sqlite
    .prepare(`INSERT INTO screenshots VALUES (?, ?, ?, ?, ?)`)
    .run("s1", "Demo screenshot", 20, "me", "ready");
});

describe("searchLibrary", () => {
  it("finds the user's own ready items by title, newest first", async () => {
    const hits = await searchLibrary(d1(sqlite), "me", "demo", "https://cdn");
    expect(hits.map((h) => [h.kind, h.id])).toEqual([
      ["recording", "r2"],
      ["screenshot", "s1"],
      ["recording", "r1"],
    ]);
    expect(hits[2]?.thumbnailUrl).toBe("https://cdn/posters/r1.jpg");
    expect(hits[1]?.thumbnailUrl).toBe("https://cdn/screenshots/s1");
  });

  it("treats % and _ in the query as text", async () => {
    const hits = await searchLibrary(d1(sqlite), "me", "100%", "https://cdn");
    expect(hits.map((h) => h.id)).toEqual(["r2"]);
  });

  it("needs at least two characters", async () => {
    expect(await searchLibrary(d1(sqlite), "me", " d ", "https://cdn")).toEqual(
      [],
    );
  });
});
