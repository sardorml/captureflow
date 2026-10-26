-- A card-sized JPEG of the poster (640 px wide, see lib/recording/poster-blur.ts)
-- under a content-addressed key so it can be cached forever. Set when the
-- poster is uploaded; the hourly cron fills in older rows.
ALTER TABLE recordings ADD COLUMN poster_thumb_key TEXT;
