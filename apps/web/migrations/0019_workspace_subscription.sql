-- Per-seat billing: a subscription belongs to a workspace and `quantity` is
-- its seat count. Rows arrive from the billing webhook; `workspace_id` comes
-- from checkout custom data and is NULL until a later event supplies it.
-- The per-user `pro_subscription` table stays for storage plans still running.
CREATE TABLE workspace_subscription (
  ls_subscription_id      TEXT PRIMARY KEY,
  ls_subscription_item_id TEXT,
  workspace_id            TEXT REFERENCES workspace(id) ON DELETE SET NULL,
  ls_variant_id           TEXT NOT NULL,
  ls_customer_id          TEXT,
  ls_customer_email       TEXT NOT NULL,
  status                  TEXT NOT NULL,
  cycle                   TEXT NOT NULL,
  quantity                INTEGER NOT NULL DEFAULT 1,
  current_period_end      INTEGER,
  cancelled_at            INTEGER,
  created_at              INTEGER NOT NULL,
  updated_at              INTEGER NOT NULL,
  CHECK (cycle IN ('monthly', 'annual'))
) STRICT;

CREATE INDEX idx_workspace_subscription_workspace
  ON workspace_subscription (workspace_id, updated_at DESC);
