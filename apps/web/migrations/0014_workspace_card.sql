-- The background of a workspace's card on the Workspaces page: a gradient
-- preset ("preset:<key>") or an uploaded image ("image:<r2 key>"), see
-- lib/workspace-card.ts. NULL is a plain card.
ALTER TABLE workspace ADD COLUMN card_bg TEXT;
