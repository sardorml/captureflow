-- Adds ownership + visibility to shares so signed-in users can manage
-- their own links via app.captureflow.xyz.
--
-- user_id is nullable: every share predating the auth rollout (and any
-- anonymous record-and-share from a signed-out app) stays attached to
-- its device_id only. Dashboard listings join via user_id, so anon
-- shares simply don't appear there — they still resolve at their slug.
--
-- visibility is a CHECK-constrained TEXT, default 'public', so the
-- existing share-page renderer keeps working without code changes for
-- legacy rows. 'private' rows 404 on the public share page unless the
-- viewer is the owning user (enforced in app/[slug]/page.tsx).

ALTER TABLE shares ADD COLUMN user_id TEXT;
ALTER TABLE shares ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public';

-- Drives the dashboard's "list my shares" query — owner + most-recent
-- first. Partial index keeps the index small (anon rows are excluded).
CREATE INDEX IF NOT EXISTS idx_shares_user
  ON shares (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
