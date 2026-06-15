-- Companion webcam stream for a share. Shares now upload TWO parallel
-- multipart streams from the desktop: the canonical screen MP4 (cursor +
-- system audio baked in) and an optional webcam WebM (video + mic audio
-- baked in). The web edit page composites the two at play time, so bg
-- and camera PiP placement stay editable without re-encoding.
--
-- Columns mirror the existing screen-side ones, prefixed with webcam_*.
-- A `state` value of `'none'` indicates the recording had no camera
-- attached and therefore no companion file ever uploads; the public
-- viewer renders the screen track alone in that case.

ALTER TABLE shares ADD COLUMN webcam_storage_key TEXT;
ALTER TABLE shares ADD COLUMN webcam_upload_id   TEXT;
ALTER TABLE shares ADD COLUMN webcam_size_bytes  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE shares ADD COLUMN webcam_state       TEXT NOT NULL DEFAULT 'none'
  CHECK (webcam_state IN ('none', 'pending', 'ready', 'failed'));
