DELETE FROM articles WHERE feed_id = (
    SELECT id FROM feeds WHERE title = 'Chaski Blog'
);

-- Delete the Chaski blog feed
DELETE FROM feeds WHERE title = 'Chaski Blog';

-- Delete the Chaski Blog Account
DELETE FROM accounts WHERE name = 'Chaski (Local Account)';
