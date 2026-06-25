-- Adds the recording title (rendered above the player) and a separate
-- table for reactions (anonymous emoji taps recorded at a video
-- timestamp).
--
-- Title is nullable: existing rows + future recordings without a window
-- name fall through to the slug-only header. Default-emoji set lives
-- in app code (lib/recording/reactions.ts), so the table holds raw
-- strings to keep schema flexible if we add more later.

ALTER TABLE recordings ADD COLUMN title TEXT;

CREATE TABLE IF NOT EXISTS recording_reactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL,
  emoji         TEXT NOT NULL,
  timestamp_ms  INTEGER NOT NULL,
  created_at    INTEGER NOT NULL
) STRICT;

-- Reactions are read by slug ordered by timestamp for the marker
-- overlay above the scrubber. Index on (slug, timestamp_ms) lets the
-- read be a single index scan with no sort.
CREATE INDEX IF NOT EXISTS idx_reactions_slug
  ON recording_reactions (slug, timestamp_ms);
