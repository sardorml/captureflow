import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

// Same table wrangler keeps, so a database exported from D1 picks up where it left off.
const TRACKING_TABLE = `CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
)`;

export function applyMigrations(
  dbPath: string,
  migrationsDir: string,
): string[] {
  const sqlite = new DatabaseSync(dbPath);
  try {
    sqlite.exec("PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;");
    sqlite.exec(TRACKING_TABLE);
    const applied = new Set(
      sqlite
        .prepare("SELECT name FROM d1_migrations")
        .all()
        .map((row) => String(row.name)),
    );
    const pending = readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql") && !applied.has(name))
      .sort();
    for (const name of pending) {
      sqlite.exec("BEGIN");
      try {
        sqlite.exec(readFileSync(join(migrationsDir, name), "utf8"));
        sqlite.prepare("INSERT INTO d1_migrations (name) VALUES (?)").run(name);
        sqlite.exec("COMMIT");
      } catch (err) {
        sqlite.exec("ROLLBACK");
        throw new Error(`migration ${name} failed: ${String(err)}`);
      }
    }
    return pending;
  } finally {
    sqlite.close();
  }
}
