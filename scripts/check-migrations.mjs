#!/usr/bin/env node
/*
 * Fails when a new D1 migration drops or renames a table or column that the
 * deployed code still uses. CI applies migrations before the new worker goes
 * live, so for that window the old code runs on the new schema: a drop has to
 * ship in a later release than the code that stops using it.
 *
 *   node scripts/check-migrations.mjs <base-ref>
 *
 * <base-ref> is the code that is live while the migration runs: the PR's base
 * branch, or the previous main commit on a push. A name that is genuinely
 * unused despite matching (a common column name, say) is waived with a
 * `-- safe-drop: <name>` line in the migration, where reviewers see it.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const MIGRATIONS_DIR = "apps/web/migrations";
const IDENT = String.raw`["\x60\[]?(\w+)["\x60\]]?`;

function withoutComments(sql) {
  return sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function matches(sql, pattern) {
  return [...sql.matchAll(new RegExp(pattern, "gi"))];
}

// The SQLite table-rebuild pattern (create x_new, copy, drop x, rename x_new
// to x) leaves x in place, so a drop of a table recreated in the same file
// doesn't count.
export function removedNames(rawSql) {
  const sql = withoutComments(rawSql);
  const created = new Set(
    matches(
      sql,
      String.raw`CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?${IDENT}`,
    ).map((m) => m[1].toLowerCase()),
  );
  const renamedTo = new Set(
    matches(
      sql,
      String.raw`ALTER\s+TABLE\s+${IDENT}\s+RENAME\s+TO\s+${IDENT}`,
    ).map((m) => m[2].toLowerCase()),
  );
  const survives = (name) =>
    created.has(name.toLowerCase()) || renamedTo.has(name.toLowerCase());

  const removed = [
    ...matches(sql, String.raw`DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?${IDENT}`)
      .map((m) => ({ kind: "table", name: m[1] }))
      .filter((r) => !survives(r.name)),
    ...matches(
      sql,
      String.raw`ALTER\s+TABLE\s+${IDENT}\s+RENAME\s+TO\s+${IDENT}`,
    )
      .map((m) => ({ kind: "table", name: m[1] }))
      .filter((r) => !created.has(r.name.toLowerCase())),
    ...matches(
      sql,
      String.raw`ALTER\s+TABLE\s+${IDENT}\s+DROP\s+(?:COLUMN\s+)?${IDENT}`,
    ).map((m) => ({ kind: "column", name: m[2], table: m[1] })),
    ...matches(
      sql,
      String.raw`ALTER\s+TABLE\s+${IDENT}\s+RENAME\s+(?:COLUMN\s+)?${IDENT}\s+TO\s+${IDENT}`,
    )
      .filter((m) => m[2].toLowerCase() !== "to")
      .map((m) => ({ kind: "column", name: m[2], table: m[1] })),
  ];
  const seen = new Set();
  return removed.filter((r) => {
    const key = `${r.kind}:${r.table ?? ""}:${r.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function waivedNames(rawSql) {
  return new Set(
    [...rawSql.matchAll(/^--\s*safe-drop:\s*(\w+)/gim)].map((m) =>
      m[1].toLowerCase(),
    ),
  );
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function addedMigrations(base) {
  return git([
    "diff",
    "--name-only",
    "--diff-filter=A",
    `${base}...HEAD`,
    "--",
    `${MIGRATIONS_DIR}/*.sql`,
  ])
    .split("\n")
    .filter(Boolean);
}

function usesOnBase(base, name) {
  try {
    return git([
      "grep",
      "-l",
      "-w",
      "-i",
      "-e",
      name,
      base,
      "--",
      "apps",
      "packages",
      ":(exclude)**/*.sql",
      ":(exclude)**/*.test.ts",
      ":(exclude)**/*.md",
    ])
      .split("\n")
      .filter(Boolean)
      .map((line) => line.slice(base.length + 1));
  } catch {
    return [];
  }
}

function main() {
  const base = process.argv[2];
  if (!base) {
    console.error("usage: node scripts/check-migrations.mjs <base-ref>");
    process.exit(2);
  }
  const problems = [];
  for (const file of addedMigrations(base)) {
    const sql = readFileSync(file, "utf8");
    const waived = waivedNames(sql);
    for (const removed of removedNames(sql)) {
      if (waived.has(removed.name.toLowerCase())) continue;
      const users = usesOnBase(base, removed.name);
      if (users.length) problems.push({ file, removed, users });
    }
  }
  if (!problems.length) {
    console.log("migrations: nothing the deployed code uses is dropped");
    return;
  }
  for (const { file, removed, users } of problems) {
    const what =
      removed.kind === "table"
        ? `table ${removed.name}`
        : `column ${removed.table}.${removed.name}`;
    console.error(`✘ ${file} drops or renames ${what}, still used on ${base}:`);
    for (const user of users.slice(0, 8)) console.error(`    ${user}`);
  }
  console.error(
    "\nShip the code that stops using it first, then drop it in a later PR.\n" +
      "If the match is a false positive, add `-- safe-drop: <name>` to the migration.",
  );
  process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
