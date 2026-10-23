-- A thumbnail of the poster a few hundred bytes long (a JPEG data URL, see
-- lib/recording/poster-blur.ts), painted under the real image while it loads.
-- Set when the poster is uploaded; the hourly cron fills in older rows.
ALTER TABLE recordings ADD COLUMN poster_blur TEXT;
