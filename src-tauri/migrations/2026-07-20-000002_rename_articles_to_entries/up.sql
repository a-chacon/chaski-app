PRAGMA foreign_keys=OFF;

ALTER TABLE articles RENAME TO entries;
ALTER TABLE article_tags RENAME TO entry_tags;
ALTER TABLE tags RENAME COLUMN article_id TO entry_id;

CREATE VIRTUAL TABLE entries_fts USING fts5 (
  entry_id, title, description, tokenize="trigram"
);

INSERT INTO entries_fts(entry_id, title, description)
SELECT id, title, description FROM entries;

DROP TABLE IF EXISTS articles_fts;

DROP TRIGGER IF EXISTS articles_after_insert;
DROP TRIGGER IF EXISTS articles_after_update;
DROP TRIGGER IF EXISTS articles_after_delete;
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
AFTER UPDATE ON entries
BEGIN
    UPDATE entries_fts
    SET title = new.title, description = new.description
    WHERE entry_id = old.id;
END;

CREATE TRIGGER entries_after_delete
AFTER DELETE ON entries
BEGIN
    DELETE FROM entries_fts
    WHERE entry_id = old.id;
END;

UPDATE feeds SET default_entry_type = 'entry' WHERE default_entry_type = 'article';
UPDATE entries SET entry_type = 'entry' WHERE entry_type = 'article';
UPDATE configurations SET name = 'ENTRY_SCRAPE_MODE' WHERE name = 'ARTICLE_SCRAPE_MODE';

PRAGMA foreign_keys=ON;
