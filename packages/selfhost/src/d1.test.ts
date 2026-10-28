import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { createD1 } from "./d1";
import { applyMigrations } from "./migrate";

const WEB = new URL("../../../apps/web/", import.meta.url);
const MIGRATIONS = new URL("migrations/", WEB).pathname;
const SNAPSHOT = new URL("db/schema.snapshot.sql", WEB).pathname;

function tempDb(): string {
  return join(mkdtempSync(join(tmpdir(), "cf-d1-")), "app.sqlite");
}

function columnsByTable(sqlite: DatabaseSync): Map<string, string[]> {
  const tables = sqlite
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'",
    )
    .all()
    .map((r) => String(r.name));
  return new Map(
    tables.map((t) => [
      t,
      sqlite
        .prepare(`PRAGMA table_info("${t}")`)
        .all()
        .map((c) => String(c.name))
        .sort(),
    ]),
  );
}

describe("applyMigrations", () => {
  // The snapshot can trail the newest migration, so it's a floor, not an exact match.
  it("builds every table and column the committed snapshot has", () => {
    const path = tempDb();
    const applied = applyMigrations(path, MIGRATIONS);
    expect(applied.length).toBeGreaterThan(0);

    const snapshot = new DatabaseSync(":memory:");
    snapshot.exec(readFileSync(SNAPSHOT, "utf8"));
    const migrated = columnsByTable(new DatabaseSync(path));
    for (const [table, columns] of columnsByTable(snapshot)) {
      if (table === "d1_migrations") continue;
      expect(migrated.get(table), table).toEqual(
        expect.arrayContaining(columns),
      );
    }
  });

  it("is a no-op the second time", () => {
    const path = tempDb();
    applyMigrations(path, MIGRATIONS);
    expect(applyMigrations(path, MIGRATIONS)).toEqual([]);
  });
});

describe("createD1", () => {
  function db() {
    const d1 = createD1(tempDb());
    return d1;
  }

  it("answers prepare/bind/first/all/run the way D1 does", async () => {
    const d1 = db();
    await d1.exec(
      "CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT, flag INTEGER)",
    );
    const insert = await d1
      .prepare("INSERT INTO t (name, flag) VALUES (?1, ?2)")
      .bind("a", true)
      .run();
    expect(insert.success).toBe(true);
    expect(insert.meta.changes).toBe(1);
    expect(insert.meta.last_row_id).toBe(1);

    await d1
      .prepare("INSERT INTO t (name, flag) VALUES (?, ?)")
      .bind("b", false)
      .run();
    const all = await d1.prepare("SELECT * FROM t ORDER BY id").all();
    expect(all.results).toEqual([
      { id: 1, name: "a", flag: 1 },
      { id: 2, name: "b", flag: 0 },
    ]);
    expect(Object.getPrototypeOf(all.results[0])).toBe(Object.prototype);

    expect(
      await d1.prepare("SELECT name FROM t WHERE id = ?").bind(2).first("name"),
    ).toBe("b");
    expect(
      await d1.prepare("SELECT * FROM t WHERE id = ?").bind(9).first(),
    ).toBeNull();

    const update = await d1.prepare("UPDATE t SET name = 'z'").run();
    expect(update.meta.changes).toBe(2);
    const select = await d1.prepare("SELECT * FROM t").run();
    expect(select.meta.changes).toBe(0);
  });

  it("counts changes for RETURNING writes", async () => {
    const d1 = db();
    await d1.exec("CREATE TABLE t (id INTEGER PRIMARY KEY, n INTEGER)");
    const res = await d1
      .prepare("INSERT INTO t (n) VALUES (1), (2) RETURNING id")
      .all();
    expect(res.results).toEqual([{ id: 1 }, { id: 2 }]);
    expect(res.meta.changes).toBe(2);
  });

  it("rejects undefined binds", () => {
    expect(() => db().prepare("SELECT ?").bind(undefined)).toThrow(/undefined/);
  });

  it("returns arrays from raw(), with column names on request", async () => {
    const d1 = db();
    await d1.exec(
      "CREATE TABLE t (a INTEGER, b TEXT); INSERT INTO t VALUES (1, 'x')",
    );
    expect(await d1.prepare("SELECT a, b FROM t").raw()).toEqual([[1, "x"]]);
    expect(
      await d1.prepare("SELECT a, b FROM t").raw({ columnNames: true }),
    ).toEqual([
      ["a", "b"],
      [1, "x"],
    ]);
  });

  it("rolls a whole batch back when one statement fails", async () => {
    const d1 = db();
    await d1.exec("CREATE TABLE t (id INTEGER PRIMARY KEY)");
    await expect(
      d1.batch([
        d1.prepare("INSERT INTO t (id) VALUES (1)"),
        d1.prepare("INSERT INTO t (id) VALUES (1)"),
      ]),
    ).rejects.toThrow();
    expect(await d1.prepare("SELECT COUNT(*) AS n FROM t").first("n")).toBe(0);

    const results = await d1.batch([
      d1.prepare("INSERT INTO t (id) VALUES (?)").bind(1),
      d1.prepare("SELECT id FROM t"),
    ]);
    expect(results[1]?.results).toEqual([{ id: 1 }]);
  });

  it("enforces foreign keys like D1", async () => {
    const d1 = db();
    await d1.exec(
      "CREATE TABLE p (id INTEGER PRIMARY KEY); CREATE TABLE c (p INTEGER REFERENCES p(id))",
    );
    await expect(d1.prepare("INSERT INTO c VALUES (7)").run()).rejects.toThrow(
      /FOREIGN KEY/,
    );
  });
});
