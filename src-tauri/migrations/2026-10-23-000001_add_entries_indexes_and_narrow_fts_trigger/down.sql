DROP INDEX IF EXISTS entries_feed_id_read_idx;
DROP INDEX IF EXISTS feeds_account_id_idx;

DROP TRIGGER IF EXISTS entries_after_update;
CREATE TRIGGER entries_after_update
AFTER UPDATE ON entries
BEGIN
    UPDATE entries_fts
    SET title = new.title, description = new.description
    WHERE entry_id = old.id;
END;
