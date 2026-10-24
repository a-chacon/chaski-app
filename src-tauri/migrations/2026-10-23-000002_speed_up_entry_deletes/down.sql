DROP INDEX IF EXISTS entry_tags_entry_id_idx;
DROP INDEX IF EXISTS tags_entry_id_idx;
DROP INDEX IF EXISTS filters_feed_id_idx;

DROP TRIGGER IF EXISTS entries_after_insert;
DROP TRIGGER IF EXISTS entries_after_update;
DROP TRIGGER IF EXISTS entries_after_delete;

CREATE TRIGGER entries_after_insert
AFTER INSERT ON entries
BEGIN
    INSERT INTO entries_fts (entry_id, title, description)
    VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER entries_after_update
AFTER UPDATE OF title, description ON entries
BEGIN
    UPDATE entries_fts
    SET title = new.title, description = new.description
    WHERE entry_id = old.id;
END;

CREATE TRIGGER entries_after_delete
AFTER DELETE ON entries
BEGIN
    DELETE FROM entries_fts WHERE entry_id = old.id;
END;
