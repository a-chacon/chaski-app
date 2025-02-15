ALTER TABLE feeds ADD COLUMN default_content_type TEXT NOT NULL DEFAULT 'article';
ALTER TABLE articles ADD COLUMN content_type TEXT NOT NULL DEFAULT 'article';
