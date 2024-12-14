CREATE VIRTUAL TABLE feeds_fts USING fts5 (
  feed_id, title, description, link, folder, tokenize="trigram"
);

CREATE VIRTUAL TABLE articles_fts USING fts5 (
  article_id, title, description, tokenize="trigram"
);
