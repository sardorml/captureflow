-- Tracks whether a recording is still being post-processed by the desktop
-- client. The recording upload (/api/init → /api/part → /api/finalize)
-- delivers the RAW screen MP4 quickly so the user gets a copyable link
-- in <1s. The composite layers (camera bubble, cursor effects, wallpaper
-- background) only land via a follow-up /api/replace once the renderer
-- finishes baking them in. Anyone who opens the recording between
-- /api/finalize and /api/replace would otherwise see the bare screen
-- recording and assume the recording is broken.
--
-- States:
--   'none'     — no bake is expected (no cam, no cursor, no bg).
--   'expected' — bake is expected; recording page shows an "applying…" hint
--                and polls /api/state until this column flips.
--   'done'     — bake has landed; recording page renders normally.
--
-- Legacy rows default to 'none' so they don't surface a banner that
-- never resolves. Older desktop clients (without expectsBake support)
-- also stay on 'none'.

ALTER TABLE recordings
  ADD COLUMN bake_status TEXT NOT NULL DEFAULT 'none'
  CHECK (bake_status IN ('none', 'expected', 'done'));
