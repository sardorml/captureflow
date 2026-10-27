-- What made each recording and how, for the admin's usage view: the client
-- ('extension' | 'desktop'), what it captured ('tab' | 'window' | 'screen') and
-- the quality preset (packages/engine/src/quality.ts). Reported by the client
-- at /init; rows from older clients keep NULLs.
ALTER TABLE recordings ADD COLUMN client TEXT;
ALTER TABLE recordings ADD COLUMN capture_source TEXT;
ALTER TABLE recordings ADD COLUMN quality TEXT;
