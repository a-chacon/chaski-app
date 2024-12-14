CREATE TRIGGER feeds_after_insert
AFTER INSERT ON feeds
BEGIN
    INSERT INTO feeds_fts (feed_id, title, description, link, folder)
    VALUES (new.id, new.title, new.description, new.link, new.folder);
END;

CREATE TRIGGER feeds_after_update
AFTER UPDATE ON feeds
BEGIN
    UPDATE feeds_fts
    SET title = new.title,
        description = new.description,
        link = new.link,
        folder = new.folder
    WHERE feed_id = old.id;
END;

CREATE TRIGGER feeds_after_delete
AFTER DELETE ON feeds
BEGIN
    DELETE FROM feeds_fts
    WHERE feed_id = old.id;
END;

-- Insert Trigger
CREATE TRIGGER articles_after_insert
AFTER INSERT ON articles
BEGIN
    INSERT INTO articles_fts (article_id, title, description)
    VALUES (new.id, new.title, new.description);
END;

-- Update Trigger
CREATE TRIGGER articles_after_update
AFTER UPDATE ON articles
BEGIN
    UPDATE articles_fts
    SET title = new.title,
        description = new.description
    WHERE article_id = old.id;
END;

-- Delete Trigger
CREATE TRIGGER articles_after_delete
AFTER DELETE ON articles
BEGIN
    DELETE FROM articles_fts
    WHERE article_id = old.id;
END;

