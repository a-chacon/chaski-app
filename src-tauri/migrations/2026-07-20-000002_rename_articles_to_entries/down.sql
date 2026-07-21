PRAGMA foreign_keys=OFF;

ALTER TABLE entries RENAME TO articles;
ALTER TABLE entry_tags RENAME TO article_tags;
ALTER TABLE tags RENAME COLUMN entry_id TO article_id;

CREATE VIRTUAL TABLE articles_fts USING fts5 (
  article_id, title, description, tokenize="trigram"
);

INSERT INTO articles_fts(article_id, title, description)
SELECT id, title, description FROM articles;

DROP TABLE IF EXISTS entries_fts;

DROP TRIGGER IF EXISTS entries_after_insert;
DROP TRIGGER IF EXISTS entries_after_update;
DROP TRIGGER IF EXISTS entries_after_delete;
DROP TRIGGER IF EXISTS articles_after_insert;
DROP TRIGGER IF EXISTS articles_after_update;
DROP TRIGGER IF EXISTS articles_after_delete;

CREATE TRIGGER articles_after_insert
AFTER INSERT ON articles
BEGIN
    INSERT INTO articles_fts (article_id, title, description)
    VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER articles_after_update
AFTER UPDATE ON articles
BEGIN
    UPDATE articles_fts
    SET title = new.title, description = new.description
    WHERE article_id = old.id;
END;

CREATE TRIGGER articles_after_delete
AFTER DELETE ON articles
BEGIN
    DELETE FROM articles_fts
    WHERE article_id = old.id;
END;

UPDATE feeds SET default_entry_type = 'article' WHERE default_entry_type = 'entry';
UPDATE articles SET entry_type = 'article' WHERE entry_type = 'entry';
UPDATE configurations SET name = 'ARTICLE_SCRAPE_MODE' WHERE name = 'ENTRY_SCRAPE_MODE';

PRAGMA foreign_keys=ON;
