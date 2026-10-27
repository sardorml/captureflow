-- Two seat plans share the subscription table; `plan` says which one a row
-- bought. Rows from before the split were the plan now called Light.
ALTER TABLE workspace_subscription ADD COLUMN plan TEXT NOT NULL DEFAULT 'light';
