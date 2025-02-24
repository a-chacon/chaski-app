ALTER TABLE feeds ADD COLUMN default_entry_type TEXT NOT NULL DEFAULT 'article';
ALTER TABLE articles ADD COLUMN entry_type TEXT NOT NULL DEFAULT 'article';
