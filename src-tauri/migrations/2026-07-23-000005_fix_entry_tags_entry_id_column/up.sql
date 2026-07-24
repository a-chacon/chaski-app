PRAGMA foreign_keys=OFF;

ALTER TABLE entry_tags RENAME COLUMN article_id TO entry_id;

PRAGMA foreign_keys=ON;
