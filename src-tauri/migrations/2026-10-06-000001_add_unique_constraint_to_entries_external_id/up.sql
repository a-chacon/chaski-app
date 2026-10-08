CREATE UNIQUE INDEX IF NOT EXISTS entries_external_id_unique
    ON entries (external_id)
    WHERE external_id IS NOT NULL;
