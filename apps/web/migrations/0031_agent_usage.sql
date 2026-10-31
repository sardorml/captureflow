-- Agent recordings and voiceover have a monthly allowance per workspace, so
-- each session records the workspace it bills to and how many characters of
-- voiceover it generated. Rows from before this have no workspace and count
-- toward none.
ALTER TABLE agent_recordings ADD COLUMN workspace_id TEXT;
ALTER TABLE agent_recordings ADD COLUMN narrated_chars INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS agent_recordings_workspace_idx
  ON agent_recordings (workspace_id, created_at);
