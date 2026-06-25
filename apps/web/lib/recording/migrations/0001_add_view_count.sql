-- Adds the `view_count` column for total page-load tracking.
-- Run against the existing prod D1 once via:
--   wrangler d1 execute captureflow --remote --file lib/recording/migrations/0001_add_view_count.sql
-- New deployments pick this up via schema.sql directly.
ALTER TABLE recordings ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;
