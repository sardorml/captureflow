/// <reference types="@cloudflare/workers-types" />

// Table names come from the caller's own constant list, never from input.
export async function failingTables(
  db: D1Database,
  tables: readonly string[],
): Promise<string[]> {
  const results = await Promise.allSettled(
    tables.map((table) => db.prepare(`SELECT * FROM ${table} LIMIT 0`).all()),
  );
  return tables.filter((_, i) => results[i]?.status === "rejected");
}
