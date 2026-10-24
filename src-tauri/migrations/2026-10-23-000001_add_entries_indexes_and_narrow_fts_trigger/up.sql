CREATE INDEX IF NOT EXISTS entries_feed_id_read_idx ON entries (feed_id, read);
CREATE INDEX IF NOT EXISTS feeds_account_id_idx ON feeds (account_id);

-- Only resync FTS when searchable columns change (not when marking as read).
DROP TRIGGER IF EXISTS entries_after_update;
CREATE TRIGGER entries_after_update
AFTER UPDATE OF title, description ON entries
BEGIN
    UPDATE entries_fts
    SET title = new.title, description = new.description
    WHERE entry_id = old.id;
END;
