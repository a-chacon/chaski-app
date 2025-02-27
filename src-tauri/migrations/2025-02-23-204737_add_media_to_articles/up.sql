ALTER TABLE articles RENAME COLUMN image TO thumbnail;
ALTER TABLE articles ADD COLUMN media_content_url TEXT;
ALTER TABLE articles ADD COLUMN media_content_type TEXT;
