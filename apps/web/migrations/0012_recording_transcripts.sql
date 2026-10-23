-- Transcripts, produced by Workers AI (Whisper) from the mic audio the
-- recorder uploads in short standalone chunks next to the video.
--
-- recording_transcripts is the job and its result: one row per recording,
-- `pending` while chunks are queued, then `ready` with auto_json (a
-- RecordingTranscript, see lib/recording/transcript.ts) or `failed` with the
-- reason. edited_json holds the owner's text corrections and is cleared when
-- the recording is transcribed again. Kept out of `recordings` because that
-- row is read on every /api/r/* call and a transcript runs to tens of KB.
--
-- recording_transcript_parts is one row per audio chunk: where it lives in
-- R2, where it sits on the recording clock, and its transcribed segments
-- once Whisper has run. The transcript is assembled when every part is in.
-- ON DELETE CASCADE is the only cleanup for both tables.

CREATE TABLE IF NOT EXISTS recording_transcripts (
  slug         TEXT PRIMARY KEY REFERENCES recordings(slug) ON DELETE CASCADE,
  status       TEXT NOT NULL CHECK (status IN ('pending', 'ready', 'failed')),
  language     TEXT,
  part_count   INTEGER NOT NULL,
  auto_json    TEXT,
  edited_json  TEXT,
  error        TEXT,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS recording_transcript_parts (
  slug          TEXT NOT NULL REFERENCES recordings(slug) ON DELETE CASCADE,
  part_number   INTEGER NOT NULL,
  storage_key   TEXT NOT NULL,
  start_ms      INTEGER NOT NULL,
  end_ms        INTEGER NOT NULL,
  segments_json TEXT,
  updated_at    INTEGER NOT NULL,
  PRIMARY KEY (slug, part_number)
) STRICT;
