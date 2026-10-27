import { strict as assert } from "node:assert";
import { test } from "node:test";
import { removedNames, waivedNames } from "./check-migrations.mjs";

const names = (sql) => removedNames(sql).map((r) => `${r.kind}:${r.name}`);

test("finds dropped tables and columns", () => {
  assert.deepEqual(
    names(`
      DROP TABLE IF EXISTS pro_subscription;
      DROP TABLE user_quotas;
      ALTER TABLE recordings DROP COLUMN legacy_preset;
    `),
    ["table:pro_subscription", "table:user_quotas", "column:legacy_preset"],
  );
});

test("finds renamed tables and columns by their old name", () => {
  assert.deepEqual(
    names(`
      ALTER TABLE old_name RENAME TO new_name;
      ALTER TABLE users RENAME COLUMN nick TO display_name;
    `),
    ["table:old_name", "column:nick"],
  );
});

test("ignores the table-rebuild pattern, which keeps the table", () => {
  assert.deepEqual(
    names(`
      CREATE TABLE user_quotas_new (user_id TEXT PRIMARY KEY);
      INSERT INTO user_quotas_new SELECT user_id FROM user_quotas;
      DROP TABLE user_quotas;
      ALTER TABLE user_quotas_new RENAME TO user_quotas;
    `),
    [],
  );
});

test("ignores additive changes and comments", () => {
  assert.deepEqual(
    names(`
      -- DROP TABLE mentioned_in_a_comment;
      CREATE TABLE notification (id TEXT PRIMARY KEY);
      ALTER TABLE workspace_member ADD COLUMN downgrade_at INTEGER;
      CREATE INDEX idx_x ON notification (id);
    `),
    [],
  );
});

test("reads safe-drop waivers", () => {
  assert.deepEqual(
    [...waivedNames("-- safe-drop: note\n-- safe-drop: Legacy\nDROP TABLE x;")],
    ["note", "legacy"],
  );
});
