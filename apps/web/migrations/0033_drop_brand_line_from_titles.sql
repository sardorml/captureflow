-- Auto-generated titles used to carry a marketing line. Renamed titles don't
-- contain it, so they are left as they are. instr, because D1 refuses LIKE
-- patterns over 50 bytes.
UPDATE recordings
   SET title = REPLACE(REPLACE(title, ' — CaptureFlow | Free Screen & Video Recording for macOS', ''), 'CaptureFlow | Free Screen & Video Recording for macOS', 'CaptureFlow recording')
 WHERE instr(title, 'CaptureFlow | Free Screen & Video Recording for macOS') > 0;

UPDATE screenshots
   SET title = REPLACE(REPLACE(title, ' — CaptureFlow | Free Screen & Video Recording for macOS', ''), 'CaptureFlow | Free Screen & Video Recording for macOS', 'CaptureFlow screenshot')
 WHERE instr(title, 'CaptureFlow | Free Screen & Video Recording for macOS') > 0;
