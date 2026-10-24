-- FK children: with foreign_keys=ON every deleted entry/feed scans these tables.
CREATE INDEX IF NOT EXISTS entry_tags_entry_id_idx ON entry_tags (entry_id);
CREATE INDEX IF NOT EXISTS tags_entry_id_idx ON tags (entry_id);
CREATE INDEX IF NOT EXISTS filters_feed_id_idx ON filters (feed_id);

-- Rebuild entries_fts so its rowid equals entries.id. Triggers can then
-- delete/update by rowid instead of a full FTS scan per row.
DROP TRIGGER IF EXISTS entries_after_insert;
DROP TRIGGER IF EXISTS entries_after_update;
DROP TRIGGER IF EXISTS entries_after_delete;
DROP TABLE IF EXISTS entries_fts;

CREATE VIRTUAL TABLE entries_fts USING fts5 (
  entry_id, title, description, tokenize="trigram"
);

INSERT INTO entries_fts(rowid, entry_id, title, description)
SELECT id, id, title, description FROM entries;

CREATE TRIGGER entries_after_insert
AFTER INSERT ON entries
BEGIN
    INSERT INTO entries_fts (rowid, entry_id, title, description)
    VALUES (new.id, new.id, new.title, new.description);
END;

CREATE TRIGGER entries_after_update
AFTER UPDATE OF title, description ON entries
BEGIN
    UPDATE entries_fts
    SET title = new.title, description = new.description
    WHERE rowid = old.id;
END;

CREATE TRIGGER entries_after_delete
AFTER DELETE ON entries
BEGIN
    DELETE FROM entries_fts WHERE rowid = old.id;
END;
