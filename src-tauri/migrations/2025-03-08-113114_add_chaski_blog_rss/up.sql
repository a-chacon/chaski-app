-- Insert a new account
INSERT INTO accounts (name, kind, created_at, updated_at)
VALUES ('Chaski (Local Account)', 'local', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Get the last inserted account ID
WITH last_account AS (
    SELECT id FROM accounts ORDER BY id DESC LIMIT 1
)

-- Insert the Chaski blog feed using the account ID
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
    'Chaski Blog',
    'Official blog of the Chaski project',
    'https://chaski.a-chacon.com/rss.xml',
    'rss',
    'Quipu',
    'https://chaski.a-chacon.com/chaski.png',
    100,
    1000,
    60,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    id,
    'article'
FROM last_account;
