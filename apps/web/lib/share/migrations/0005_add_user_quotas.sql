-- Adds the `user_quotas` table. This file documents the migration
-- alongside the db code so the schema is self-contained.

CREATE TABLE IF NOT EXISTS user_quotas (
  user_id                TEXT PRIMARY KEY,
  storage_bytes_override INTEGER,
  active_shares_override INTEGER,
  note                   TEXT,
  updated_at             INTEGER NOT NULL
) STRICT;
