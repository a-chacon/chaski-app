-- Your SQL goes here
INSERT INTO feeds (
    title,
    description,
    link,
    kind,
    folder,
    icon,
    entry_limit,
    history_limit,
    update_interval_minutes,
    notifications_enabled,
    created_at,
    updated_at,
    account_id,
    default_entry_type
)
SELECT
    'Chaski Releases',
    'Official release feed of the Chaski project',
    'https://github.com/a-chacon/chaski-app/releases.atom',
    'rss',
    'Quipu',
    'https://raw.githubusercontent.com/a-chacon/chaski-app/main/src-tauri/icons/icon.png',
    100,
    1000,
    60,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    (SELECT id FROM accounts WHERE kind = 'local' ORDER BY id ASC LIMIT 1),
    'entry'
WHERE NOT EXISTS (
    SELECT 1
    FROM feeds
    WHERE link = 'https://github.com/a-chacon/chaski-app/releases.atom'
);

