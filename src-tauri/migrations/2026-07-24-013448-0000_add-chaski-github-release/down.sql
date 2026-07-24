-- This file should undo anything in `up.sql`
DELETE FROM feeds
WHERE link = 'https://github.com/a-chacon/chaski-app/releases.atom';

