-- Owners' own loads used to count. Drop their rows and recount from the
-- viewers table, so the count and the list say the same thing from here on.
DELETE FROM recording_views
 WHERE user_id IS NOT NULL
   AND user_id = (SELECT r.user_id FROM recordings AS r WHERE r.slug = recording_views.slug);

UPDATE recordings
   SET view_count = COALESCE(
     (SELECT SUM(v.views) FROM recording_views AS v WHERE v.slug = recordings.slug),
     0
   );
