-- Recording config + AI summary/chapters move from R2 JSON sidecars into the
-- row itself. They are tiny (config ~112 B; summary capped at 4 KB by
-- hydrateSummaryChapters), every read already has the row in hand, and R2
-- sidecars were the one object class the delete paths kept stranding.
-- NULL means "never customized" / "no summary yet"; readers hydrate through
-- parseRecordingConfigJson / parseSummaryChaptersJson, so bad blobs degrade
-- to defaults instead of breaking the page.
ALTER TABLE recordings ADD COLUMN config_json TEXT;
ALTER TABLE recordings ADD COLUMN summary_chapters_json TEXT;
