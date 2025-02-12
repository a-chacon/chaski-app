PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

CREATE TABLE feeds_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT NOT NULL,
    icon TEXT,
    last_fetch DATETIME,
    latest_entry DATETIME,
    kind TEXT NOT NULL,
    items_count INTEGER,
    folder TEXT,
    proxy TEXT DEFAULT "?" NOT NULL,
    entry_limit INTEGER DEFAULT 20 NOT NULL,
    history_limit INTEGER DEFAULT 200 NOT NULL,
    update_interval_minutes INTEGER DEFAULT 30 NOT NULL,
    notifications_enabled INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO feeds_new (
    id, title, description, link, icon, last_fetch, latest_entry, kind,
    items_count, folder, proxy, entry_limit, history_limit, update_interval_minutes,
    notifications_enabled, created_at, updated_at
)
SELECT id, title, description, link, icon, last_fetch, latest_entry, kind,
    items_count, folder, proxy, entry_limit, history_limit, update_interval_minutes,
    notifications_enabled, created_at, updated_at
FROM feeds;

DROP TABLE feeds;

ALTER TABLE feeds_new RENAME TO feeds;
COMMIT;

PRAGMA foreign_keys = ON;
