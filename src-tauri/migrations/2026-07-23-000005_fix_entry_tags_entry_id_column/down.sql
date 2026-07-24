PRAGMA foreign_keys=OFF;

ALTER TABLE entry_tags RENAME COLUMN entry_id TO article_id;

PRAGMA foreign_keys=ON;
