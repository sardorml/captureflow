import { DatabaseSync, type SQLInputValue } from "node:sqlite";

type Row = Record<string, unknown>;

type Bound = { sql: string; params: SQLInputValue[] };

const BOUND = Symbol("bound");

type Statement = D1PreparedStatement & { [BOUND]: Bound };

// D1's binding rules: booleans become 0/1, byte buffers become blobs, and
// undefined is an error rather than a silent NULL.
function toParam(value: unknown): SQLInputValue {
  if (value === undefined) {
    throw new TypeError("D1_TYPE_ERROR: Type 'undefined' not supported");
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  return value as SQLInputValue;
}

// node:sqlite hands back null-prototype rows and Uint8Array blobs; D1 gives
// plain objects and number arrays.
function toRow(raw: object): Row {
  const row: Row = {};
  for (const [key, value] of Object.entries(raw)) {
    row[key] = value instanceof Uint8Array ? Array.from(value) : value;
  }
  return row;
}

/*
 * A D1Database over a local SQLite file. Every statement runs synchronously
 * under the hood, so a batch() is one uninterrupted transaction even with
 * other requests awaiting around it.
 */
export function createD1(path: string): D1Database {
  const sqlite = new DatabaseSync(path);
  sqlite.exec(
    "PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;",
  );
  const totalChanges = sqlite.prepare("SELECT total_changes() AS n");
  const lastRowId = sqlite.prepare("SELECT last_insert_rowid() AS id");

  function execute({ sql, params }: Bound): D1Result<Row> {
    const started = performance.now();
    const before = Number(totalChanges.get()?.n ?? 0);
    const results = sqlite
      .prepare(sql)
      .all(...params)
      .map(toRow);
    const changes = Number(totalChanges.get()?.n ?? 0) - before;
    return {
      results,
      success: true,
      meta: {
        duration: performance.now() - started,
        size_after: 0,
        rows_read: results.length,
        rows_written: changes,
        last_row_id: Number(lastRowId.get()?.id ?? 0),
        changed_db: changes > 0,
        changes,
      },
    };
  }

  function statement(bound: Bound): Statement {
    const self = {
      [BOUND]: bound,
      bind: (...values: unknown[]) =>
        statement({ sql: bound.sql, params: values.map(toParam) }),
      first: async (column?: string) => {
        const row = execute(bound).results[0];
        if (!row) return null;
        return column === undefined ? row : (row[column] ?? null);
      },
      all: async () => execute(bound),
      run: async () => execute(bound),
      raw: async (options?: { columnNames?: boolean }) => {
        const prepared = sqlite.prepare(bound.sql);
        prepared.setReturnArrays(true);
        const rows = (
          prepared.all(...bound.params) as unknown as unknown[][]
        ).map((row) =>
          row.map((value) =>
            value instanceof Uint8Array ? Array.from(value) : value,
          ),
        );
        if (!options?.columnNames) return rows;
        return [prepared.columns().map((c) => c.name), ...rows];
      },
    };
    return self as unknown as Statement;
  }

  const db = {
    prepare: (sql: string) => statement({ sql, params: [] }),
    batch: async (statements: D1PreparedStatement[]) => {
      sqlite.exec("BEGIN");
      try {
        const out = statements.map((s) => execute((s as Statement)[BOUND]));
        sqlite.exec("COMMIT");
        return out;
      } catch (err) {
        sqlite.exec("ROLLBACK");
        throw err;
      }
    },
    exec: async (sql: string) => {
      const started = performance.now();
      sqlite.exec(sql);
      return {
        count: sql.split(";").filter((s) => s.trim()).length,
        duration: performance.now() - started,
      };
    },
    dump: async () => {
      throw new Error("dump() is not supported by the self-hosted database");
    },
    withSession: () => db,
  };
  return db as unknown as D1Database;
}
