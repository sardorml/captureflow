-- When staff last reset a workspace's agent recording minutes for the month.
-- Only agent recordings made after it count toward the monthly allowance.
CREATE TABLE IF NOT EXISTS workspace_agent_usage_reset (
  workspace_id TEXT PRIMARY KEY REFERENCES workspace(id) ON DELETE CASCADE,
  reset_at     INTEGER NOT NULL,
  reset_by     TEXT NOT NULL
) STRICT;

-- A raised monthly agent recording allowance, in minutes. NULL keeps the default.
ALTER TABLE user_limit_override ADD COLUMN agent_minutes INTEGER;
ALTER TABLE workspace_limit_override ADD COLUMN agent_minutes INTEGER;
