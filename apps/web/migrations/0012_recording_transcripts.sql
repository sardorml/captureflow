-- Auto transcript captured on the recorder plus the owner's text edits.
-- auto_json and edited_json each hold a RecordingTranscript (see
-- lib/recording/transcript.ts); edited_json stays NULL until the owner edits
-- and is cleared when a recorder re-posts the auto transcript. Kept out of
-- `recordings` because that row is read on every /api/r/* call and a
-- transcript runs to tens of KB. ON DELETE CASCADE is the only cleanup.

CREATE TABLE IF NOT EXISTS recording_transcripts (
  slug        TEXT PRIMARY KEY REFERENCES recordings(slug) ON DELETE CASCADE,
  source      TEXT NOT NULL,
  language    TEXT,
  auto_json   TEXT NOT NULL,
  edited_json TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
) STRICT;
