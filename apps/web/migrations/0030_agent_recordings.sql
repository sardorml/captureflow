-- Recordings an agent makes over MCP in a cloud browser. One row per
-- session: who started it, the device token minted for its upload (revoked
-- when it ends), and the recording it uploads into. ended_at is null while
-- the browser is running.

CREATE TABLE IF NOT EXISTS agent_recordings (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_token_id TEXT NOT NULL,
  slug            TEXT,
  created_at      INTEGER NOT NULL,
  ended_at        INTEGER
) STRICT;

CREATE INDEX IF NOT EXISTS agent_recordings_user_idx
  ON agent_recordings (user_id, ended_at);
