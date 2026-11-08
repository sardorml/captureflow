/// <reference types="@cloudflare/workers-types" />
import { describe, expect, it } from "vitest";
import { watchD1 } from "./d1-watch";

function fakeD1(hang: string) {
  const batched: unknown[][] = [];
  const statement = (sql: string): D1PreparedStatement =>
    ({
      sql,
      bind: () => statement(sql),
      first: () =>
        sql === hang ? new Promise(() => {}) : Promise.resolve({ ok: 1 }),
      all: () => Promise.resolve({ results: [] }),
      run: () => Promise.resolve({}),
      raw: () => Promise.resolve([]),
    }) as unknown as D1PreparedStatement;
  const db = {
    prepare: statement,
    batch: (stmts: unknown[]) => {
      batched.push(stmts);
      return Promise.resolve([]);
    },
  } as unknown as D1Database;
  return { db, batched };
}

describe("watchD1", () => {
  it("names the statement still waiting", async () => {
    const watch = watchD1(fakeD1("select * from session").db);
    await watch.db.prepare("select 1").first();
    void watch.db.prepare("select * from session").bind("t").first();
    const text = watch.describe(Date.now() + 2500);
    expect(text).toMatch(
      /1 pending, oldest 25\d\dms on select \* from session/,
    );
  });

  it("says nothing is pending once every statement answered", async () => {
    const watch = watchD1(fakeD1("never").db);
    expect(watch.describe()).toBe("auth d1: no statement sent");
    await watch.db.prepare("select 1").bind(1).all();
    expect(watch.describe()).toMatch(/none pending, 1 done/);
  });

  it("hands the native batch the real statements", async () => {
    const { db, batched } = fakeD1("never");
    const watch = watchD1(db);
    const a = watch.db.prepare("insert a");
    await watch.db.batch([a]);
    expect((batched[0]![0] as { sql: string }).sql).toBe("insert a");
    expect(batched[0]![0]).not.toBe(a);
  });
});
