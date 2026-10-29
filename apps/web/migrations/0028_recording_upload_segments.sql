-- Segmented uploads: the recorder sends its file in small pieces every few
-- seconds, so almost nothing is left to send when it stops. R2 multipart
-- parts must be 5 MiB, so the pieces land as their own objects
-- (<storage key>.seg/<offset>) and the server copies them into the multipart
-- upload, one whole part at a time.
--
-- recording_upload_segments is one row per piece: which stream and where in
-- the file it sits. recording_upload_parts is the multipart parts already
-- built from them. Both only live while the stream is pending; the hourly
-- cron clears them after, and ON DELETE CASCADE covers a deleted recording.
-- received_at keeps a long recording that is still sending from being
-- swept as a stale upload.

CREATE TABLE IF NOT EXISTS recording_upload_segments (
  slug        TEXT NOT NULL REFERENCES recordings(slug) ON DELETE CASCADE,
  stream      TEXT NOT NULL CHECK (stream IN ('screen', 'webcam')),
  byte_offset INTEGER NOT NULL,
  size        INTEGER NOT NULL,
  received_at INTEGER NOT NULL,
  PRIMARY KEY (slug, stream, byte_offset)
) STRICT;

CREATE TABLE IF NOT EXISTS recording_upload_parts (
  slug        TEXT NOT NULL REFERENCES recordings(slug) ON DELETE CASCADE,
  stream      TEXT NOT NULL CHECK (stream IN ('screen', 'webcam')),
  part_number INTEGER NOT NULL,
  etag        TEXT NOT NULL,
  PRIMARY KEY (slug, stream, part_number)
) STRICT;
