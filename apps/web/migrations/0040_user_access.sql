-- Every signed-in request, folded into one row per user, credential, route and
-- hour: which session or device token made someone "active", from where, and
-- whether it was them or a client checking in the background.
CREATE TABLE IF NOT EXISTS user_access (
  user_id       TEXT NOT NULL,
  hour          INTEGER NOT NULL,
  via           TEXT NOT NULL,
  credential_id TEXT NOT NULL,
  route         TEXT NOT NULL,
  hits          INTEGER NOT NULL DEFAULT 1,
  first_at      INTEGER NOT NULL,
  last_at       INTEGER NOT NULL,
  ip            TEXT,
  country       TEXT,
  city          TEXT,
  user_agent    TEXT,
  PRIMARY KEY (user_id, hour, via, credential_id, route)
) STRICT;

CREATE INDEX IF NOT EXISTS idx_user_access_recent
  ON user_access (user_id, last_at DESC);
