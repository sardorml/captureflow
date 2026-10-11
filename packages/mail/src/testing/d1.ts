import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const MIGRATION = new URL(
  "../../../../apps/web/migrations/0010_mail_campaigns.sql",
  import.meta.url,
);

type Row = Record<string, unknown>;

// Just enough of D1 over node:sqlite to run this package's real SQL in tests.
export function testD1(): D1Database {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    "CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE)",
  );
  sqlite.exec(readFileSync(MIGRATION, "utf8"));

  const statement = (sql: string, params: unknown[] = []) => ({
    bind: (...next: unknown[]) => statement(sql, next),
    all: async <T = Row>() => ({
      results: sqlite.prepare(sql).all(...(params as never[])) as T[],
    }),
    first: async <T = Row>() =>
      (sqlite.prepare(sql).get(...(params as never[])) as T | undefined) ??
      null,
    run: async () => {
      const r = sqlite.prepare(sql).run(...(params as never[]));
      return { meta: { changes: Number(r.changes) } };
    },
  });

  return {
    prepare: (sql: string) => statement(sql),
    batch: async (stmts: { run: () => Promise<unknown> }[]) => {
      const out = [];
      for (const s of stmts) out.push(await s.run());
      return out;
    },
  } as unknown as D1Database;
}

export async function addUser(db: D1Database, email: string): Promise<void> {
  await db
    .prepare("INSERT INTO users (id, name, email) VALUES (?1, ?2, ?1)")
    .bind(email, email.split("@")[0])
    .run();
}
