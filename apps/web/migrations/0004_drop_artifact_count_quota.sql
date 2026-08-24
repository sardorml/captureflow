-- Storage is the only quota, so the artifact-count override has nothing left to
-- override. Nothing reads the column: the count cap is gone from the limits
-- table, from both upload gates, from the usage endpoints, and from the admin
-- panel that used to set it.
--
-- The table is STRICT, and SQLite cannot ALTER a column out of a STRICT table
-- without rewriting it, so this is the standard rebuild: new shape, copy, swap.
CREATE TABLE user_quotas_new (
  user_id                TEXT PRIMARY KEY,
  storage_bytes_override INTEGER,
  note                   TEXT,
  updated_at             INTEGER NOT NULL
) STRICT;

INSERT INTO user_quotas_new (user_id, storage_bytes_override, note, updated_at)
SELECT user_id, storage_bytes_override, note, updated_at FROM user_quotas;

DROP TABLE user_quotas;

ALTER TABLE user_quotas_new RENAME TO user_quotas;
