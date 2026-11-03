-- Auto-generated titles used to carry a marketing line. Renamed titles don't
-- contain it, so they are left as they are.
UPDATE recordings
   SET title = REPLACE(REPLACE(title, ' — CaptureFlow | Free Screen & Video Recording for macOS', ''), 'CaptureFlow | Free Screen & Video Recording for macOS', 'CaptureFlow recording')
 WHERE title LIKE '%CaptureFlow | Free Screen & Video Recording for macOS%';

UPDATE screenshots
   SET title = REPLACE(REPLACE(title, ' — CaptureFlow | Free Screen & Video Recording for macOS', ''), 'CaptureFlow | Free Screen & Video Recording for macOS', 'CaptureFlow screenshot')
 WHERE title LIKE '%CaptureFlow | Free Screen & Video Recording for macOS%';
