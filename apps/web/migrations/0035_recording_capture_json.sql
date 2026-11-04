-- The devices a recording was made from and what the client did with them
-- (lib/recording/capture-report.ts), reported at /finalize so a recording
-- with no sound or camera can be traced. Rows from older clients keep NULL.
ALTER TABLE recordings ADD COLUMN capture_json TEXT;
