-- Remove the old Chaski blog feed
DELETE FROM feeds
WHERE title = 'Chaski Blog'
  AND link = 'https://chaski.a-chacon.com/rss.xml';

-- Remove the Chaski local account created for that feed, only if now unused
DELETE FROM accounts
WHERE name = 'Chaski (Local Account)'
  AND kind = 'local'
  AND NOT EXISTS (
    SELECT 1
    FROM feeds
    WHERE feeds.account_id = accounts.id
  );

