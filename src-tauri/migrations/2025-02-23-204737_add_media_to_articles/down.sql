ALTER TABLE articles RENAME COLUMN thumbnail TO image;
ALTER TABLE articles DROP COLUMN media_content_url;
ALTER TABLE articles DROP COLUMN media_content_type;
