CREATE TABLE feeds (
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

